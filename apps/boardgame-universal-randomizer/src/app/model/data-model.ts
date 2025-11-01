export type DataModelGame = {
  key: string;
  name: string;
  sets?: DataModelSet[];
}

export type DataModelSet = {
  key: string;
  name: string;
  sets?: DataModelSet[];
  components?: Record<string, DataModelComponent[]>;
}

export type DataModelComponent = {
  key: string;
  name: string;
}
