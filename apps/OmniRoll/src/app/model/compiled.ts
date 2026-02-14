import { Result } from './common';
import {
  DataModelComponent,
  DataModelGame,
  DataModelRandomizer,
  DataModelRandomizerGroup,
  DataModelRandomizerPick,
  DataModelRandomizerPool,
  DataModelRandomizerSlot,
  DataModelRandomizerVariable,
  DataModelRandomizerVariableInteger,
  DataModelSet,
  KeyPattern,
} from './data-model';
import { Expression, ExpressionLike } from './expression';

export class CompiledDataLocation {

  constructor(readonly path: {name: string, index?:string|number|[number,string]}[] = []) {}

  child(name: string): CompiledDataLocation {
    return new CompiledDataLocation(this.path.concat([{name}]));
  }
  index(name: string, index: string|number|[number,string]): CompiledDataLocation {
    return new CompiledDataLocation(this.path.concat([{name, index}]));
  }

  toString(): string {
    return this.path
      .map(({name,index}) => index !== undefined ? Array.isArray(index) ? `/${name}[${index.join(':')}]` : `/${name}[${index}]` : `/${name}`)
      .join('');
  }
}

export class CompiledDataError {
  constructor(
    public readonly location: CompiledDataLocation,
    public readonly message: string,
  ) {}

  toString(): string {
    return `${this.location}: ${this.message}`;
  }
}

interface CompiledElement {
  key: string;
  name?: string;
}
export class CompiledRegistry<E extends CompiledElement> {
  private items = new Map<string, {location: CompiledDataLocation, item: E}>();

  constructor(private kind: string) {}

  add(item: E, location: CompiledDataLocation): Result<E, CompiledDataError> {
    const exists = this.items.get(item.key);
    if (exists !== undefined) {
      return Result.err(new CompiledDataError(location, `${this.kind} ${JSON.stringify(item.name ?? item.key)} (${item.key}) already exists as ${JSON.stringify(exists.item.name ?? exists.item.key)} at ${exists.location}`), exists.item);
    }
    this.items.set(item.key, {location, item});
    return Result.ok(item);
  }
}

export class CompiledGame implements CompiledElement {
  key = '';
  name = '';
  components: CompiledComponent[] = [];
  randomizers: CompiledRandomizer[] = [];

  static newFromDataModel(spec: DataModelGame, location: CompiledDataLocation = new CompiledDataLocation()): Result<CompiledGame, CompiledDataError[]> {
    const errors: CompiledDataError[] = [];
    const components = new CompiledRegistry<CompiledComponent>('Component');
    const sets = new CompiledRegistry<CompiledSet>('Set');
    const randomizers = new CompiledRegistry<CompiledRandomizer>('Randomizer');

    const compiled = new CompiledGame();
    if (!KeyPattern.test(spec.key)) {
      errors.push(new CompiledDataError(location.child('key'), `Game key ${JSON.stringify(spec.key)} is invalid`));
    }
    compiled.key = spec.key;
    compiled.name = spec.name ?? spec.key;
    for (const [specIndex, specSet] of (spec.sets ?? []).entries()) {
      const setLocation = location.index('sets', [specIndex, specSet.key]);
      const setResult = CompiledSet.newFromDataModel(specSet, setLocation);
      if (setResult.err !== undefined) {
        errors.push(...setResult.err);
      }
      if (setResult.ok !== undefined) {
        const setRegistryResult = sets.add(setResult.ok, setLocation);
        if (setRegistryResult.err !== undefined) {
          errors.push(setRegistryResult.err);
        }
      }
      const componentsResult = CompiledComponent.fillFromDataModel(compiled.components, new Set(), specSet, {sets,components}, setLocation);
      if (componentsResult.err !== undefined) {
        errors.push(...componentsResult.err);
      }
    }
    for (const [randomizerIndex, specRandomizer] of (spec.randomizers ?? []).entries()) {
      const randomizerLocation = location.index('randomizers', [randomizerIndex, specRandomizer.key]);
      const result = CompiledRandomizer.newFromDataModel(specRandomizer, randomizerLocation);
      if (result.err !== undefined) {
        errors.push(...result.err);
      }
      if (result.ok !== undefined) {
        const addResult = randomizers.add(result.ok, randomizerLocation);
        if (addResult.err !== undefined) {
          errors.push(addResult.err);
        }
        compiled.randomizers.push(result.ok);
      }
    }

    return errors.length === 0 ? Result.ok(compiled) : Result.err(errors, compiled);
  }

