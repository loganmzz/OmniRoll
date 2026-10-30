import {
  DataError,
  DataErrors,
  DataLocation,
  Result,
} from './common';
import {
  Expression,
  ExpressionLike,
} from './expression';
import {
  KeyPattern,
  ReferentialComponent,
  ReferentialConditional,
  ReferentialGame,
  ReferentialRandomizer,
  ReferentialRandomizerGroup,
  ReferentialRandomizerPick,
  ReferentialRandomizerPool,
  ReferentialRandomizerSlot,
  ReferentialRandomizerVariable,
  ReferentialRandomizerVariableInteger,
  ReferentialSet,
} from './referential';

export interface CompiledCondition {
  sets: Set<string>;
  features: Set<string>;
}
export interface CompiledConditional<T> {
  content: T;
  needs?: CompiledCondition;
}
export type CompiledConditionals<T> = {
  [K in keyof T]: CompiledConditional<T[K]>[];
};
export interface Compilation<T, C> {
  content: T;
  conditionals: CompiledConditionals<C>;
}
export type CompilationResult<T> = Result<T, DataErrors>;

export type GameCompilation = Compilation<CompiledGame, {components: CompiledComponent, randomizers: CompiledRandomizer}>;
export type GameCompilationResult = CompilationResult<GameCompilation>;

export type ComponentCompilation = CompiledConditional<CompiledComponent>;
export type ComponentCompilationResult = CompilationResult<ComponentCompilation>;

export type ComponentSetCompilation = Compilation<CompiledComponent[], {components: CompiledComponent}>;
export type ComponentSetCompilationResult = CompilationResult<ComponentSetCompilation>;

export type RandomizerCompilation = CompiledConditional<CompiledRandomizer>;
export type RandomizerCompilationResult = CompilationResult<RandomizerCompilation>;

interface CompiledElement {
  key: string;
  name?: string;
}
export class CompiledRegistry<E extends CompiledElement> {
  private items = new Map<string, {location: DataLocation, item: E}>();

  constructor(private kind: string) {}

  add(item: E, location: DataLocation): Result<E, DataError> {
    const exists = this.items.get(item.key);
    if (exists !== undefined) {
      return Result.err(new DataError(location, `${this.kind} ${JSON.stringify(item.name ?? item.key)} (${item.key}) already exists as ${JSON.stringify(exists.item.name ?? exists.item.key)} at ${exists.location}`), exists.item);
    }
    this.items.set(item.key, {location, item});
    return Result.ok(item);
  }
}

export class CompiledGame implements CompiledElement {
  key = '';
  name = '';
  features: Set<string> = new Set();
  components: CompiledComponent[] = [];
  randomizers: CompiledRandomizer[] = [];

  static newFromDataModel(spec: ReferentialGame, location: DataLocation = new DataLocation()): GameCompilationResult {
    const errors: DataErrors = new DataErrors();
    const components = new CompiledRegistry<CompiledComponent>('Component');
    const sets = new CompiledRegistry<CompiledSet>('Set');
    const randomizers = new CompiledRegistry<CompiledRandomizer>('Randomizer');


    const compiled = new CompiledGame();
    const compilation: GameCompilation = {
      content: compiled,
      conditionals: {
        components: [],
        randomizers: [],
      },
    };
    if (!KeyPattern.test(spec.key)) {
      errors.addError(new DataError(location.child('key'), `Game key ${JSON.stringify(spec.key)} is invalid`));
    }
    compiled.key = spec.key;
    compiled.name = spec.name ?? spec.key;
    for (const [specIndex, specSet] of (spec.sets ?? []).entries()) {
      const setLocation = location.index('sets', [specIndex, specSet.key]);
      const setResult = CompiledSet.newFromDataModel(specSet, setLocation);
      if (setResult.err !== undefined) {
        errors.addErrors(setResult.err);
      }
      if (setResult.ok !== undefined) {
        const setRegistryResult = sets.add(setResult.ok, setLocation);
        if (setRegistryResult.err !== undefined) {
          errors.addError(setRegistryResult.err);
        }
      }
      const componentsResult = CompiledComponent.newFromDataModelSet({sets: new Set(), features: new Set()}, specSet, {sets, components}, setLocation);
      if (componentsResult.err !== undefined) {
        errors.addErrors(componentsResult.err);
      }
      if (componentsResult.ok !== undefined) {
        compiled.components.push(...componentsResult.ok.content);
        compilation.conditionals.components.push(...componentsResult.ok.conditionals.components);
      }
    }
    for (const component of compiled.components) {
      for (const feature of component.features) {
        compiled.features.add(feature);
      }
    }
    for (const [randomizerIndex, specRandomizer] of (spec.randomizers ?? []).entries()) {
      const randomizerLocation = location.index('randomizers', [randomizerIndex, specRandomizer.key]);
      const result = CompiledRandomizer.newFromDataModel(specRandomizer, randomizerLocation);
      if (result.err !== undefined) {
        errors.addErrors(result.err);
      }
      if (result.ok !== undefined) {
        const compiled = result.ok;
        const addResult = randomizers.add(compiled.content, randomizerLocation);
        if (addResult.err !== undefined) {
          errors.addError(addResult.err);
        }
        if (result.ok.needs === undefined) {
          compilation.content.randomizers.push(compiled.content);
        } else {
          compilation.conditionals.randomizers.push(compiled);
        }
      }
    }

    return errors.length === 0 ? Result.ok(compilation) : Result.err(errors, compilation);
  }

