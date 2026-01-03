import { Component, computed, inject, input } from '@angular/core';
import { CompiledGame, CompiledRandomizer } from '@project/model/compiled';
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
  game = input.required<CompiledGame>();
  randomizer = input.required<CompiledRandomizer>();
  state = computed(() => {
    const randomizer = this.randomizer();
    const groups: UISlotGroup[] = randomizer.groups.map(g => ({
      key: g.key,
      title: g.name,
      slots: [],
    }));
    for (const slot of randomizer.slots) {
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
        title: slot.key,
        text: '',
      });
    }
    const slots: UISlot[] = [];
    for (const group of groups) {
      slots.push(...group.slots);
    }
    return {groups, slots};
  });
  private randomize = inject(Randomizer);

  roll() {
    const roll = this.randomize.randomize(
      this.game().components,
      this.randomizer(),
    );
    for (const slot of this.state().slots) {
      slot.text = roll[slot.key].name ?? '';
    }
  }
}