  toJSON(): CompiledGameLike {
    return {
      ...this,
      components: this.components.map(c => c.toJSON()),
      randomizers: this.randomizers.map(c => c.toJSON()),
    };
  }
  static fromJSON(data: CompiledGameLike): CompiledGame {
    const result = new CompiledGame();
    result.key = data.key;
    result.name = data.name;
    result.components = data.components.map(c => CompiledComponent.fromJSON(c));
    result.randomizers = data.randomizers.map(r => CompiledRandomizer.fromJSON(r));
    return result;
  }
}
export interface CompiledGameLike {
  key: string;
  name: string;
  components: CompiledComponentLike[];
  randomizers: CompiledRandomizerLike[];
}

export class CompiledSet implements CompiledElement {
  key = '';
  name = '';

  static newFromDataModel(spec: DataModelSet, location: CompiledDataLocation = new CompiledDataLocation()): Result<CompiledSet, CompiledDataError[]> {
    const errors: CompiledDataError[] = [];

    if (!KeyPattern.test(spec.key)) {
      errors.push(new CompiledDataError(location.child('key'), `Set key ${JSON.stringify(spec.key)} is invalid`));
    }

    const compiled = new CompiledSet();
    compiled.key = spec.key;
    compiled.name = spec.name ?? spec.key;

    return errors.length === 0 ? Result.ok(compiled) : Result.err(errors, compiled);
  }
}

export class CompiledComponent implements CompiledElement {
  key = '';
  name = '';
  sets = new Set<string>();
  kinds = new Set<string>();
  [key: string]: boolean|number|string|Set<string>|((...args: unknown[]) => unknown);

  static fillFromDataModel(output: CompiledComponent[], parentSets: Set<string>, spec: DataModelSet, registries: {sets: CompiledRegistry<CompiledSet>, components: CompiledRegistry<CompiledComponent>}|undefined, location: CompiledDataLocation = new CompiledDataLocation()): Result<CompiledComponent[], CompiledDataError[]> {
    const errors: CompiledDataError[] = [];

    const sets = new Set(parentSets);
    sets.add(spec.key);

    for (const [setIndex, childSet] of (spec.sets ?? []).entries()) {
      const setLocation = location.index('sets', [setIndex, childSet.key]);
      const setResult = CompiledSet.newFromDataModel(childSet);
      if (setResult.err !== undefined) {
        errors.push(...setResult.err);
      }
      if (setResult.ok !== undefined) {
        if (registries?.sets !== undefined) {
          const setRegistryResult = registries.sets.add(setResult.ok, setLocation);
          if (setRegistryResult.err !== undefined) {
            errors.push(setRegistryResult.err);
          }
        }
      }
      const result = this.fillFromDataModel(output, sets, childSet, registries, setLocation);
      if (result.err !== undefined) {
        errors.push(...result.err);
      }
    }
    for (const kind in spec.components) {
      const specComponents = spec.components[kind];
      const kindLocation = location.index('components', kind);
      for (const [componentIndex, specComponent] of specComponents.entries()) {
        const componentLocation = kindLocation.index('', [componentIndex, specComponent.key]);
        const result = this.newFromDataModel(sets, kind, specComponent, componentLocation);
        if (result.err !== undefined) {
          errors.push(...result.err);
        }
        if (result.ok !== undefined) {
          if (registries?.components !== undefined) {
            const componentRegistryResult = registries.components.add(result.ok, componentLocation);
            if (componentRegistryResult.err !== undefined) {
              errors.push(componentRegistryResult.err);
            }
          }
          output.push(result.ok);
        }
      }
    }
    return errors.length === 0 ? Result.ok(output) : Result.err(errors, output);
  }

