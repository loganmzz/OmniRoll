import { inject, Injectable } from '@angular/core';
import { GameMetadata, Games } from '@project/services/games/games';
import Dexie from 'dexie';

export interface CollectionGame {
  key: string;
  enabled: boolean;
  name: string;
  version: string;
  sets: string[];
}

export class CollectionDatabase extends Dexie {
  constructor() {
    super('collection');
    this.version(1)
        .stores({
          'Game': '&key',
          'Component': '&key',
        });
  }

  listGames(): Promise<CollectionGame[]> {
    return this.transaction('readonly', 'Game', tx => tx.table<CollectionGame>('Game').toArray());
  }
  async updateGame(game: CollectionGame): Promise<void> {
    await this.transaction('readwrite', 'Game', tx => tx.table<CollectionGame, string>('Game').put(game, game.key));
  }
  updateGameStatus(metadata: GameMetadata, enabled: boolean): Promise<CollectionGame|undefined> {
    return this.transaction('readwrite', 'Game', async tx => {
      const table = tx.table<CollectionGame, string>('Game');
      const updated = await table.update(metadata.key, {enabled});
      if (updated === 0 && enabled) {
        const collection =  {
          key: metadata.key,
          enabled,
          name: metadata.name,
          version: metadata.version,
          sets: [],
        };
        await table.add(collection, collection.key);
        return collection;
      }
      return undefined;
    });
  }
  removeGame(gameKey: string): Promise<void> {
    return this.transaction('readwrite', 'Game', tx => tx.table<CollectionGame, string>('Game').delete(gameKey));
  }
}

@Injectable({
  providedIn: 'root'
})
export class Collection {
  private database = new CollectionDatabase();
  private games = inject(Games);

  listGames(): Promise<CollectionGame[]> {
    return this.database.listGames();
  }
  updateGame(game: CollectionGame): Promise<void> {
    return this.database.updateGame(game);
  }
  async updateGameStatus(game: string|GameMetadata, enabled: boolean): Promise<CollectionGame|undefined> {
    if (typeof game === 'string') {
      const metadata = await this.games.getMetadata(game);
      if (metadata === undefined) {
        return undefined;
      }
      game = metadata;
    }
    return await this.database.updateGameStatus(game, enabled);
  }
  removeGame(key: string): Promise<void> {
    return this.database.removeGame(key);
  }
}
