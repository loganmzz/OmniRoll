import { Injectable } from '@angular/core';
import { CompiledGame } from '@project/model/compiled';
import { DataModelGame } from '@project/model/data-model';
import { Dexie } from 'dexie';
import { data } from './data';

export class DataModelDatabase extends Dexie {
  constructor() {
    super('data-model');
    this.version(1)
        .stores({
          'Game': '&key',
        });
    this.on('populate', () => this.populate());
  }

  async populate() {
    for (const [gameKey, gameResolver] of Object.entries(data)) {
      console.log(`Games > Register ${JSON.stringify(gameKey)}`);
      const game = gameResolver();
      this.transaction('readwrite', 'Game', tx => {
        tx.table('Game').add(game, gameKey);
      });
    }
  }
}

@Injectable({
  providedIn: 'root'
})
export class Games {
  private database = new DataModelDatabase();

  async list(): Promise<CompiledGame[]> {
    const games: CompiledGame[] = [];
    await this.database.transaction('readonly', 'Game', tx => {
      tx.table<DataModelGame>('Game').each(game => {
        const toCompiled = CompiledGame.newFromDataModel({...game, sets: []});
        games.push(toCompiled.expect());
      });
    });
    return games;
  }

  async get(key: string): Promise<CompiledGame|undefined> {
    let game: CompiledGame|undefined = undefined;
    await this.database.transaction('readonly', 'Game', async (tx) => {
      const model = await tx.table<DataModelGame>('Game').get(key);
      if (model !== undefined) {
        const toCompiled = CompiledGame.newFromDataModel(model);
        game = toCompiled.expect();
      }
    });
    return game;
  }
}
