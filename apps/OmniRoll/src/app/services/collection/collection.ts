import {
  Injectable,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ActivatedRouteSnapshot,
  EventType,
  Router,
} from '@angular/router';
import {
  CompiledGame,
  CompiledGameLike,
} from '@project/model/compiled';
import Dexie from 'dexie';
import {
  Referential,
  ReferentialGameMetadata,
} from '../referential/referential';

export interface CollectionGame {
  key: string;
  enabled: boolean;
  name: string;
  version: string;
  update_timestamp: number;
  selectedSets: string[];
  availableSets: CollectionGameSet[];
}

export interface CollectionGameSet {
  key: string;
  name: string;
  sets: CollectionGameSet[];
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

  disableGame(game: string): Promise<void> {
    return this.transaction(
      'readwrite',
      ['Game', 'Content'],
      async tx => {
        const tGame = tx.table<CollectionGame, string>('Game');
        const metadata = await tGame.get(game);
        if (metadata !== undefined) {
          metadata.enabled = false;
          metadata.update_timestamp = Date.now();
          await tGame.put(metadata, game);
        }
        await tx.table<CollectionContent, string>('Content').delete(game);
      }
    );
  }
  enableGame(game: string, metadata: ReferentialGameMetadata): Promise<CollectionGame|undefined> {
    return this.transaction(
      'readwrite',
      'Game',
      async tx => {
        const Game = tx.table<CollectionGame, string>('Game');
        let entity = await Game.get(game);
        if (entity !== undefined) {
          entity.enabled = true;
          entity.update_timestamp = Date.now();
          entity.name = metadata.name;
          entity.version = metadata.version;
        } else {
          entity = {
            key: metadata.key,
            enabled: true,
            update_timestamp: Date.now(),
            name: metadata.name,
            version: metadata.version,
            selectedSets: [],
            availableSets: metadata.sets,
          };
        }
        await Game.put(entity);
        return entity;
      },
    );
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
    console.log(`Collection(${game.key}): Refresh content\n${JSON.stringify(game, undefined, 2)}`);
    const compiled = await resolver();
    if (compiled === undefined) {
      return undefined;
    }
    const ownedSets = new Set(game.selectedSets);
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
  private referential = inject(Referential);

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
        console.log('Collection: Game selected: none');
        this._game.set(undefined);
        this._content.set(undefined);
      } else {
        console.log(`Collection: Game selected: ${JSON.stringify(key)}`);
        const game = await this.getGame(key);
        console.log(`Collection: Game name: ${JSON.stringify(game?.name)}`);
        this._game.set(game);
        const content = game !== undefined ? await this.getContent(game) : undefined;
        console.log(`Collection: Game components: ${JSON.stringify(content?.components.length)}`);
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

  async getAvailableGames(): Promise<CollectionGame[]> {
    const referentials = await this.referential.getGameMetadatas();
    const collections = Object.fromEntries(
      (await this.database.listGames())
      .map(game => [game.key, game])
    );
    return referentials.map(referential => {
      const collection = collections[referential.key];
      if (collection !== undefined) {
        return collection;
      }
      return {
        key: referential.key,
        enabled: false,
        name: referential.name,
        version: referential.version,
        update_timestamp: 0,
        selectedSets: [],
        availableSets: referential.sets,
      }
    });
  }

  async getGame(key: string): Promise<CollectionGame|undefined> {
    let collection = await this.database.getGame(key);
    const metadata = await this.referential.getGameMetadata(key);
    if (collection === undefined) {
      if (metadata !== undefined) {
        collection = {
          key: metadata.key,
          enabled: false,
          name: metadata.name,
          version: metadata.version,
          update_timestamp: 0,
          selectedSets: [],
          availableSets: metadata.sets,
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
      console.log(`Collection.getContent(): Resolve game ${JSON.stringify(game)}`);
      const resolved = await this.getGame(game);
      if (resolved === undefined) {
        return undefined;
      }
      game = resolved;
    }
    if (!game.enabled) {
      return undefined;
    }
    return await this.database.resolveContent(game, async () => {
      const content = await this.referential.getGameContent(game.key);
      if (content === undefined) {
        return undefined;
      }
      return CompiledGame.newFromDataModel(content).expect();
    });
  }

  async updateGame(game: CollectionGame): Promise<void> {
    await this.database.updateGame(game);
    await this.refresh();
  }
  async updateGameStatus(game: string, enabled: boolean): Promise<CollectionGame|undefined> {
    let updated: CollectionGame|undefined = undefined;
    if (enabled) {
      console.log(`Collection.updateGameStatus: Enable game ${JSON.stringify(game)}`);
      const metadata = await this.referential.getGameMetadata(game);
      if (metadata === undefined) {
        console.log(`Collection.updateGameStatus: not found in referential`);
        this.database.disableGame(game);
      } else {
        updated = await this.database.enableGame(game, metadata);
      }
    } else {
      console.log(`Collection: Enable game ${JSON.stringify(game)}`);
      await this.database.disableGame(game);
    }
    await this.refresh();
    return updated;
  }
  async removeGame(key: string): Promise<void> {
    await this.database.removeGame(key);
    await this.refresh();
  }
}