  static newFromDataModel(parentsSets: Set<string>, kind: string, spec: DataModelComponent, location: CompiledDataLocation): Result<CompiledComponent, CompiledDataError[]> {
    const errors: CompiledDataError[] = [];

    if (!KeyPattern.test(spec.key)) {
      errors.push(new CompiledDataError(location.child('key'), `Component key ${JSON.stringify(spec.key)} is invalid`));
    }
    const compiled = new CompiledComponent();

    const commonProperties = new Set(Object.keys(compiled));
    for (const [propertyKey, propertyValue] of Object.entries(spec.properties ?? {})) {
      if (!commonProperties.has(propertyKey)) {
        compiled[propertyKey] = Array.isArray(propertyValue) ? new Set<string>(propertyValue) : propertyValue;
      }
    }

    compiled.key = spec.key;
    compiled.name = spec.name ?? spec.key;
    compiled.sets = new Set(parentsSets);
    compiled.kinds.add(kind);

    return errors.length === 0 ? Result.ok(compiled) : Result.err(errors, compiled);
  }

  toJSON(): CompiledComponentLike {
    const result = {} as CompiledComponentLike;
    for (const [key, value] of Object.entries(this)) {
      if (typeof value !== 'function') {
        result[key] = value instanceof Set ? [...value] : value;
      }
    }
    return result;
  }
  static fromJSON(data: CompiledComponentLike): CompiledComponent {
    const result = new CompiledComponent();
    result.key = data.key;
    result.name = data.name;
    result.sets = new Set(data.sets);
    result.kinds = new Set(data.kinds);
    return result;
  }
}
export interface CompiledComponentLike extends Record<string, boolean|number|string|string[]> {
  key: string;
  name: string;
  sets: string[];
  kinds: string[];
}

export class CompiledRandomizer implements CompiledElement {
  key = '';
  name = '';
  variables: CompiledRandomizerVariable[] = [];
  pools: CompiledRandomizerPool[] = [];
  groups: CompiledRandomizerGroup[] = [];
  slots: CompiledRandomizerSlot[] = [];

  static newFromDataModel(spec: DataModelRandomizer, location: CompiledDataLocation = new CompiledDataLocation()): Result<CompiledRandomizer, CompiledDataError[]> {
    const errors: CompiledDataError[] = [];

    const pools = new CompiledRegistry<CompiledRandomizerPool>('Randomizer pool');
    const groups = new CompiledRegistry<CompiledRandomizerGroup>('Randomizer group');
    const slots = new CompiledRegistry<CompiledRandomizerSlot>('Randomizer slot');

    if (!KeyPattern.test(spec.key)) {
      errors.push(new CompiledDataError(location.child('key'), `Randomizer key ${JSON.stringify(spec.key)} is invalid`));
    }
    const compiled = new CompiledRandomizer();
    compiled.key = spec.key;
    compiled.name = spec.name ?? spec.key;

    for (const [variableIndex, variableSpec] of (spec.variables ?? []).entries()) {
      const variableLocation = location.index('variables', [variableIndex, variableSpec.key]);
      const result = CompiledRandomizerVariable.newFromDataModel(variableSpec, variableLocation);
      if (result.err !== undefined) {
        errors.push(...result.err);
      }
      if (result.ok !== undefined) {
        compiled.variables.push(result.ok);
      }
    }

    for (const [poolIndex, poolSpec] of (spec.pools ?? []).entries()) {
      const poolLocation = location.index('pools', [poolIndex, poolSpec.key]);
      const result = CompiledRandomizerPool.newFromDataModel(poolSpec, poolLocation);
      if (result.err !== undefined) {
        errors.push(...result.err);
      }
      if (result.ok !== undefined) {
        const addPoolResult = pools.add(result.ok, poolLocation);
        if (addPoolResult.err !== undefined) {
          errors.push(addPoolResult.err);
        }
        compiled.pools.push(result.ok);
      }
    }
    for (const [groupIndex, groupSpec] of (spec.groups ?? []).entries()) {
      const groupLocation = location.index('groups', [groupIndex, groupSpec.key]);
      const result = CompiledRandomizerGroup.newFromDataModel(groupSpec, groupLocation);
      if (result.err !== undefined) {
        errors.push(...result.err);
      }
      if (result.ok !== undefined) {
        const addGroupResult = groups.add(result.ok, groupLocation);
        if (addGroupResult.err !== undefined) {
          errors.push(addGroupResult.err);
        }
        compiled.groups.push(result.ok);
      }
    }
    for (const [slotIndex, slotSpec] of (spec.slots ?? []).entries()) {
      const slotLocation = location.index('slots', [slotIndex, slotSpec.key]);
      const result = CompiledRandomizerSlot.newFromDataModel(slotSpec, compiled, slotLocation);
      if (result.err !== undefined) {
        errors.push(...result.err);
      }
      if (result.ok !== undefined) {
        const addSlotResult = slots.add(result.ok, slotLocation);
        if (addSlotResult.err !== undefined) {
          errors.push(addSlotResult.err);
        }
        compiled.slots.push(result.ok);
      }
    }
    return errors.length === 0 ? Result.ok(compiled) : Result.err(errors, compiled);
  }

