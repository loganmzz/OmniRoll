import {
  ErrorHandler,
  Injectable,
  inject,
  signal,
} from '@angular/core';
import {
  DataErrorLike,
  DataErrors,
  formatEntity,
} from '@project/model/common';
import { CompiledGame } from '@project/model/compiled';
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
import {
  Dexie,
  TXWithTables,
  Table,
} from 'dexie';
import * as yaml from 'js-yaml';
import { MessageService } from 'primeng/api';
import * as uuid from 'uuid';
import { OmniRollError } from '../error/error-api';

interface IReferentialSource<ERRORS> {
  key: string;
  name: string;
  type: 'url'|'dummy';
  url: string;
  protected: boolean;
  enabled: boolean;
  order: number;
  module?: IReferentialModuleMetadata<ERRORS>;
  refreshing?: boolean;
}
interface IReferentialModuleMetadata<ERRORS> {
  key: string;
  name: string;
  updatedAt?: string;
  games: IReferentialGameMetadata<ERRORS>[];
}
interface IReferentialGameMetadata<ERRORS> {
  key: string;
  name: string;
  version: string;
  enabled: boolean;
  order: number;
  sets: ReferentialGameMetadataSet[];
  stat: ReferentialGameMetadataStat;
  errors?: ERRORS;
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
interface IReferentialGameContent<ERRORS> {
  key: ReferentialGameContentKey;
  metadata: IReferentialGameMetadata<ERRORS>;
  content: ReferentialGame;
}

export type ReferentialSource = IReferentialSource<DataErrors>;
export type ReferentialModuleMetadata = IReferentialModuleMetadata<DataErrors>;
export type ReferentialGameMetadata = IReferentialGameMetadata<DataErrors>;
export type ReferentialGameContent = IReferentialGameContent<DataErrors>;

type ReferentialSourceEntity = IReferentialSource<DataErrorLike[]>;
type ReferentialModuleMetadataEntity = IReferentialModuleMetadata<DataErrorLike[]>;
type ReferentialGameMetadataEntity = IReferentialGameMetadata<DataErrorLike[]>;
type ReferentialGameContentEntity = IReferentialGameContent<DataErrorLike[]>;

function fromReferentialSourceEntity(entity: ReferentialSourceEntity): ReferentialSource {
  return {
    ...entity,
    module: entity.module !== undefined ? fromReferentialModuleMetadataEntity(entity.module) : undefined,
  };
}
function fromReferentialModuleMetadataEntity(entity: ReferentialModuleMetadataEntity): ReferentialModuleMetadata {
  return {
    ...entity,
    games: entity.games.map(fromReferentialGameMetadataEntity),
  };
}
function fromReferentialGameMetadataEntity(entity: ReferentialGameMetadataEntity): ReferentialGameMetadata {
  return {
    ...entity,
    errors: entity.errors !== undefined ? DataErrors.fromJSON(entity.errors) : undefined,
  };
}
function fromReferentialGameContentEntity(entity: ReferentialGameContentEntity): ReferentialGameContent {
  return {
    ...entity,
    metadata: fromReferentialGameMetadataEntity(entity.metadata),
  };
}

function toReferentialSourceEntity(entity: ReferentialSource): ReferentialSourceEntity {
  return {
    ...entity,
    module: entity.module !== undefined ? toReferentialModuleMetadataEntity(entity.module) : undefined,
  };
}
function toReferentialModuleMetadataEntity(entity: ReferentialModuleMetadata): ReferentialModuleMetadataEntity {
  return {
    ...entity,
    games: entity.games.map(toReferentialGameMetadataEntity),
  };
}
function toReferentialGameMetadataEntity(entity: ReferentialGameMetadata): ReferentialGameMetadataEntity {
  return {
    ...entity,
    errors: entity.errors !== undefined ? entity.errors.toJSON() : undefined,
  };
}

export class ReferentialDatabaseClient {
  private tables: {
    setting?: Table<unknown, string>;
    source?: Table<ReferentialSourceEntity, string>;
    game?: Table<ReferentialGameContentEntity, [string, string]>;
  } = {};

  constructor(private tx: TXWithTables<ReferentialDatabase>) {}

  setting<T>(): Table<T, string> {
    if (this.tables.setting === undefined) {
      this.tables.setting = this.tx.table<T, string>('Setting');
    }
    return this.tables.setting as Table<T, string>;
  }

  source(): Table<ReferentialSourceEntity, string> {
    if (this.tables.source === undefined) {
      this.tables.source = this.tx.table<ReferentialSourceEntity, string>('Source');
    }
    return this.tables.source as Table<ReferentialSourceEntity, string>;
  }

  game(): Table<ReferentialGameContentEntity, [string, string]> {
    if (this.tables.game === undefined) {
      this.tables.game = this.tx.table<ReferentialGameContentEntity, [string, string]>('Game');
    }
    return this.tables.game as Table<ReferentialGameContentEntity, [string, string]>;
  }
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

