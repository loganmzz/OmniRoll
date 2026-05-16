import {
  Component,
  OnInit,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import {
  Collection,
  CollectionGameSet,
} from '@project/services/collection/collection';
import { NavigationContext } from '@project/services/navigation/navigation';
import { TreeNode } from 'primeng/api';
import { TreeModule } from 'primeng/tree';

@Component({
  selector: 'app-game-collection-page',
  imports: [
    TreeModule,
  ],
  templateUrl: './game-collection-page.html',
  styleUrl: './game-collection-page.css',
})
export class GameCollectionPage implements OnInit {
  services = {
    collection: inject(Collection),
  }
  navigationContext = input.required<NavigationContext>();
  tree = signal<TreeNode[]>([]);
  selectedNodes = signal<TreeNode[]>([]);

  constructor() {
    effect(async () => {
      const collection = this.services.collection.game();
      if (collection === undefined) {
        this.tree.set([]);
        this.selectedNodes.set([]);
        return;
      }
      const selecteds = new Set(collection.selectedSets);
      this.selectedNodes.set(collection.selectedSets.map(key => ({ key })));

      this.tree.set(collection.availableSets.map(set => this.computeTree(set, selecteds)))
    });
  }

  async ngOnInit() {
    this.navigationContext().title.set('Collection ✏️');
  }

  private computeTree(set: CollectionGameSet, selecteds: Set<string>, preselected = false): TreeNode {
    const selected = selecteds.has(set.key);
    const icon = selected ? 'pi-check' : preselected ? 'pi-check-circle' : 'pi-ban';
    const selectClass = selected ? 'selected' : preselected ? 'preselected' : 'unselected';
    return {
      key: set.key,
      data: set,
      label: set.name,
      expanded: true,
      icon: `pi ${icon}`,
      styleClass: `${selectClass}`,
      children: set.sets.map(s => this.computeTree(s, selecteds, selected || preselected)),
    }
  }

  async handleTreeSelection() {
    const selection = this.selectedNodes().map(node => node.key).filter(key => key !== undefined);
    const game = this.services.collection.game();
    if (game === undefined) {
      return;
    }
    game.selectedSets = selection;
    await this.services.collection.updateGame(game);
  }
}
