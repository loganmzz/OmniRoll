import {
  Component,
  OnChanges,
  OnInit,
  WritableSignal,
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
  ReferentialSource,
} from '@project/services/referential/referential';

interface ReferentialEditForm {
  source?: ReferentialSource;
  fields: CompactFormFields;
  values: WritableSignal<{name: string, url: string}>;
}

@Component({
  selector: 'app-referential-list-page',
  imports: [
    CompactForm,
  ],
  templateUrl: './referential-list-page.html',
  styleUrl: './referential-list-page.css',
})
export class ReferentialListPage implements OnInit, OnChanges {
  referential = inject(Referential);
  sources = signal([] as ReferentialSource[]);
  form$: WritableSignal<ReferentialEditForm | undefined> = signal(undefined);

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
