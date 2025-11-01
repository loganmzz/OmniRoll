import { DataModelComponent, DataModelGame, DataModelSet } from "./data-model";

export class CompiledGame {
  key = '';
  name = '';
  components: CompiledComponent[] = [];

  static newFromDataModel(spec: DataModelGame): CompiledGame {
    const compiled = new CompiledGame();
    compiled.key = spec.key;
    compiled.name = spec.name;
    for (const specSet of spec.sets ?? []) {
      CompiledComponent.fillFromDataModel(compiled.components, new Set(), specSet);
    }
    return compiled;
  }
}

export class CompiledComponent {
  key = '';
  name = '';
  sets = new Set<string>();
  kinds = new Set<string>();

  static fillFromDataModel(output: CompiledComponent[], parentSets: Set<string>, spec: DataModelSet) {
    let sets = new Set(parentSets);
    sets.add(spec.key);

    for (const childSet of spec.sets ?? []) {
      this.fillFromDataModel(output, sets, childSet);
    }
    for (const kind in spec.components) {
      const specComponents = spec.components[kind];
      output.push(...specComponents.map(specComponent => this.newFromDataModel(sets, kind, specComponent)));
    }
  }

  static newFromDataModel(parentsSets: Set<string>, kind: string, spec: DataModelComponent): CompiledComponent {
    const compiled = new CompiledComponent();
    compiled.key = spec.key;
    compiled.name = spec.name;
    compiled.sets = new Set(parentsSets);
    compiled.kinds.add(kind);
    return compiled;
  }
}