  toJSON(): CompiledRandomizerLike {
    return {
      ...this,
      pools: this.pools.map(p => p.toJSON()),
      groups: this.groups.map(g => g.toJSON()),
      slots: this.slots.map(s => s.toJSON()),
    };
  }
  static fromJSON(data: CompiledRandomizerLike): CompiledRandomizer {
    const result = new CompiledRandomizer();
    result.key = data.key;
    result.name = data.name;
    result.pools = data.pools.map(p => CompiledRandomizerPool.fromJSON(p));
    result.groups = data.groups.map(g => CompiledRandomizerGroup.fromJSON(g));
    result.slots = data.slots.map(s => CompiledRandomizerSlot.fromJSON(s));
    return result;
  }
}
export interface CompiledRandomizerLike {
  key: string;
  name: string;
  pools: CompiledRandomizerPoolLike[];
  groups: CompiledRandomizerGroupLike[];
  slots: CompiledRandomizerSlotLike[];
}

export class CompiledRandomizerVariable implements CompiledElement {
  protected constructor(
    public key: string,
    public name: string,
  ) {}

  toJSON(): CompiledRandomizerVariableLike {
    return {
      key: this.key,
      name: this.name,
      type: null,
    };
  }

  static newFromDataModel(spec: DataModelRandomizerVariable, location: CompiledDataLocation = new CompiledDataLocation()): Result<CompiledRandomizerVariable, CompiledDataError[]> {
    switch (spec.type) {
      case 'integer':
        return CompiledRandomizerVariableInteger.newFromDataModel(spec, location);
      default:
        return Result.err(
          [new CompiledDataError(
            location.child('type'),
            `Unsupported randomizer variable type ${JSON.stringify(spec.type)}`
          )],
          new CompiledRandomizerVariable(spec.key, spec.name ?? spec.key),
        );
    }
  }

  static fromJSON(data: CompiledRandomizerVariableLike): CompiledRandomizerVariable {
    switch (true) {
      case CompiledRandomizerVariableInteger.isJSON(data):
        return CompiledRandomizerVariableInteger.fromJSON(data);
      default:
        throw new Error(`Unsupported JSON randomizer variable:\n${JSON.stringify(data, undefined, 2)}`);
    }
  }
}
export class CompiledRandomizerVariableInteger extends CompiledRandomizerVariable {
  min = 0;
  max = 100;
  default = 0;

  constructor(key: string, name: string) {
    super(key, name);
  }

  static override newFromDataModel(spec: DataModelRandomizerVariableInteger, location: CompiledDataLocation = new CompiledDataLocation()): Result<CompiledRandomizerVariableInteger, CompiledDataError[]> {
    const errors: CompiledDataError[] = [];
    if (!KeyPattern.test(spec.key)) {
      errors.push(new CompiledDataError(location.child('key'), `Randomizer variable key ${JSON.stringify(spec.key)} is invalid`));
    }
    const compiled = new CompiledRandomizerVariableInteger(spec.key, spec.name ?? spec.key);
    if (spec.min !== undefined) {
      compiled.min = spec.min;
    }
    if (spec.max !== undefined) {
      compiled.max = spec.max;
    }
    if (spec.default !== undefined) {
      compiled.default = spec.default;
    }
    if (compiled.min >= compiled.max) {
      errors.push(new CompiledDataError(location, `Randomizer variable min ${compiled.min} must be less than max ${compiled.max}`));
    }
    if (compiled.default < compiled.min || compiled.default > compiled.max) {
      errors.push(new CompiledDataError(location, `Randomizer variable default ${compiled.default} must be between min ${compiled.min} and max ${compiled.max}`));
    }
    return errors.length === 0 ? Result.ok(compiled) : Result.err(errors, compiled);
  }

