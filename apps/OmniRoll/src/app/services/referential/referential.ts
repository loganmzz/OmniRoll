import {
  Injectable,
  signal,
} from '@angular/core';
import {
  Include,
  ReferentialGame,
  ReferentialModule,
  ReferentialSet,
  SourceReferentialGame,
  SourceReferentialModule,
  SourceReferentialSet,
} from '@project/model/referential';
import {
  DataFetcher,
  HttpDataFetcher,
} from '@project/services/data-fetch/data-fetch';
import { Dexie } from 'dexie';
import * as yaml from 'js-yaml';
import * as uuid from 'uuid';

export interface ReferentialSource {
  key: string;
  name: string;
  type: 'url'|'dummy';
  url: string;
  protected: boolean;
  enabled: boolean;
  order: number;
  module?: ReferentialModuleMetadata;
  refreshing?: boolean;
}
export interface ReferentialModuleMetadata {
  key: string;
  name: string;
  updatedAt?: string;
  games: ReferentialGameMetadata[];
}
export interface ReferentialGameMetadata {
  key: string;
  name: string;
  version: string;
  enabled: boolean;
  order: number;
  sets: ReferentialGameMetadataSet[];
  stat: ReferentialGameMetadataStat;
}
export interface ReferentialGameMetadataSet {
  key: string;
  name: string;
  sets: ReferentialGameMetadataSet[];
}

export interface ReferentialGameMetadataStat {
  sets: number;
  components: number;
}

export interface ReferentialGameContentKey {
  source: string;
  game: string;
}
export interface ReferentialGameContent {
  key: ReferentialGameContentKey;
  metadata: ReferentialGameMetadata;
  content: ReferentialGame;
}

export class ReferentialDatabase extends Dexie {

  constructor() {
    super('referential');
    this.version(1)
        .stores({
          'Setting': '',
          'Source': 'key,order',
          'Game': '&[key.source+key.game],key.source,key.game',
        });
  }


  getSetting<T>(key: string): Promise<T|undefined> {
    return this.transaction('readonly', 'Setting', tx => tx.table<T, string>('Setting').get(key));
  }
  async setSetting<T>(key: string, setting: T): Promise<void> {
    await this.transaction('readwrite', 'Setting', tx => tx.table<T, string>('Setting').put(setting, key));
  }


  async listSources(): Promise<ReferentialSource[]> {
    const sources = await this.transaction('readonly', 'Source', tx => tx.table<ReferentialSource>('Source').toArray());
    sources.sort((a, b) => a.order - b.order);
    return sources;
  }
  getSource(key: string): Promise<ReferentialSource|undefined> {
    return this.transaction('readonly', 'Source', tx => tx.table<ReferentialSource, string>('Source').get(key));
  }
  async setSource(source: ReferentialSource): Promise<ReferentialSource> {
    await this.transaction('readwrite', 'Source', tx => tx.table<ReferentialSource, string>('Source').put(source));
    return source;
  }
  addSource(source: {key?: string, name: string, url: string}): Promise<ReferentialSource> {
    return this.transaction(
      'readwrite',
      'Source',
      async tx => {
        const tSource = tx.table<ReferentialSource, string>('Source');
        if (source.key === undefined) {
          source.key = uuid.v4();
        }
        if (await tSource.get(source.key) !== undefined) {
          throw new Error(`Source ${JSON.stringify(source.key)} already exists`);
        }
        const last = await tSource.orderBy('order').last();
        const sourceToAdd: ReferentialSource = {
          key: source.key,
          name: source.name,
          type: 'url',
          url: source.url,
          protected: false,
          enabled: true,
          order: last !== undefined ? last.order + 1 : 0,
        };
        await tSource.put(sourceToAdd);
        return sourceToAdd;
      },
    );
  }
  async updateSource(source: {key: string, name: string, url: string}): Promise<void> {
    await this.transaction(
      'readwrite',
      'Source',
      async tx => {
        const tSource = tx.table<ReferentialSource, string>('Source');
        const current = await tSource.get(source.key);
        if (current === undefined) {
          return;
        }
        current.name = source.name;
        current.url = source.url;
        await tSource.put(current);
      }
    );
  }
  async deleteSource(key: string): Promise<void> {
    await this.transaction('readwrite', 'Source', tx => tx.table<ReferentialSource, string>('Source').delete(key));
  }
  async moveSource(key: string, updateOrder: (order: number) => number|undefined): Promise<void> {
    await this.transaction(
      'readwrite',
      ['Source', 'Game'],
      async tx => {
        const tSource = tx.table<ReferentialSource, string>('Source');
        const current = await tSource.get(key);
        if (current === undefined) {
          return;
        }
        const newOrder = updateOrder(current.order);
        if (newOrder === undefined) {
          return;
        }

        const replacement = await tSource.where('order').equals(newOrder).first();
        if (replacement === undefined) {
          return;
        }
        replacement.order = current.order;
        current.order = newOrder;
        tSource.put(current);
        tSource.put(replacement);

        const tGame = tx.table<ReferentialGameContent, [string, string]>('Game');
        for (const source of [current, replacement]) {
          for (const game of source.module?.games ?? []) {
            await tGame
              .where({
                'key.source': source.key,
                'key.game': game.key,
              })
              .modify(content => {
                content.metadata.order = source.order;
              });
          }
        }
      },
    );
  }
  moveSourceUp(key: string): Promise<void> {
    return this.moveSource(key, order => order - 1);
  }
  moveSourceDown(key: string): Promise<void> {
    return this.moveSource(key, order => order + 1);
  }

