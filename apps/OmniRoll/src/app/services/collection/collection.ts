import { effect, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRouteSnapshot, EventType, Router } from '@angular/router';
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
  private router = inject(Router);
  private gamesService = inject(Games);

  private readonly _games = signal([] as CollectionGame[]);
  readonly games = this._games.asReadonly();
  private readonly _gameKey = signal({} as {key?: string});
  private readonly _game = signal(undefined as CollectionGame|undefined);
  readonly game = this._game.asReadonly();
  private readonly _content = signal(undefined as CompiledGame|undefined);
  readonly content = this._content.asReadonly();

  constructor() {
    this.router.events.pipe(takeUntilDestroyed()).subscribe(event => {
      switch (event.type) {
        case EventType.NavigationEnd:
          this.refreshCurrentContext();
          break;
      }
    });
    effect(async () => {
      const {key} = this._gameKey();
      if (key === undefined) {
        this._game.set(undefined);
        this._content.set(undefined);
      } else {
        const game = await this.getGame(key);
        this._game.set(game);
        const content = game !== undefined ? await this.getContent(game) : undefined;
        this._content.set(content);
      }
    });
    this.refresh();
  }

  private async refreshCurrentContext(): Promise<void> {
    let game: string|undefined = undefined;
    let route: ActivatedRouteSnapshot | null = this.router.routerState.snapshot.root;
    while (route !== null) {
      const gameParam = route.paramMap.get('collection-game');
      if (gameParam !== null) {
        game = gameParam;
      }
      route = route.firstChild ?? null;
    }
    this._gameKey.update(previous => {
      if (previous.key === game) {
        return previous;
      }
      return {key: game};
    });
  }

  private async refresh(): Promise<void> {
    const games = await this.database.listGames();
    this._games.set(games.filter(g => g.enabled));
    this._gameKey.update(previous => {
      if (previous.key === undefined) {
        return previous;
      }
      return {key: previous.key};
    });
  }

  async getGame(key: string): Promise<CollectionGame|undefined> {
    let collection = await this.database.getGame(key);
    const metadata = await this.gamesService.getMetadata(key);
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
      await this.refresh();
    }
    return collection;
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
    return await this.database.resolveContent(game, () => this.gamesService.get(game.key));
  }

  async updateGame(game: CollectionGame): Promise<void> {
    await this.database.updateGame(game);
    await this.refresh();
  }
  async updateGameStatus(game: string|GameMetadata, enabled: boolean): Promise<CollectionGame|undefined> {
    if (typeof game === 'string') {
      const metadata = await this.gamesService.getMetadata(game);
      if (metadata === undefined) {
        return undefined;
      }
      game = metadata;
    }
    const updated = await this.database.updateGameStatus(game, enabled);
    await this.refresh();
    return updated;
  }
  async removeGame(key: string): Promise<void> {
    await this.database.removeGame(key);
    await this.refresh();
  }
}
