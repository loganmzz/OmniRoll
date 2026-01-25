import { inject, Injectable } from '@angular/core';
import { CompiledGame, CompiledGameLike } from '@project/model/compiled';
import { GameMetadata, Games } from '@project/services/games/games';
import Dexie from 'dexie';

export interface CollectionGame {
  key: string;
  enabled: boolean;
  name: string;
  version: string;
  update_timestamp: number;
  sets: string[];
}
export interface CollectionContent {
  key: string;
  version: string;
  update_timestamp: number;
  content: CompiledGameLike;
}

export class CollectionDatabase extends Dexie {
  constructor() {
    super('collection');
    this.version(1)
        .stores({
          'Game': '&key',
          'Content': '&key',
        });
  }

  listGames(): Promise<CollectionGame[]> {
    return this.transaction('readonly', 'Game', tx => tx.table<CollectionGame>('Game').toArray());
  }
  getGame(gameKey: string): Promise<CollectionGame|undefined> {
    return this.transaction('readonly', 'Game', tx => tx.table<CollectionGame, string>('Game').get(gameKey));
  }
  async updateGame(game: CollectionGame): Promise<void> {
    game.update_timestamp = Date.now();
    await this.transaction('readwrite', 'Game', tx => tx.table<CollectionGame, string>('Game').put(game, game.key));
  }
  updateGameStatus(metadata: GameMetadata, enabled: boolean): Promise<CollectionGame|undefined> {
    return this.transaction('readwrite', 'Game', async tx => {
      const table = tx.table<CollectionGame, string>('Game');
      const updated = await table.update(metadata.key, {update_timestamp: Date.now(), enabled});
      if (updated === 0 && enabled) {
        const collection: CollectionGame =  {
          key: metadata.key,
          enabled,
          name: metadata.name,
          version: metadata.version,
          update_timestamp: Date.now(),
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

  async resolveContent(game: CollectionGame, resolver: () => Promise<CompiledGame|undefined>): Promise<CompiledGame|undefined> {
    let content = await this.transaction('readonly', 'Content', tx => {
      return tx.table<CollectionContent, string>('Content').get(game.key);
    });
    if (content !== undefined && content.version === game.version && content.update_timestamp === game.update_timestamp) {
      return CompiledGame.fromJSON(content.content);
    }
    console.log(`Collection(${game.key}): Refresh content`);
    const compiled = await resolver();
    if (compiled === undefined) {
      return undefined;
    }
    const ownedSets = new Set(game.sets);
    compiled.components = compiled.components.filter(c => !c.sets.isDisjointFrom(ownedSets));
    content = {
      key: game.key,
      version: game.version,
      update_timestamp: game.update_timestamp,
      content: compiled.toJSON(),
    };
    await this.transaction('readwrite', 'Content', tx => {
      return tx.table<CollectionContent, string>('Content').put(content, game.key);
    });
    return compiled;
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
  async getGame(key: string): Promise<CollectionGame|undefined> {
    let collection = await this.database.getGame(key);
    const metadata = await this.games.getMetadata(key);
    if (collection === undefined) {
      if (metadata !== undefined) {
        collection = {
          key: metadata.key,
          enabled: false,
          name: metadata.name,
          version: metadata.version,
          update_timestamp: 0,
          sets: [],
        }
      }
    } else if (metadata !== undefined && collection.version !== metadata.version) {
      console.log(`Collection(${key}): Refresh metadata`);
      collection.version = metadata.version;
      collection.update_timestamp = Date.now();
      await this.database.updateGame(collection);
    }
    return collection;
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

  async getContent(game: string|CollectionGame): Promise<CompiledGame|undefined> {
    if (typeof game === 'string') {
      const resolved = await this.getGame(game);
      if (resolved === undefined) {
        return undefined;
      }
      game = resolved;
    }
    if (!game.enabled) {
      return undefined;
    }
    return await this.database.resolveContent(game, () => this.games.get(game.key));
  }
}