  override toJSON(): CompiledRandomizerVariableIntegerLike {
    return {
      key: this.key,
      name: this.name,
      type: 'integer',
      min: this.min,
      max: this.max,
      default: this.default,
    };
  }
  static isJSON(data: CompiledRandomizerVariableLike): data is CompiledRandomizerVariableIntegerLike {
    return 'type' in data && data.type === 'integer';
  }
  static override fromJSON(data: CompiledRandomizerVariableIntegerLike): CompiledRandomizerVariableInteger {
    const result = new CompiledRandomizerVariableInteger(data.key, data.name);
    result.min = data.min ?? result.min;
    result.max = data.max ?? result.max;
    result.default = data.default ?? result.default;
    return result;
  }
}
export type CompiledRandomizerVariableLike = CompiledRandomizerVariableAbstractLike | CompiledRandomizerVariableIntegerLike;
export interface CompiledRandomizerVariableAbstractLike {
  key: string;
  name: string;
  type: null;
}
export interface CompiledRandomizerVariableIntegerLike {
  key: string;
  name: string;
  type: 'integer';
  min?: number;
  max?: number;
  default?: number;
}

export class CompiledRandomizerPool implements CompiledElement {
  key = '';
  criteria?: Expression;

  static newFromDataModel(spec: DataModelRandomizerPool, location: CompiledDataLocation = new CompiledDataLocation()): Result<CompiledRandomizerPool, CompiledDataError[]> {
    const errors: CompiledDataError[] = [];
    if (!KeyPattern.test(spec.key)) {
      errors.push(new CompiledDataError(location.child('key'), `Randomizer pool key ${JSON.stringify(spec.key)} is invalid`));
    }
    const compiled = new CompiledRandomizerPool();
    compiled.key = spec.key;
    if (spec.criteria !== undefined) {
      const criteriaResult = Expression.compile(spec.criteria);
      if (criteriaResult.err !== undefined) {
        errors.push(new CompiledDataError(
          location.child('criteria'),
          `${criteriaResult.err}`,
        ));
      }
      if (criteriaResult.ok !== undefined) {
        compiled.criteria = criteriaResult.ok;
      }
    }
    return errors.length === 0 ? Result.ok(compiled) : Result.err(errors, compiled);
  }

  test(component: CompiledComponent): boolean {
    return this.criteria === undefined || this.criteria.resolveAsBoolean({ component });
  }

  toJSON(): CompiledRandomizerPoolLike {
    return {
      ...this,
      criteria: this.criteria?.toJSON(),
    };
  }
  static fromJSON(data: CompiledRandomizerPoolLike): CompiledRandomizerPool {
    const result = new CompiledRandomizerPool();
    result.key = data.key;
    if (data.criteria !== undefined) {
      result.criteria = Expression.fromJSON(data.criteria);
    }
    return result;
  }
}
export interface CompiledRandomizerPoolLike {
  key: string;
  criteria?: ExpressionLike;
}

export class CompiledRandomizerGroup implements CompiledElement {
  key = '';
  name = '';

  static newFromDataModel(spec: DataModelRandomizerGroup, location: CompiledDataLocation): Result<CompiledRandomizerGroup, CompiledDataError[]> {
    const errors: CompiledDataError[] = [];
    if (!KeyPattern.test(spec.key)) {
      errors.push(new CompiledDataError(location.child('key'), `Randomizer group key ${JSON.stringify(spec.key)} is invalid`));
    }
    const compiled = new CompiledRandomizerGroup();
    compiled.key  = spec.key;
    compiled.name = spec.name ?? compiled.key;
    return errors.length === 0 ? Result.ok(compiled) : Result.err(errors, compiled);
  }

