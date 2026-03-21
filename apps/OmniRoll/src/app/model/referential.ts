export const KeyPattern = /^[a-z0-9][a-z0-9_-]*$/;

// export type ReferentialMergeStategy = 'merge'|'override';

export type Includable<T, I> = [I] extends [never] ? T : T | I;
export type Include = {
  include: string;
}

export type ReferentialModule<I = never> = {
  key: string;
  name?: string;
  description?: string;
  // mergeStrategy?: ReferentialMergeStategy;
  updatedAt?: string;
  games: Includable<ReferentialGame<I>, I>[];
}
export type SourceReferentialModule = ReferentialModule<Include>;

export type ReferentialGame<I = never> = {
  key: string;
  name?: string;
  description?: string;
  // mergeStrategy?: ReferentialMergeStategy;
  updatedAt?: string;
  sets?: Includable<ReferentialSet<I>, I>[];
  randomizers?: ReferentialRandomizer[];
}
export type SourceReferentialGame = ReferentialGame<Include>;

export type ReferentialSet<I = never> = {
  key: string;
  name?: string;
  description?: string;
  // mergeStrategy?: ReferentialMergeStategy;
  updatedAt?: string;
  sets?: Includable<ReferentialSet<I>, I>[];
  components?: Record<string, ReferentialComponent[]>;
}
export type SourceReferentialSet = ReferentialSet<Include>;

export type ReferentialComponent = {
  key: string;
  name?: string;
  description?: string;
  properties?: Record<string, boolean|number|string|string[]>;
  // mergeStrategy?: ReferentialMergeStategy;
  updatedAt?: string;
}

export type ReferentialRandomizerPick = 'remove'|'keep';

export type ReferentialRandomizer = {
  key: string;
  name?: string;
  description?: string;
  variables?: ReferentialRandomizerVariable[];
  pools: ReferentialRandomizerPool[];
  groups?: ReferentialRandomizerGroup[];
  slots: ReferentialRandomizerSlot[];
  // mergeStrategy?: ReferentialMergeStategy;
  updatedAt?: string;
}

export type ReferentialRandomizerVariable = ReferentialRandomizerVariableInteger;
export type ReferentialRandomizerVariableInteger = {
  key: string;
  name?: string;
  type: 'integer';
  min?: number;
  max?: number;
  default: number;
}

export type ReferentialRandomizerPool = {
  key: string;
  criteria?: string;
}

export type ReferentialRandomizerGroup = {
  key: string;
  name?: string;
}

export type ReferentialRandomizerSlot = {
  key: string;
  name?: string;
  count?: number|string;
  pool: string;
  group?: string;
  pick?: ReferentialRandomizerPick;
  criteria?: string;
}
