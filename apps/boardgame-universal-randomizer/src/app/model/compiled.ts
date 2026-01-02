import { Result } from './common';
import { Criteria, CriteriaParser } from './criteria';
import { DataModelComponent, DataModelGame, DataModelRandomizer, DataModelRandomizerGroup, DataModelRandomizerPick, DataModelRandomizerPool, DataModelRandomizerSlot, DataModelSet } from './data-model';

export class CompiledDataLocation {

  constructor(readonly path: {name: string, index?:string|number}[] = []) {}

  child(name: string): CompiledDataLocation {
    return new CompiledDataLocation(this.path.concat([{name}]));
  }
  index(name: string, index: string|number): CompiledDataLocation {
    return new CompiledDataLocation(this.path.concat([{name, index}]));
  }

  toString(): string {
    return this.path
      .map(({name,index}) => index !== undefined ? `/${name}[${index}]` : `/${name}`)
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

export class CompiledGame {
  key = '';
  name = '';
  components: CompiledComponent[] = [];
  randomizers: CompiledRandomizer[] = [];

  static newFromDataModel(spec: DataModelGame, location: CompiledDataLocation = new CompiledDataLocation()): Result<CompiledGame, CompiledDataError[]> {
    const compiled = new CompiledGame();
    compiled.key = spec.key;
    compiled.name = spec.name ?? spec.key;
    const errors: CompiledDataError[] = [];
    for (const specSet of spec.sets ?? []) {
      const result = CompiledComponent.fillFromDataModel(compiled.components, new Set(), specSet, location.index('set', specSet.key));
      if (result.err !== undefined) {
        errors.push(...result.err);
      }
    }
    for (const specRandomizer of spec.randomizers ?? []) {
      const result = CompiledRandomizer.newFromDataModel(specRandomizer, location.index('randomizer', specRandomizer.key));
      if (result.err !== undefined) {
        errors.push(...result.err);
      }
      if (result.ok !== undefined) {
        compiled.randomizers.push(result.ok);
      }
    }
    return errors.length === 0 ? Result.ok(compiled) : Result.err(errors);
  }
}

export class CompiledComponent {
  key = '';
  name = '';
  properties: Record<string, boolean|number|string|string[]> = {};
  sets = new Set<string>();
  kinds = new Set<string>();

  static fillFromDataModel(output: CompiledComponent[], parentSets: Set<string>, spec: DataModelSet, location: CompiledDataLocation = new CompiledDataLocation()): Result<unknown, CompiledDataError[]> {
    const sets = new Set(parentSets);
    sets.add(spec.key);

    const errors: CompiledDataError[] = [];

    for (const childSet of spec.sets ?? []) {
      const result = this.fillFromDataModel(output, sets, childSet, location.index('set', childSet.key));
      if (result.err !== undefined) {
        errors.push(...result.err);
      }
    }
    for (const kind in spec.components) {
      const specComponents = spec.components[kind];
      for (const specComponent of specComponents) {
        const result = this.newFromDataModel(sets, kind, specComponent);
        if (result.ok !== undefined) {
          if (errors.length === 0) {
            output.push(result.ok);
          }
        } else {
          errors.push(...(result.err ?? []));
        }
      }
    }
    return errors.length === 0 ? Result.ok({}) : Result.err(errors);
  }

  static newFromDataModel(parentsSets: Set<string>, kind: string, spec: DataModelComponent): Result<CompiledComponent, CompiledDataError[]> {
    const compiled = new CompiledComponent();
    compiled.key = spec.key;
    compiled.name = spec.name ?? spec.key;
    compiled.sets = new Set(parentsSets);
    compiled.kinds.add(kind);
    compiled.properties = {...spec.properties};
    return Result.ok(compiled);
  }

  toJSON(): unknown {
    return {
      ...this,
      kinds: [...this.kinds],
      sets: [...this.sets],
    };
  }
}

export class CompiledRandomizer {
  key = '';
  name = '';
  pools: CompiledRandomizerPool[] = [];
  groups: CompiledRandomizerGroup[] = [];
  slots: CompiledRandomizerSlot[] = [];

  static newFromDataModel(spec: DataModelRandomizer, location: CompiledDataLocation = new CompiledDataLocation()): Result<CompiledRandomizer, CompiledDataError[]> {
    const compiled = new CompiledRandomizer();
    compiled.key = spec.key;
    compiled.name = spec.name ?? spec.key;
    const errors: CompiledDataError[] = [];
    for (const poolSpec of spec.pools ?? []) {
      const result = CompiledRandomizerPool.newFromDataModel(poolSpec, location.index('pool', poolSpec.key));
      if (result.ok !== undefined) {
        if (errors.length === 0) {
          compiled.pools.push(result.ok);
        }
      } else {
        errors.push(...(result.err ?? []));
      }
    }
    for (const groupSpec of spec.groups ?? []) {
      const result = CompiledRandomizerGroup.newFromDataModel(groupSpec);
      if (result.ok !== undefined) {
        compiled.groups.push(result.ok);
      } else {
        errors.push(...(result.err ?? []));
      }
    }
    for (const slotSpec of spec.slots ?? []) {
      const result = CompiledRandomizerSlot.newFromDataModel(slotSpec, compiled, location.index('slot', slotSpec.key));
      if (result.ok !== undefined) {
        if (errors.length === 0) {
          compiled.slots.push(result.ok);
        }
      } else {
        errors.push(...(result.err ?? []));
      }
    }
    return errors.length === 0 ? Result.ok(compiled) : Result.err(errors);
  }
}

export class CompiledRandomizerPool {
  key = '';
  criteria: Criteria[] = [];

  static newFromDataModel(spec: DataModelRandomizerPool, location: CompiledDataLocation = new CompiledDataLocation()): Result<CompiledRandomizerPool, CompiledDataError[]> {
    const compiled = new CompiledRandomizerPool();
    compiled.key = spec.key;
    const specCriteriaList = spec.criteria ?? [];
    const errors: CompiledDataError[] = [];
    for (let i = 0; i < specCriteriaList.length; i++) {
      const specCriteria = specCriteriaList[i];
      const result = new CriteriaParser(specCriteria).tryReadCriteria();
      if (result.ok !== undefined) {
        if (errors.length === 0) {
          compiled.criteria.push(result.ok);
        }
      } else {
        errors.push(new CompiledDataError(
          location.index('criteria', i),
          `${result.err}`,
        ));
      }
    }
    return errors.length === 0 ? Result.ok(compiled) : Result.err(errors);
  }

  test(component: CompiledComponent): boolean {
    return this.criteria.length === 0 || this.criteria.some(criteria => criteria.resolve(component as unknown as Record<string, unknown>));
  }
}

export class CompiledRandomizerGroup {
  key = '';
  name = '';

  static newFromDataModel(spec: DataModelRandomizerGroup): Result<CompiledRandomizerGroup, CompiledDataError[]> {
    const compiled = new CompiledRandomizerGroup();
    compiled.key  = spec.key;
    compiled.name = spec.name ?? compiled.key;
    return Result.ok(compiled);
  }
}

export class CompiledRandomizerSlot {
  key = '';
  pool = '';
  group: string|undefined = undefined;
  pick: DataModelRandomizerPick = 'remove';
  criteria: Criteria[] = [];

  static newFromDataModel(spec: DataModelRandomizerSlot, parent: CompiledRandomizer|undefined, location: CompiledDataLocation = new CompiledDataLocation()): Result<CompiledRandomizerSlot, CompiledDataError[]> {
    const errors: CompiledDataError[] = [];
    const compiled = new CompiledRandomizerSlot();

    compiled.key = spec.key;
    compiled.pool = spec.pool;

    compiled.group = spec.group;
    if (parent !== undefined) {
      if (parent.groups.length > 0) {
        if (!compiled.group) {
          errors.push(new CompiledDataError(
            location.child('group'),
            `group is required. Must be One of: ${parent.groups.map(g => g.key).join(`, `)}`,
          ));
        } else {
          if (!parent.groups.some(g => g.key === compiled.group)) {
            errors.push(new CompiledDataError(
              location.child('group'),
              `group ${JSON.stringify(compiled.group)} is invalid. Must be One of: ${parent.groups.map(g => g.key).join(`, `)}`,
            ));
          }
        }
      } else {
        if (compiled.group) {
          errors.push(new CompiledDataError(
            location.child('group'),
            `group ${JSON.stringify(compiled.group)} is provided but none is expected`,
          ));
        }
      }
    }

    compiled.pick = spec.pick ?? compiled.pick;
    const specCriteriaList = spec.criteria ?? [];
    for (let i = 0; i < specCriteriaList.length; i++) {
      const specCriteria = specCriteriaList[i];
      const result = new CriteriaParser(specCriteria).tryReadCriteria();
      if (result.ok !== undefined) {
        if (errors.length === 0) {
          compiled.criteria.push(result.ok);
        }
      } else {
        errors.push(new CompiledDataError(
          location.index('criteria', i),
          `${result.err}`,
        ));
      }
    }
    return errors.length === 0 ? Result.ok(compiled) : Result.err(errors);
  }

  test(component: CompiledComponent): boolean {
    return this.criteria.length === 0 || this.criteria.some(criteria => criteria.resolve(component as unknown as Record<string, unknown>));
  }
}