  async upsertModule(sourceKey: string, module: ReferentialModule): Promise<void> {
    const defaultVersion = new Date().toISOString();
    await this.transaction(
      'readwrite',
      ['Source', 'Game'],
      async tx => {
        const source = await tx.table<ReferentialSource, string>('Source').get(sourceKey);
        if (source === undefined) {
          throw new Error(`Source ${JSON.stringify(sourceKey)} not found`);
        }
        const games: ReferentialGameContent[] = module.games.map(game => ({
          key: {
            source: sourceKey,
            game: game.key,
          },
          metadata: {
            key: game.key,
            name: game.name,
            version: game.updatedAt ?? module.updatedAt ?? defaultVersion,
            enabled: source.enabled,
            order: source.order,
            sets: computeMetadataSet(game.sets),
            stat: countStat(game.sets),
          },
          content: game,
        } as ReferentialGameContent));
        source.module = {
          key: module.key,
          name: module.name ?? module.key,
          updatedAt: module.updatedAt ?? defaultVersion,
          games: games.map(game => game.metadata),
        };
        tx.table<ReferentialSource, string>('Source').put(source, sourceKey);
        tx
          .table<ReferentialGameContent>('Game')
          .where({'key.source': sourceKey})
          .delete();
        for (const game of games) {
          tx
            .table<ReferentialGameContent>('Game')
            .put(game);
        }
      },
    );
  }

  async clearSource(key: string): Promise<void> {
    await this.transaction(
      'readwrite',
      ['Source', 'Game'],
      async tx => {
        const tReferentialSource = tx.table<ReferentialSource, string>('Source');
        const source = await tReferentialSource.get(key);
        if (source !== undefined) {
          source.module = undefined;
          await tReferentialSource.put(source, key);
        }

        await tx
          .table<ReferentialGameContent, [string, string]>('Game')
          .where({'key.source': key})
          .delete();
      },
    );
  }

  async updateSourceStatus(key: string, enabled: boolean): Promise<void> {
    await this.transaction(
      'readwrite',
      ['Source', 'Game'],
      async tx => {
        const tSource = tx.table<ReferentialSource, string>('Source');
        const source = await tSource.get(key);
        if (source !== undefined) {
          source.enabled = enabled;
          (source.module?.games ?? []).forEach(game => {
            game.enabled = enabled;
          });
          await tSource.put(source, key);
        }
        await tx
          .table<{enabled: boolean}, [string, string]>('Game')
          .where({'key.source': key})
          .modify({
            enabled,
          });
      },
    );
  }