  toJSON(): CompiledRandomizerGroupLike {
    return {
      ...this,
    };
  }
  static fromJSON(data: CompiledRandomizerGroupLike): CompiledRandomizerGroup {
    const result = new CompiledRandomizerGroup();
    result.key = data.key;
    result.name = data.name;
    return result;
  }
}
export interface CompiledRandomizerGroupLike {
  key: string;
  name: string;
}

export class CompiledRandomizerSlot implements CompiledElement {
  key = '';
  name = '';
  count: Expression = Expression.literal(1);
  pool = '';
  group: string|undefined = undefined;
  pick: DataModelRandomizerPick = 'remove';
  criteria?: Expression;

  static newFromDataModel(spec: DataModelRandomizerSlot, parent: CompiledRandomizer|undefined, location: CompiledDataLocation = new CompiledDataLocation()): Result<CompiledRandomizerSlot, CompiledDataError[]> {
    const errors: CompiledDataError[] = [];
    const compiled = new CompiledRandomizerSlot();

    if (!KeyPattern.test(spec.key)) {
      errors.push(new CompiledDataError(location.child('key'), `Randomizer slot key ${JSON.stringify(spec.key)} is invalid`));
    }
    compiled.key = spec.key;
    compiled.name = spec.name ?? spec.key;
    compiled.pool = spec.pool;

    switch (typeof spec.count) {
      case 'number':
        if (spec.count <= 0) {
          errors.push(new CompiledDataError(location.child('count'), `Randomizer slot count ${spec.count} must be greater than 0`));
        } else {
          compiled.count = Expression.literal(spec.count);
        }
        break;
      case 'string': {
        const countResult = Expression.compile(spec.count);
        if (countResult.err !== undefined) {
          errors.push(new CompiledDataError(location.child('count'), `${countResult.err}`));
        }
        if (countResult.ok !== undefined) {
          compiled.count = countResult.ok;
        }
        break;
      }
    }

    compiled.group = spec.group;
    if (parent !== undefined) {
      if (parent.groups.length > 0) {
        if (!compiled.group) {
          errors.push(new CompiledDataError(
            location.child('group'),
            `Randomizer slot group is required. Must be one of: ${parent.groups.map(g => g.key).join(`, `)}`,
          ));
        } else {
          if (!parent.groups.some(g => g.key === compiled.group)) {
            errors.push(new CompiledDataError(
              location.child('group'),
              `Randomizer slot group ${JSON.stringify(compiled.group)} is invalid. Must be one of: ${parent.groups.map(g => g.key).join(`, `)}`,
            ));
          }
        }
      } else {
        if (compiled.group) {
          errors.push(new CompiledDataError(
            location.child('group'),
            `Randomizer slot group ${JSON.stringify(compiled.group)} is provided but none is expected`,
          ));
        }
      }
    }

    compiled.pick = spec.pick ?? compiled.pick;

    if (spec.criteria !== undefined) {
      const criteriaResult = Expression.compile(spec.criteria);
      if (criteriaResult.err !== undefined) {
        errors.push(new CompiledDataError(
          location.child('criteria'),
          `${criteriaResult.err}`,
        ));
      }
      if (criteriaResult.ok !== undefined) {
        compiled.criteria = criteriaResult.ok;
      }
    }
    return errors.length === 0 ? Result.ok(compiled) : Result.err(errors, compiled);
  }

  test(component: CompiledComponent): boolean {
    return this.criteria === undefined || this.criteria.resolveAsBoolean({component});
  }

  toJSON(): CompiledRandomizerSlotLike {
    return {
      ...this,
      count: this.count.toJSON(),
      criteria: this.criteria?.toJSON(),
    };
  }
  static fromJSON(data: CompiledRandomizerSlotLike): CompiledRandomizerSlot {
    const result = new CompiledRandomizerSlot();
    result.key = data.key;
    result.name = data.name;
    result.count = Expression.fromJSON(data.count);
    result.pool = data.pool;
    result.group = data.group;
    if (data.criteria !== undefined) {
      result.criteria = Expression.fromJSON(data.criteria);
    }
    return result;
  }
}
export interface CompiledRandomizerSlotLike {
  key: string;
  name: string;
  count: ExpressionLike;
  pool: string;
  group: string|undefined;
  pick: DataModelRandomizerPick;
  criteria?: ExpressionLike;
}