  withTransaction<T>(
    mode: 'readonly'|'readwrite',
    tables: ('Setting'|'Source'|'Game')[],
    callback: (client: ReferentialDatabaseClient) => Promise<T>,
  ): Promise<T> {
    return this.transaction(mode, tables, tx => callback(new ReferentialDatabaseClient(tx)));
  }


  getSetting<T>(key: string): Promise<T|undefined> {
    return this.withTransaction(
      'readonly',
      ['Setting'],
      tx => tx.setting<T>().get(key)
    );
  }
  async setSetting<T>(key: string, setting: T): Promise<void> {
    await this.withTransaction(
      'readwrite',
      ['Setting'],
      tx => tx.setting<T>().put(setting, key)
    );
  }


  async listSources(): Promise<ReferentialSource[]> {
    const sources = await this.withTransaction(
      'readonly',
      ['Source'],
      tx => tx.source().toArray()
    );
    sources.sort((a, b) => a.order - b.order);
    return sources.map(fromReferentialSourceEntity);
  }
  getSource(key: string): Promise<ReferentialSource|undefined> {
    return this.withTransaction(
      'readonly',
      ['Source'],
      async tx => {
        const entity = await tx.source().get(key);
        if (entity === undefined) {
          return undefined;
        }
        return fromReferentialSourceEntity(entity);
      }
    );
  }
  async setSource(source: ReferentialSource): Promise<ReferentialSource> {
    await this.withTransaction(
      'readwrite',
      ['Source'],
      tx => tx.source().put(toReferentialSourceEntity(source))
    );
    return source;
  }
  addSource(source: {key?: string, name: string, url: string}): Promise<ReferentialSource> {
    return this.withTransaction(
      'readwrite',
      ['Source'],
      async tx => {
        if (source.key === undefined) {
          source.key = uuid.v4();
        }
        if ((await tx.source().get(source.key)) !== undefined) {
          throw new Error(`Source ${JSON.stringify(source.key)} already exists`);
        }
        const last = await tx.source().orderBy('order').last();
        const sourceToAdd: ReferentialSourceEntity = {
          key: source.key,
          name: source.name,
          type: 'url',
          url: source.url,
          protected: false,
          enabled: true,
          order: last !== undefined ? last.order + 1 : 0,
        };
        await tx.source().put(sourceToAdd);
        return fromReferentialSourceEntity(sourceToAdd);
      },
    );
  }
  async updateSource(source: {key: string, name: string, url: string}): Promise<void> {
    await this.withTransaction(
      'readwrite',
      ['Source'],
      async tx => {
        const current = await tx.source().get(source.key);
        if (current === undefined) {
          return;
        }
        current.name = source.name;
        current.url = source.url;
        await tx.source().put(current);
      }
    );
  }
  async deleteSource(key: string): Promise<void> {
    await this.withTransaction(
      'readwrite',
      ['Source'],
      tx => tx.source().delete(key)
    );
  }
  async moveSource(key: string, updateOrder: (order: number) => number|undefined): Promise<void> {
    await this.withTransaction(
      'readwrite',
      ['Source', 'Game'],
      async tx => {
        const current = await tx.source().get(key);
        if (current === undefined) {
          return;
        }
        const newOrder = updateOrder(current.order);
        if (newOrder === undefined) {
          return;
        }

        const replacement = await tx.source().where('order').equals(newOrder).first();
        if (replacement === undefined) {
          return;
        }
        replacement.order = current.order;
        current.order = newOrder;
        await tx.source().put(current);
        await tx.source().put(replacement);

        for (const source of [current, replacement]) {
          for (const game of source.module?.games ?? []) {
            await tx.game()
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

  /**
   * Replace module associated to source and save content to separate table (one entry per game).
   * In case of compilation error, the raw content is kept (but collection one must be kept).
   * @param sourceKey
   * @param module
   * @param errors
   */
  upsertModule(sourceKey: string, module: ReferentialModule, errors: Record<string, DataErrors>): Promise<ReferentialSource> {
    const defaultVersion = new Date().toISOString();
    return this.withTransaction(
      'readwrite',
      ['Source', 'Game'],
      async tx => {
        const source = await tx.source().get(sourceKey);
        if (source === undefined) {
          throw new Error(`Source ${JSON.stringify(sourceKey)} not found`);
        }
        const newGames: ReferentialGameContentEntity[] = module.games.map(game => {
          return {
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
              errors: errors[game.key]?.toJSON(),
            },
            content: game,
          } as ReferentialGameContentEntity;
        });
        source.module = {
          key: module.key,
          name: module.name ?? module.key,
          updatedAt: module.updatedAt ?? defaultVersion,
          games: newGames.map(game => game.metadata),
        };
        await tx.source().put(source, sourceKey);
        await tx.game().where({'key.source': sourceKey}).delete();
        for (const newGame of newGames) {
          await tx.game().put(newGame);
        }
        return fromReferentialSourceEntity(source);
      },
    );
  }

  async clearSource(key: string): Promise<void> {
    await this.withTransaction(
      'readwrite',
      ['Source', 'Game'],
      async tx => {
        const source = await tx.source().get(key);
        if (source !== undefined) {
          source.module = undefined;
          await tx.source().put(source, key);
        }

        await tx
          .game()
          .where({'key.source': key})
          .delete();
      },
    );
  }

  async updateSourceStatus(key: string, enabled: boolean): Promise<void> {
    await this.withTransaction(
      'readwrite',
      ['Source', 'Game'],
      async tx => {
        const source = await tx.source().get(key);
        if (source !== undefined) {
          source.enabled = enabled;
          (source.module?.games ?? []).forEach(game => {
            game.enabled = enabled;
          });
          await tx.source().put(source, key);
        }
        await tx
          .game()
          .where({'key.source': key})
          .modify(game => {
            game.metadata.enabled = enabled;
          });
      },
    );
  }

  private getGame(key: string): Promise<ReferentialGameContent|undefined> {
    return this.withTransaction(
      'readonly',
      ['Game'],
      async tx => {
        const games = await tx
          .game()
          .where({'key.game': key})
          .filter(game => game.metadata.enabled)
          .sortBy('metadata.order');
        return games.length > 0 ? fromReferentialGameContentEntity(games[0]) : undefined;
      },
    );
  }

  async getGameMetadatas(): Promise<ReferentialGameMetadata[]> {
    return this.withTransaction(
      'readonly',
      ['Source'],
      async tx => {
        const sources = await tx
          .source()
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
            .sort((a, b) => a.key.localeCompare(b.key))
            .map(fromReferentialGameMetadataEntity);
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
  private messageService = inject(MessageService);
  private errorHandler = inject(ErrorHandler);
  private database = new ReferentialDatabase();
  private initPromise: Promise<void> = this._init();
  private sourceRefreshing = new Map<string, Promise<ReferentialSource>>();
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
      await this.refreshSource(omniroll.key, {notify: false});
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

  refreshSource(key: string, {notify}: {notify?: boolean} = {}): Promise<ReferentialSource> {
    let promise = this.sourceRefreshing.get(key);
    if (promise === undefined) {
      promise = this.fetchSource(key)
        .then(source => {
          if (source.module === undefined) {
            this.messageService.add({
              severity: 'warn',
              summary: `Source ${formatEntity(source)} refreshed but no module was found`
            });
          } else {
            const gamesWithErrors = source.module.games.filter(game => game.errors !== undefined);
            for (const gameWithErrors of gamesWithErrors) {
              this.messageService.add({
                severity: 'warn',
                summary: `Source ${formatEntity(source)} refreshed but game ${formatEntity(gameWithErrors)} has errors`,
              });
            }
            if (notify !== false && gamesWithErrors.length === 0) {
              this.messageService.add({
                severity: 'success',
                summary: `Source ${formatEntity(source)} refreshed successfully`,
              });
            }
          }
          return source;
        })
        .catch(error => {
          this.errorHandler.handleError(error);
          throw error;
        })
        .finally(() => {
          this.sourceRefreshing.delete(key);
          this.notifyRefreshes();
        });
      this.sourceRefreshing.set(key, promise);
      this.notifyRefreshes();
    }
    return promise;
  }

  private notifyRefreshes() {
    this.refreshes.set(Array.from(this.sourceRefreshing.keys()));
  }

  async fetchSource(key: string): Promise<ReferentialSource> {
    console.log(`Fetch source ${key}`);
    const source = await this.getSource(key);
    if (source === undefined) {
      throw new OmniRollError(
        'REFERENTIAL_REFRESH_SOURCE_NOT_FOUND',
        `Referential: cannot refresh source`,
        `Source ${formatEntity(key)} was not found`,
      );
    }
    switch (source.type) {
      case 'url':
        {
          const module = await fetchModule(
            `Source ${JSON.stringify(key)}`,
            new HttpDataFetcher().relative(new URL(source.url, document.baseURI)),
          );
          const errors: Record<string, DataErrors> = {};
          for (const game of module.games) {
            const compiledResult = CompiledGame.newFromDataModel(game);
            if (compiledResult.err !== undefined) {
              errors[game.key] = compiledResult.err;
            }
          }
          try {
            return await this.database.upsertModule(source.key, module, errors);
          } catch (error) {
            console.error(`DEBUG: Referential: failed to upsert module for source ${formatEntity(source)}: ${error}`);
            throw error;
          }
        }
      case 'dummy':
        await new Promise(f => setTimeout(f, 5000));
        break;
    }
    return source;
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
  async getGameMetadata(key: string, {withoutErrors}: {withoutErrors?: boolean} = {}): Promise<ReferentialGameMetadata|undefined> {
    await this.init();
    const metadata = await this.database.getGameMetadata(key);
    if (metadata === undefined || metadata.errors !== undefined && withoutErrors) {
      return undefined;
    }
    return metadata;
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
