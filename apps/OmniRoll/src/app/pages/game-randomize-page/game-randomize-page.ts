import {
  Component,
  Signal,
  WritableSignal,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import {
  CompactForm,
  CompactFormField,
  CompactFormFieldRange,
  CompactFormFields,
  CompactFormValues,
} from '@project/components/compact-form/compact-form';
import {
  CompiledRandomizerVariable,
  CompiledRandomizerVariableInteger
} from '@project/model/compiled';
import { Collection } from '@project/services/collection/collection';
import { NavigationContext } from '@project/services/navigation/navigation';
import { Randomizer } from '@project/services/randomizer/randomizer';

type UISlot = {
  key: string;
  title: string;
  text: string;
};
type UISlotGroup = {
  key: string;
  title: string;
  slots: UISlot[];
};

@Component({
  selector: 'app-game-randomize-page',
  imports: [
    CompactForm,
  ],
  templateUrl: './game-randomize-page.html',
  styleUrl: './game-randomize-page.css',
})
export class GameRandomizePage {
  collection = inject(Collection);
  randomize = inject(Randomizer);

  randomizerKey = input.required<string>();
  navigationContext = input.required<NavigationContext>();

  randomizer = computed(() => {
    const content = this.collection.content();
    const randomizer = content?.randomizers.find(r => r.key === this.randomizerKey());
    return randomizer;
  });
  form: Signal<{fields: CompactFormFields, values: WritableSignal<CompactFormValues>}|undefined> = computed(() => fromVariablesToForm(this.randomizer()?.variables));
  state = computed(() => {
    const randomizer = this.randomizer();
    const variables = this.form()?.values();

    const groups: UISlotGroup[] = randomizer?.groups.map(g => ({
      key: g.key,
      title: g.name,
      slots: [],
    })) ?? [];
    if (variables !== undefined) {
      for (const slot of randomizer?.computeSlots(variables) ?? []) {
        const groupKey = slot.group ?? '';
        let group = groups.find(g => g.key === groupKey);
        if (group === undefined) {
          group = {
            key: groupKey,
            title: groupKey,
            slots: [],
          };
          groups.push(group);
        }
        group.slots.push({
          key: slot.key,
          title: slot.name,
          text: '',
        });
      }
    }

    const slots: UISlot[] = [];
    for (const group of groups) {
      slots.push(...group.slots);
    }
    return {groups, slots};
  });

  constructor() {
    effect(() => {
      const randomizer = this.randomizer();
      this.navigationContext().title.set(randomizer?.name ?? '');
    });
  }

  roll() {
    const content = this.collection.content();
    const randomizer = this.randomizer();
    if (content === undefined || randomizer === undefined) {
      return;
    }

    const roll = this.randomize.randomize(
      content.components,
      randomizer,
      this.form()?.values() ?? {},
    );
    for (const slot of this.state().slots) {
      slot.text = roll[slot.key].name ?? '';
    }
  }
}

function fromVariablesToForm(variables: CompiledRandomizerVariable[] | undefined): {fields: CompactFormFields, values: WritableSignal<CompactFormValues>} | undefined {
  if (variables === undefined) {
    return undefined;
  }
  const fields = variables.filter(v => v.defaultValue !== undefined).map(fromVariableToField);
  const values = signal<CompactFormValues>(Object.fromEntries(variables.map(v => [v.key, v.defaultValue]).filter(([_, v]) => v !== undefined)));
  return {fields, values};
}
function fromVariableToField(variable: CompiledRandomizerVariable): CompactFormField {
  switch (true) {
    case variable instanceof CompiledRandomizerVariableInteger:
      return {
        key: variable.key,
        type: 'range',
        label: variable.name,
        min: variable.min,
        max: variable.max,
      } as CompactFormFieldRange;
  }
  throw new Error('Unsupported variable type');
}

