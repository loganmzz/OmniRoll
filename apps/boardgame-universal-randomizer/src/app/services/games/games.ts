import { Injectable } from '@angular/core';
import { CompiledGame } from '@project/model/compiled';
import { DataModelGame, DataModelSet } from '@project/model/data-model';
import { Dexie } from 'dexie';
import { data } from './data';

export interface GameMetadata {
  key: string;
  name: string;
  version: string;
  sets: GameMetadataSet[];
}
export interface GameMetadataSet {
  key: string;
  name: string;
  sets: GameMetadataSet[];
}

function fromGameModelToMetadata(model: DataModelGame, version: string): GameMetadata {
  return {
    key: model.key,
    name: model.name ?? '',
    version,
    sets: fromGameSetModelToMetadatas(model.sets),
  };
}
function fromGameSetModelToMetadatas(models: DataModelSet[]|undefined): GameMetadataSet[] {
  const metadatas: GameMetadataSet[] = [];
  for (const model of (models ?? [])) {
    metadatas.push({
      key: model.key,
      name: model.name ?? '',
      sets: fromGameSetModelToMetadatas(model.sets),
    });
  }
  return metadatas;
}


export class DataModelDatabase extends Dexie {
  constructor() {
    super('data-model');
    this.version(1)
        .stores({
          'Game': '&key',
          'Component': '&key',
        });
  }

  async getGame(gameKey: string): Promise<GameMetadata|undefined> {
    let loader = data[gameKey];
    let metadata = await this.transaction('readonly', 'Game', tx => tx.table<GameMetadata>('Game').get(gameKey));
    if (loader !== undefined && (metadata === undefined || metadata.version !== loader.version)) {
      console.log(`Game(${gameKey}): Refresh data`);
      const model = await loader.load();
      const newMeta = metadata = fromGameModelToMetadata(model, loader.version);
      await this.transaction('readwrite', ['Game','Component'], async tx => {
        tx.table<GameMetadata>('Game').put(newMeta, gameKey);
        tx.table<DataModelGame>('Component').put(model, gameKey);
      });
    }
    if (metadata === undefined) {
      console.log(`Game(${gameKey}): Not found (${loader?.version})`);
    }
    return metadata;
  }

  /**
   * Get refreshed game list. Including existing unknown game content and known from loaders.
   */
  async listGames(): Promise<GameMetadata[]> {
    const games: GameMetadata[] = [];
    const existingKeys = await this.transaction('readonly', 'Game', tx => tx.table<GameMetadata, string>('Game').toCollection().primaryKeys());
    const loaderKeys = Object.keys(data);
    const keySet = new Set(existingKeys.concat(loaderKeys));
    for (const gameKey of keySet) {
      const game = await this.getGame(gameKey);
      if (game !== undefined) { //Shouldn't happen
        games.push(game);
      }
    }
    return games;
  }

  async getContent(gameKey: string): Promise<DataModelGame|undefined> {
    // Refresh game if required
    const meta = await this.getGame(gameKey);
    if (meta === undefined) {
      return meta;
    }
    return this.transaction('readonly', 'Component', tx => tx.table<DataModelGame>('Component').get(gameKey));
  }
}

@Injectable({
  providedIn: 'root'
})
export class Games {
  private database = new DataModelDatabase();

  async list(): Promise<GameMetadata[]> {
    const games: GameMetadata[] = await this.database.listGames();
    return games;
  }

  async getMetadata(key: string): Promise<GameMetadata|undefined> {
    return this.database.getGame(key);
  }

  async get(key: string): Promise<CompiledGame|undefined> {
    let game: CompiledGame|undefined = undefined;
    const model = await this.database.getContent(key);
    if (model !== undefined) {
      const toCompiled = CompiledGame.newFromDataModel(model);
      game = toCompiled.expect();
    }
    return game;
  }
}