  applySelection(sets: Set<string>, components: CompiledConditional<CompiledComponent>[], randomizers: CompiledConditional<CompiledRandomizer>[]): void {
    this.components = this.components.filter(c => !c.sets.isDisjointFrom(sets));

    const computeSets = (): Set<string> => this.components.reduce((sets, comp) => {
      for (const set of comp.sets) {
        sets.add(set);
      }
      return sets;
    }, new Set<string>());
    const computeFeatures = (): Set<string> => this.components.reduce((features, comp) => {
      for (const feature of comp.features) {
        features.add(feature);
      }
      return features;
    }, new Set<string>());

    let previousSetSize = -1;
    let previousFeatureSize = -1;
    const currentSets = computeSets();
    this.features = computeFeatures();
    while (previousSetSize != currentSets.size || previousFeatureSize != this.features.size) {
      previousSetSize = currentSets.size;
      previousFeatureSize = this.features.size;

      components = components.filter(({content, needs}) => {
        const add =
          needs === undefined ||
          !content.sets.isDisjointFrom(sets) && needs.sets.isSubsetOf(currentSets) && needs.features.isSubsetOf(this.features);
        if (add) {
          this.components.push(content);
          for (const set of content.sets) {
            currentSets.add(set);
          }
          for (const feature of content.features) {
            this.features.add(feature);
          }
        }
        return !add;
      });
      if (components.length === 0) {
        break;
      }
    }

    for (const {content, needs} of randomizers) {
      const add =
        needs === undefined ||
        needs.sets.isSubsetOf(currentSets) && needs.features.isSubsetOf(this.features);
      if (add) {
        this.randomizers.push(content);
      }
    }
  }

  toJSON(): CompiledGameLike {
    return {
      ...this,
      features: Array.from(this.features),
      components: this.components.map(c => c.toJSON()),
      randomizers: this.randomizers.map(c => c.toJSON()),
    };
  }
  static fromJSON(data: CompiledGameLike): CompiledGame {
    const result = new CompiledGame();
    result.key = data.key;
    result.name = data.name;
    result.features = new Set(data.features ?? []);
    result.components = data.components.map(c => CompiledComponent.fromJSON(c));
    result.randomizers = data.randomizers.map(r => CompiledRandomizer.fromJSON(r));
    return result;
  }
}
export interface CompiledGameLike {
  key: string;
  name: string;
  features: string[];
  components: CompiledComponentLike[];
  randomizers: CompiledRandomizerLike[];
}

export class CompiledSet implements CompiledElement {
  key = '';
  name = '';

