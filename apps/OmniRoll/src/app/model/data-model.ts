export const KeyPattern = /^[a-z0-9][a-z0-9_-]*$/;

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
  groups?: DataModelRandomizerGroup[];
  slots: DataModelRandomizerSlot[];
  mergeStrategy?: DataModelMergeStategy;
  updatedAt?: string;
}

export type DataModelRandomizerPool = {
  key: string;
  criteria?: string[];
}

export type DataModelRandomizerGroup = {
  key: string;
  name?: string;
}

export type DataModelRandomizerSlot = {
  key: string;
  name?: string;
  pool: string;
  group?: string;
  pick?: DataModelRandomizerPick;
  criteria?: string[];
}