  private getGame(key: string): Promise<ReferentialGameContent|undefined> {
    return this.transaction(
      'readonly',
      'Game',
      async tx => {
        const games = await tx
          .table<ReferentialGameContent>('Game')
          .where({'key.game': key})
          .filter(game => game.metadata.enabled)
          .sortBy('metadata.order');
        return games.length > 0 ? games[0] : undefined;
      },
    );
  }

  async getGameMetadatas(): Promise<ReferentialGameMetadata[]> {
    return this.transaction(
      'readonly',
      'Source',
      async tx => {
        const sources = await tx
          .table<ReferentialSource>('Source')
          .orderBy('order')
          .toArray();
        const keys = new Set<string>();
        return sources
          .flatMap(source => {
            if (!source.enabled) {
              return [];
            }
            return (source.module?.games ?? [])
              .filter(game => {
                if (keys.has(game.key)) {
                  return false;
                }
                keys.add(game.key);
                return true;
              })
            })
            .sort((a, b) => a.key.localeCompare(b.key));
        }
    );
  }

  async getGameMetadata(key: string): Promise<ReferentialGameMetadata|undefined> {
    const game = await this.getGame(key);
    return game?.metadata;
  }

  async getGameContent(key: string): Promise<ReferentialGame|undefined> {
    const game = await this.getGame(key);
    return game?.content;
  }
}

@Injectable({
  providedIn: 'root'
})
export class Referential {
  private database = new ReferentialDatabase();
  private initPromise: Promise<void> = this._init();
  private sourceRefreshing = new Map<string, Promise<void>>();
  readonly refreshes = signal([] as string[]);

  private async _init(): Promise<void> {
    const init = await this.database.getSetting<string>('init');
    if (init === undefined) {
      const omniroll = await this.database.setSource({
        key: 'OmniRoll',
        name: 'OmniRoll',
        type: 'url',
        url: '/data/games/index.yaml',
        protected: true,
        enabled: true,
        order: 0,
      });
      // await this.database.setSource({
      //   key: 'Test',
      //   name: 'Test',
      //   type: 'dummy',
      //   url: '/data/games/index.yaml',
      //   protected: true,
      //   enabled: true,
      //   order: 1,
      // });
      await this.refreshSource(omniroll.key);
      await this.database.setSetting('init', 'done');
    }
  }

  init(): Promise<void> {
    return this.initPromise;
  }

  async listSources(): Promise<ReferentialSource[]> {
    await this.init();
    const sources = await this.database.listSources();
    for (const source of sources) {
      source.refreshing = this.sourceRefreshing.has(source.key);
    }
    return sources;
  }
  async getSource(key: string): Promise<ReferentialSource|undefined> {
    return this.database.getSource(key);
  }
  async setSource(source: ReferentialSource): Promise<ReferentialSource> {
    return this.database.setSource(source);
  }
  addUrlSource(newUrlSource: {key?: string, name: string, url: string}): Promise<ReferentialSource> {
    return this.database.addSource(newUrlSource);
  }
  updateUrlSource(newUrlSource: {key: string, name: string, url: string}): Promise<void> {
    return this.database.updateSource(newUrlSource);
  }
  async deleteSource(key: string): Promise<void> {
    return this.database.deleteSource(key);
  }

  async moveSourceUp(key: string): Promise<void> {
    return this.database.moveSourceUp(key);
  }
  async moveSourceDown(key: string): Promise<void> {
    return this.database.moveSourceDown(key);
  }

  refreshSource(key: string): Promise<void> {
    let promise = this.sourceRefreshing.get(key);
    if (promise === undefined) {
      promise = this.fetchSource(key);
      this.sourceRefreshing.set(key, promise);
      this.notifyRefreshes();
      promise.finally(() => {
        this.sourceRefreshing.delete(key);
        this.notifyRefreshes();
      });
    }
    return promise;
  }

  private notifyRefreshes() {
    this.refreshes.set(Array.from(this.sourceRefreshing.keys()));
  }

