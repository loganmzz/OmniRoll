import { Component, computed, effect, inject, input } from '@angular/core';
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
  imports: [],
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
  })
  state = computed(() => {
    const randomizer = this.randomizer();
    const groups: UISlotGroup[] = randomizer?.groups.map(g => ({
      key: g.key,
      title: g.name,
      slots: [],
    })) ?? [];
    for (const slot of randomizer?.slots ?? []) {
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
    );
    for (const slot of this.state().slots) {
      slot.text = roll[slot.key].name ?? '';
    }
  }
}
