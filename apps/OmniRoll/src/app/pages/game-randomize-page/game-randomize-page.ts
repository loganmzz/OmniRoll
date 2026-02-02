import { Component, computed, inject, input, OnChanges, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CompiledGame, CompiledRandomizer } from '@project/model/compiled';
import { CollectionGame } from '@project/services/collection/collection';
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
export class GameRandomizePage implements OnInit, OnChanges {
  route = inject(ActivatedRoute);
  game = input.required<CollectionGame>();
  randomizer = input.required<{content:CompiledGame, randomizer: CompiledRandomizer}>();
  navigationContext = input.required<NavigationContext>();
  state = computed(() => {
    const randomizer = this.randomizer().randomizer;
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
  private randomize = inject(Randomizer);

  ngOnInit() {
    this.ngOnChanges();
  }
  ngOnChanges() {
    this.navigationContext().title?.set(this.randomizer().randomizer.name);
  }

  roll() {
    const {content,randomizer} = this.randomizer();
    const roll = this.randomize.randomize(
      content.components,
      randomizer,
    );
    for (const slot of this.state().slots) {
      slot.text = roll[slot.key].name ?? '';
    }
  }
}
