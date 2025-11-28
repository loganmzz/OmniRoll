export type DataModelMergeStategy = 'merge'|'override';

export type DataModelGame = {
  key: string;
  name?: string;
  description?: string;
  mergeStrategy?: DataModelMergeStategy;
  updatedAt?: string;
  sets?: DataModelSet[];
  randomizers?: DataModelRandomizer[];
}

export type DataModelSet = {
  key: string;
  name?: string;
  description?: string;
  mergeStrategy?: DataModelMergeStategy;
  updatedAt?: string;
  sets?: DataModelSet[];
  components?: Record<string, DataModelComponent[]>;
}

export type DataModelComponent = {
  key: string;
  name?: string;
  description?: string;
  properties?: Record<string, boolean|number|string|string[]>;
  mergeStrategy?: DataModelMergeStategy;
  updatedAt?: string;
}

export type DataModelRandomizerPick = 'remove'|'keep';

export type DataModelRandomizer = {
  key: string;
  name?: string;
  description?: string;
  pools: DataModelRandomizerPool[];
  slots: DataModelRandomizerSlot[];
  mergeStrategy?: DataModelMergeStategy;
  updatedAt?: string;
}

export type DataModelRandomizerPool = {
  key: string;
  criteria?: string[];
}

export type DataModelRandomizerSlot = {
  key: string;
  pool: string;
  pick?: DataModelRandomizerPick;
  criteria?: string[];
}
