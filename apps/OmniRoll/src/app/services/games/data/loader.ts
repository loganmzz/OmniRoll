import { DataModelGame } from '@project/model/data-model';

export interface GameDataLoader {
  version: string;
  load(): Promise<DataModelGame>;
}
