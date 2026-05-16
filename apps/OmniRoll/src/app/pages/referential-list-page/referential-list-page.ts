import { TreeNode } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TreeTableModule } from 'primeng/treetable';
import {
  Component,
  OnChanges,
  OnInit,
  WritableSignal,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import {
  CompactForm,
  CompactFormFields,
  CompactFormValues,
} from '@project/components/compact-form/compact-form';
import {
  Referential,
  ReferentialGameMetadata,
  ReferentialSource,
} from '@project/services/referential/referential';

interface ReferentialEditForm {
  source?: ReferentialSource;
  fields: CompactFormFields;
  values: WritableSignal<{name: string, url: string}>;
}

type ReferentialTreeNode = TreeNode<ReferentialTreeData>;
type ReferentialTreeData = ReferentialTreeDataSource | ReferentialTreeDataGame | ReferentialTreeDataEditSource;
interface ReferentialTreeDataBase {
  isEnabled: boolean;
  isRefreshing: boolean;
}
interface ReferentialTreeDataSource extends ReferentialTreeDataBase {
  type: 'source';
  name: string;
  source: ReferentialSource;
  can: {
    moveUp: boolean;
    moveDown: boolean;
    refresh: boolean;
    edit: boolean;
    disable: boolean;
    remove: boolean;
  }
}
interface ReferentialTreeDataGame extends ReferentialTreeDataBase {
  type: 'game';
  name: string;
  game: ReferentialGameMetadata;
}
interface ReferentialTreeDataEditSource extends ReferentialTreeDataBase {
  type: 'edit-source';
  source: ReferentialSource;
  form: ReferentialEditForm;
}

@Component({
  selector: 'app-referential-list-page',
  imports: [
    CompactForm,
    ButtonModule,
    TreeTableModule,
  ],
  templateUrl: './referential-list-page.html',
  styleUrl: './referential-list-page.css',
})
export class ReferentialListPage implements OnInit, OnChanges {
  referential = inject(Referential);
  sources = signal([] as ReferentialSource[]);
  form$: WritableSignal<ReferentialEditForm | undefined> = signal(undefined);
  tableNodes = computed(() => {
    const sources = this.sources();
    const form    = this.form$();
    const nodes = sources.map((source, sourceIndex) => ({
      key: `source-${source.key}`,
      data: {
        type: 'source',
        name: source.name,
        source,
        can: {
          moveUp: sourceIndex > 0,
          moveDown: sourceIndex < sources.length - 1,
          refresh: !source.refreshing,
          edit: !source.protected,
          disable: source.enabled,
          remove: !source.protected,
        },
        isEnabled: source.enabled,
        isRefreshing: source.refreshing,
      } as ReferentialTreeDataSource,
      children: form !== undefined && form.source?.key === source.key ?
        [
          {
            key: `source-${source.key}-edit`,
            data: {
              type: 'edit-source',
              source,
              form,
              isEnabled: source.enabled,
              isRefreshing: source.refreshing,
            } as ReferentialTreeDataEditSource,
          } as ReferentialTreeNode,
        ]
        : (source.module?.games ?? []).map(game => ({
          key: `source-${source.key}-game-${game.key}`,
          data: {
            type: 'game',
            name: game.name,
            game,
            isEnabled: source.enabled,
            isRefreshing: source.refreshing,
          } as ReferentialTreeDataGame,
        styleClass: 'referential-table-game-row',
      } as ReferentialTreeNode)),
      styleClass: 'referential-table-source-row',
      expanded: true,
    } as ReferentialTreeNode));
    return nodes;
  });

  constructor() {
    effect(async () => {
      this.referential.refreshes();
      await this.refreshList();
    });
  }

  async ngOnInit(): Promise<void> {
    await this.referential.init();
    await this.ngOnChanges();
  }

  async ngOnChanges(): Promise<void> {
    await this.refreshList();
  }

  async refreshList(): Promise<void> {
    this.sources.set(await this.referential.listSources());
  }

  async refreshSource(source: ReferentialSource): Promise<void> {
    this.referential.refreshSource(source.key);
    await this.refreshList();
  }
  async clearSource(source: ReferentialSource): Promise<void> {
    await this.referential.clearSource(source.key);
    await this.refreshList();
  }

  async disableSource(source: ReferentialSource): Promise<void> {
    await this.referential.updateSourceStatus(source.key, false);
    await this.refreshList();
  }
  async enableSource(source: ReferentialSource): Promise<void> {
    await this.referential.updateSourceStatus(source.key, true);
    await this.refreshList();
  }

  async moveSourceUp(source: ReferentialSource): Promise<void> {
    await this.referential.moveSourceUp(source.key);
    await this.refreshList();
  }
  async moveSourceDown(source: ReferentialSource): Promise<void> {
    await this.referential.moveSourceDown(source.key);
    await this.refreshList();
  }

  async removeSource(source: ReferentialSource): Promise<void> {
    if (source.protected) {
      return;
    }
    await this.referential.deleteSource(source.key);
    await this.refreshList();
  }

  openEditForm(source?: ReferentialSource) {
    this.form$.set({
      source,
      fields: [
        {
          key: 'name',
          type: 'text',
          label: 'Name',
          required: true,
        },
        {
          key: 'url',
          type: 'url',
          label: 'URL',
        },
      ],
      values: signal({
        name: source?.name ?? '',
        url: source?.url ?? '',
      }),
    });
  }
  async saveEditForm(event: CompactFormValues, sourceKey?: string) {
    const values = event as {name: string, url: string};
    if (sourceKey !== undefined) {
      await this.referential.updateUrlSource({key: sourceKey, ...values});
    } else {
      const newSource = await this.referential.addUrlSource(values);
      this.referential.refreshSource(newSource.key);
    }
    this.form$.set(undefined);
    await this.refreshList();
  }
  async cancelEditForm() {
    this.form$.set(undefined);
  }

}