  static newFromDataModel(spec: ReferentialSet, location: DataLocation = new DataLocation()): Result<CompiledSet, DataErrors> {
    const errors: DataErrors = new DataErrors();

    if (!KeyPattern.test(spec.key)) {
      errors.addError(new DataError(location.child('key'), `Set key ${JSON.stringify(spec.key)} is invalid`));
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
  features = new Set<string>();
  sets = new Set<string>();
  kinds = new Set<string>();
  [key: string]: boolean|number|string|Set<string>|((...args: unknown[]) => unknown);

  static newFromDataModelSet(parents: {sets: Set<string>, features: Set<string>}, spec: ReferentialSet, registries: {sets: CompiledRegistry<CompiledSet>, components: CompiledRegistry<CompiledComponent>}|undefined = undefined, location: DataLocation = new DataLocation()): ComponentSetCompilationResult {
    const compilation: ComponentSetCompilation = {
      content: [],
      conditionals: {
        components: [],
      },
    };
    const errors: DataErrors = new DataErrors();

    const features = new Set(parents.features);
    for (const [index, feature] of (spec.features ?? []).entries()) {
      if (typeof feature !== 'string') {
        errors.addError(new DataError(location.index('features', index), `Feature should be a string (${JSON.stringify(feature)})`));
        continue;
      }
      features.add(feature);
    }

    const sets = new Set(parents.sets);
    sets.add(spec.key);

    for (const [setIndex, childSet] of (spec.sets ?? []).entries()) {
      const setLocation = location.index('sets', [setIndex, childSet.key]);
      const setResult = CompiledSet.newFromDataModel(childSet, setLocation);
      if (setResult.err !== undefined) {
        errors.addErrors(setResult.err);
      }
      if (setResult.ok !== undefined) {
        if (registries?.sets !== undefined) {
          const setRegistryResult = registries.sets.add(setResult.ok, setLocation);
          if (setRegistryResult.err !== undefined) {
            errors.addError(setRegistryResult.err);
          }
        }
      }
      const result = this.newFromDataModelSet({sets, features}, childSet, registries, setLocation);
      if (result.err !== undefined) {
        errors.addErrors(result.err);
      }
      if (result.ok !== undefined) {
        compilation.content.push(...result.ok.content);
        compilation.conditionals.components.push(...result.ok.conditionals.components);
      }
    }
    if (spec.components !== undefined && (typeof spec.components !== 'object' || Array.isArray(spec.components))) {
      errors.addError(new DataError(location.child('components'), `Components should be an object (${typeof spec.components})`));
    } else {
      for (const kind in spec.components) {
        const specComponents = spec.components[kind];
        const kindLocation = location.index('components', kind);
        for (const [componentIndex, specComponent] of specComponents.entries()) {
          const componentLocation = kindLocation.index('', [componentIndex, specComponent.key]);
          const result = this.newFromDataModel({sets, features}, kind, specComponent, componentLocation);
          if (result.err !== undefined) {
            errors.addErrors(result.err);
          }
          if (result.ok !== undefined) {
            const compiled = result.ok;
            if (registries?.components !== undefined) {
              const componentRegistryResult = registries.components.add(compiled.content, componentLocation);
              if (componentRegistryResult.err !== undefined) {
                errors.addError(componentRegistryResult.err);
              }
            }
            if (compiled.needs === undefined) {
              compilation.content.push(compiled.content);
            } else {
              compilation.conditionals.components.push(compiled);
            }
          }
        }
      }
    }
    return errors.length === 0 ? Result.ok(compilation) : Result.err(errors, compilation);
  }

  static newFromDataModel(parents: {sets: Set<string>, features: Set<string>}, kind: string, spec: ReferentialComponent, location: DataLocation = new DataLocation()): ComponentCompilationResult {
    const errors: DataErrors = new DataErrors();

    if (!KeyPattern.test(spec.key)) {
      errors.addError(new DataError(location.child('key'), `Component key ${JSON.stringify(spec.key)} is invalid. It doesn't match ${KeyPattern}`));
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
    compiled.features = new Set(parents.features);
    for (const [index, feature] of (spec.features ?? []).entries()) {
      if (typeof feature !== 'string') {
        errors.addError(new DataError(location.index('features', index), `Feature should be a string (${JSON.stringify(feature)})`));
        continue;
      }
      compiled.features.add(feature);
    }
    compiled.sets = new Set(parents.sets);
    compiled.kinds.add(kind);

    return compileWithNeeds(spec, compiled, location, errors);
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
    result.features = new Set(data.features);
    result.sets = new Set(data.sets);
    result.kinds = new Set(data.kinds);

    const commonProperties = new Set(Object.keys(result));
    for (const [propertyKey, propertyValue] of Object.entries(data)) {
      if (!commonProperties.has(propertyKey)) {
        result[propertyKey] = Array.isArray(propertyValue) ? new Set<string>(propertyValue) : propertyValue;
      }
    }
    return result;
  }
}
export interface CompiledComponentLike extends Record<string, boolean|number|string|string[]> {
  key: string;
  name: string;
  features: string[];
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

  static newFromDataModel(spec: ReferentialRandomizer, location: DataLocation = new DataLocation()): RandomizerCompilationResult {
    const errors: DataErrors = new DataErrors();

    const variables = new CompiledRegistry<CompiledRandomizerVariable>('Randomizer variable');
    const pools = new CompiledRegistry<CompiledRandomizerPool>('Randomizer pool');
    const groups = new CompiledRegistry<CompiledRandomizerGroup>('Randomizer group');
    const slots = new CompiledRegistry<CompiledRandomizerSlot>('Randomizer slot');

    if (!KeyPattern.test(spec.key)) {
      errors.addError(new DataError(location.child('key'), `Randomizer key ${JSON.stringify(spec.key)} is invalid`));
    }
    const compiled = new CompiledRandomizer();
    compiled.key = spec.key;
    compiled.name = spec.name ?? spec.key;

    for (const [variableIndex, variableSpec] of (spec.variables ?? []).entries()) {
      const variableLocation = location.index('variables', [variableIndex, variableSpec.key]);
      const result = CompiledRandomizerVariable.newFromDataModel(variableSpec, variableLocation);
      if (result.err !== undefined) {
        errors.addErrors(result.err);
      }
      if (result.ok !== undefined) {
        const addVariableResult = variables.add(result.ok, variableLocation);
        if (addVariableResult.err !== undefined) {
          errors.addError(addVariableResult.err);
        }
        compiled.variables.push(result.ok);
      }
    }

    for (const [poolIndex, poolSpec] of (spec.pools ?? []).entries()) {
      const poolLocation = location.index('pools', [poolIndex, poolSpec.key]);
      const result = CompiledRandomizerPool.newFromDataModel(poolSpec, poolLocation);
      if (result.err !== undefined) {
        errors.addErrors(result.err);
      }
      if (result.ok !== undefined) {
        const addPoolResult = pools.add(result.ok, poolLocation);
        if (addPoolResult.err !== undefined) {
          errors.addError(addPoolResult.err);
        }
        compiled.pools.push(result.ok);
      }
    }

    for (const [groupIndex, groupSpec] of (spec.groups ?? []).entries()) {
      const groupLocation = location.index('groups', [groupIndex, groupSpec.key]);
      const result = CompiledRandomizerGroup.newFromDataModel(groupSpec, groupLocation);
      if (result.err !== undefined) {
        errors.addErrors(result.err);
      }
      if (result.ok !== undefined) {
        const addGroupResult = groups.add(result.ok, groupLocation);
        if (addGroupResult.err !== undefined) {
          errors.addError(addGroupResult.err);
        }
        compiled.groups.push(result.ok);
      }
    }
    for (const [slotIndex, slotSpec] of (spec.slots ?? []).entries()) {
      const slotLocation = location.index('slots', [slotIndex, slotSpec.key]);
      const result = CompiledRandomizerSlot.newFromDataModel(slotSpec, compiled, slotLocation);
      if (result.err !== undefined) {
        errors.addErrors(result.err);
      }
      if (result.ok !== undefined) {
        const addSlotResult = slots.add(result.ok, slotLocation);
        if (addSlotResult.err !== undefined) {
          errors.addError(addSlotResult.err);
        }
        compiled.slots.push(result.ok);
      }
    }
    return compileWithNeeds(spec, compiled, location, errors);
  }

  computeSlots(variables: Record<string, CompiledRandomizerVariableType>): CompiledRandomizerSlot[] {
    return this.slots.flatMap(slot => slot.computeSlots(variables));
  }

  toJSON(): CompiledRandomizerLike {
    return {
      ...this,
      variables: this.variables.map(v => v.toJSON()),
      pools: this.pools.map(p => p.toJSON()),
      groups: this.groups.map(g => g.toJSON()),
      slots: this.slots.map(s => s.toJSON()),
    };
  }
  static fromJSON(data: CompiledRandomizerLike): CompiledRandomizer {
    const result = new CompiledRandomizer();
    result.key = data.key;
    result.name = data.name;
    result.variables = data.variables.map(v => CompiledRandomizerVariable.fromJSON(v));
    result.pools = data.pools.map(p => CompiledRandomizerPool.fromJSON(p));
    result.groups = data.groups.map(g => CompiledRandomizerGroup.fromJSON(g));
    result.slots = data.slots.map(s => CompiledRandomizerSlot.fromJSON(s));
    return result;
  }
}
export interface CompiledRandomizerLike {
  key: string;
  name: string;
  variables: CompiledRandomizerVariableLike[];
  pools: CompiledRandomizerPoolLike[];
  groups: CompiledRandomizerGroupLike[];
  slots: CompiledRandomizerSlotLike[];
}

export type CompiledRandomizerVariableType = number | string | undefined;

export class CompiledRandomizerVariable implements CompiledElement {
  protected constructor(
    public key: string,
    public name: string,
    public defaultValue: CompiledRandomizerVariableType | undefined,
  ) {}

  toJSON(): CompiledRandomizerVariableLike {
    return {
      key: this.key,
      name: this.name,
      type: null,
      default: undefined,
    };
  }

  static newFromDataModel(spec: ReferentialRandomizerVariable, location: DataLocation = new DataLocation()): Result<CompiledRandomizerVariable, DataErrors> {
    switch (spec.type) {
      case 'integer':
        return CompiledRandomizerVariableInteger.newFromDataModel(spec, location);
      default:
        return Result.err(
          new DataErrors([
            new DataError(
              location.child('type'),
              `Unsupported randomizer variable type ${JSON.stringify(spec.type)}`,
            ),
          ]),
          new CompiledRandomizerVariable(spec.key, spec.name ?? spec.key, undefined),
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

  constructor(key: string, name: string, defaultValue: number) {
    super(key, name, defaultValue);
  }

  static override newFromDataModel(spec: ReferentialRandomizerVariableInteger, location: DataLocation = new DataLocation()): Result<CompiledRandomizerVariableInteger, DataErrors> {
    const errors = new DataErrors();
    if (!KeyPattern.test(spec.key)) {
      errors.addError(new DataError(location.child('key'), `Randomizer variable key ${JSON.stringify(spec.key)} is invalid`));
    }
    const compiled = new CompiledRandomizerVariableInteger(spec.key, spec.name ?? spec.key, spec.default);
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
      errors.addError(new DataError(location, `Randomizer variable min ${compiled.min} must be less than max ${compiled.max}`));
    }
    if (compiled.default < compiled.min || compiled.default > compiled.max) {
      errors.addError(new DataError(location, `Randomizer variable default ${compiled.default} must be between min ${compiled.min} and max ${compiled.max}`));
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
    const result = new CompiledRandomizerVariableInteger(data.key, data.name, data.default);
    result.min = data.min ?? result.min;
    result.max = data.max ?? result.max;
    return result;
  }
}
export type CompiledRandomizerVariableLike = CompiledRandomizerVariableAbstractLike | CompiledRandomizerVariableIntegerLike;
export interface CompiledRandomizerVariableAbstractLike {
  key: string;
  name: string;
  type: null;
  default: undefined;
}
export interface CompiledRandomizerVariableIntegerLike {
  key: string;
  name: string;
  type: 'integer';
  min?: number;
  max?: number;
  default: number;
}

export class CompiledRandomizerPool implements CompiledElement {
  key = '';
  criteria?: Expression;

  static newFromDataModel(spec: ReferentialRandomizerPool, location: DataLocation = new DataLocation()): Result<CompiledRandomizerPool, DataErrors> {
    const errors = new DataErrors();
    if (!KeyPattern.test(spec.key)) {
      errors.addError(new DataError(location.child('key'), `Randomizer pool key ${JSON.stringify(spec.key)} is invalid`));
    }
    const compiled = new CompiledRandomizerPool();
    compiled.key = spec.key;
    if (spec.criteria !== undefined) {
      const criteriaResult = Expression.compile(spec.criteria);
      if (criteriaResult.err !== undefined) {
        errors.addError(new DataError(
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

  static newFromDataModel(spec: ReferentialRandomizerGroup, location: DataLocation): Result<CompiledRandomizerGroup, DataErrors> {
    const errors = new DataErrors();
    if (!KeyPattern.test(spec.key)) {
      errors.addError(new DataError(location.child('key'), `Randomizer group key ${JSON.stringify(spec.key)} is invalid`));
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
  pick: ReferentialRandomizerPick = 'remove';
  criteria?: Expression;

  static newFromDataModel(spec: ReferentialRandomizerSlot, parent: CompiledRandomizer|undefined, location: DataLocation = new DataLocation()): Result<CompiledRandomizerSlot, DataErrors> {
    const errors = new DataErrors();
    const compiled = new CompiledRandomizerSlot();

    if (!KeyPattern.test(spec.key)) {
      errors.addError(new DataError(location.child('key'), `Randomizer slot key ${JSON.stringify(spec.key)} is invalid`));
    }
    compiled.key = spec.key;
    compiled.group = spec.group;
    compiled.name = spec.name ?? (compiled.group ? '' : spec.key);
    compiled.pool = spec.pool;

    switch (typeof spec.count) {
      case 'number':
        if (spec.count <= 0) {
          errors.addError(new DataError(location.child('count'), `Randomizer slot count ${spec.count} must be greater than 0`));
        } else {
          compiled.count = Expression.literal(spec.count);
        }
        break;
      case 'string': {
        const countResult = Expression.compile(spec.count);
        if (countResult.err !== undefined) {
          errors.addError(new DataError(location.child('count'), `${countResult.err}`));
        }
        if (countResult.ok !== undefined) {
          compiled.count = countResult.ok;
        }
        break;
      }
    }

    if (parent !== undefined) {
      if (parent.groups.length > 0) {
        if (!compiled.group) {
          errors.addError(new DataError(
            location.child('group'),
            `Randomizer slot group is required. Must be one of: ${parent.groups.map(g => g.key).join(`, `)}`,
          ));
        } else {
          if (!parent.groups.some(g => g.key === compiled.group)) {
            errors.addError(new DataError(
              location.child('group'),
              `Randomizer slot group ${JSON.stringify(compiled.group)} is invalid. Must be one of: ${parent.groups.map(g => g.key).join(`, `)}`,
            ));
          }
        }
      } else {
        if (compiled.group) {
          errors.addError(new DataError(
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
        errors.addError(new DataError(
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

  computeSlots(variables: Record<string, CompiledRandomizerVariableType>): CompiledRandomizerSlot[] {
    const count = this.count.resolve({variables});
    if (typeof count !== 'number' || count < 0) {
      throw new Error(`Slot ${JSON.stringify(this.key)} has an invalid count: ${JSON.stringify(count)}`);
    }
    if (count === 1) {
      return [this];
    }
    const result: CompiledRandomizerSlot[] = [];
    for (let i = 1; i <= count; i++) {
      const slot = new CompiledRandomizerSlot();
      Object.assign(slot, this);
      slot.key = `${this.key}#${i}`;
      if (slot.name) {
        slot.name = `${slot.name} #${i}`;
      }
      result.push(slot);
    }
    return result;
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
  pick: ReferentialRandomizerPick;
  criteria?: ExpressionLike;
}

function compileWithNeeds<S extends ReferentialConditional, C>(spec: S, compiled: C, location: DataLocation, errors: DataErrors): CompilationResult<CompiledConditional<C>> {
  let needs: CompiledCondition | undefined = undefined;
  if (spec.needs !== undefined) {
    if (spec.needs.sets !== undefined) {
      if (!Array.isArray(spec.needs.sets)) {
        errors.addError(new DataError(location.child('needs').child('sets'), `Needs sets should be an array (${JSON.stringify(spec.needs.sets)})`));
      } else {
        if (needs === undefined) {
          needs = { sets: new Set(), features: new Set() };
        }
        for (const [index, set] of spec.needs.sets.entries()) {
          if (typeof set !== 'string') {
            errors.addError(new DataError(location.child('needs').index('sets', index), `Each set should be a string (${JSON.stringify(set)})`));
            continue;
          }
          needs.sets.add(set);
        }
      }
    }
    if (spec.needs.features !== undefined) {
      if (!Array.isArray(spec.needs.features)) {
        errors.addError(new DataError(location.child('needs').child('features'), `Needs features should be an array (${JSON.stringify(spec.needs.features)})`));
      } else {
        if (needs === undefined) {
          needs = { sets: new Set(), features: new Set() };
        }
        for (const [index, feature] of spec.needs.features.entries()) {
          if (typeof feature !== 'string') {
            errors.addError(new DataError(location.child('needs').index('features', index), `Each feature should be a string (${JSON.stringify(feature)})`));
            continue;
          }
          needs.features.add(feature);
        }
      }
    }
  }
  const result: CompiledConditional<C> = { content: compiled, needs };
  return errors.length === 0 ? Result.ok(result) : Result.err(errors, result);
}