  async fetchSource(key: string): Promise<void> {
    console.log(`Fetch source ${key}`);
    const source = await this.getSource(key);
    if (source === undefined) {
      throw new Error(`Source ${JSON.stringify(key)} not found`);
    }
    switch (source.type) {
      case 'url':
        {
          const module = await fetchModule(
            `Source ${JSON.stringify(key)}`,
            new HttpDataFetcher().relative(new URL(source.url, document.baseURI)),
          );
          await this.database.upsertModule(source.key, module);
        }
        break;
      case 'dummy':
        await new Promise(f => setTimeout(f, 5000));
        break;
    }
  }

  clearSource(key: string): Promise<void> {
    return this.database.clearSource(key);
  }
  updateSourceStatus(key: string, enabled: boolean): Promise<void> {
    return this.database.updateSourceStatus(key, enabled);
  }

  async getGameMetadatas(): Promise<ReferentialGameMetadata[]> {
    await this.init();
    return this.database.getGameMetadatas();
  }
  async getGameMetadata(key: string): Promise<ReferentialGameMetadata|undefined> {
    await this.init();
    return this.database.getGameMetadata(key);
  }
  async getGameContent(key: string): Promise<ReferentialGame|undefined> {
    await this.init();
    return this.database.getGameContent(key);
  }
}

async function fetchFile<T>(context: string, fetcher: DataFetcher, url: URL|string): Promise<T> {
  let data = '';
  try {
    data = await fetcher.get(url);
  } catch (e) {
    throw new Error(
      `Failed to fetch data for ${context} from ${url}: ${e}`,
      {
        cause: e,
      },
    );
  }
  let result: T;
  try {
    result = yaml.load(data) as T;
  } catch (e) {
    throw new Error(
      `Failed to parse data for ${context} from ${url}: ${e}`,
      {
        cause: e,
      },
    );
  }
  if (result === undefined) {
    throw new Error(`Failed to fetch data for ${context} from ${url}: data is undefined`);
  }
  return result;
}

export async function fetchModule(context: string, fetcher: DataFetcher): Promise<ReferentialModule> {
  const module = await fetchFile<SourceReferentialModule>(context, fetcher, '');
  for (let i = 0; i < module.games.length; i++) {
    let game = module.games[i];
    let gameFetcher = fetcher;
    if ('include' in game) {
      gameFetcher = fetcher.relative(game.include);
      game = await fetchFile<SourceReferentialGame>(`${context} > Game #${i}`, gameFetcher, '');
      module.games[i] = game;
    }
    if (game.key === undefined) {
      throw new Error(`${context} > Game #${i} (${JSON.stringify(game.name)}) has no key`);
    }
    game.sets = await fetchSets(`${context} > Game #${i} ${JSON.stringify(game.key ?? '')}`, gameFetcher, game.sets ?? []);
  }
  return module as ReferentialModule;
}

async function fetchSets(context: string, fetcher: DataFetcher, sets: (Include | SourceReferentialSet)[]): Promise<ReferentialSet[]> {
  for (let i = 0; i < sets.length; i++) {
    let set = sets[i];
    let setFetcher = fetcher;
    if ('include' in set) {
      setFetcher = fetcher.relative(set.include);
      set = await fetchFile<SourceReferentialSet>(`${context} > Set #${i}`, setFetcher, '');
      sets[i] = set;
    }
    set.sets = await fetchSets(`${context} > Set #${i} ${JSON.stringify(set.key)}`, setFetcher, set.sets ?? []);
  }
  return sets as ReferentialSet[];
}

function computeMetadataSet(sets: ReferentialSet[]|undefined): ReferentialGameMetadataSet[] {
  return (sets ?? []).map(set => ({
    key: set.key,
    name: set.name ?? set.key,
    sets: computeMetadataSet(set.sets),
  }));
}

function countStat(sets: ReferentialSet[]|undefined): ReferentialGameMetadataStat {
  return (sets ?? []).reduce(
    (acc, set) => {
      const stat = countStat(set.sets);
      return {
        sets:
          acc.sets +
          stat.sets +
          1,
        components:
          acc.components +
          stat.components +
          Object
            .values(set.components ?? {})
            .reduce((acc, components) => acc + components.length, 0),
      };
    },
    {sets: 0, components: 0},
  );
}
