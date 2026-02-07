import { Component, effect, inject, input, OnInit, signal } from '@angular/core';
import { TreeModelNode, TreeView } from '@project/components/tree-view/tree-view';
import { Collection } from '@project/services/collection/collection';
import { GameMetadataSet, Games } from '@project/services/games/games';
import { NavigationContext } from '@project/services/navigation/navigation';

@Component({
  selector: 'app-game-collection-page',
  imports: [TreeView],
  templateUrl: './game-collection-page.html',
  styleUrl: './game-collection-page.css',
})
export class GameCollectionPage implements OnInit {
  services = {
    games: inject(Games),
    collection: inject(Collection),
  }
  navigationContext = input.required<NavigationContext>();
  nodes = signal<TreeModelNode[]>([]);

  constructor() {
    effect(async () => {
      const collection = await this.services.collection.game();
      if (collection === undefined) {
        this.nodes.set([]);
        return;
      }
      const metadata = await this.services.games.getMetadata(collection.key);
      const selecteds = new Set(collection.sets);
      const nodes = (metadata?.sets || []).map(set => this.setToNode(set, selecteds));
      this.nodes.set(nodes);
    });
  }

  async ngOnInit() {
    this.navigationContext().title.set('Collection ✏️');
  }

  private setToNode(set: GameMetadataSet, selecteds: Set<string>): TreeModelNode {
    return {
      key: set.key,
      label: set.name,
      selected: selecteds.has(set.key),
      children: set.sets.map(s => this.setToNode(s, selecteds)),
    };
  }

  async handleSelectionEvent() {
    const selection: string[] = [];
    this.collectSelected(selection, this.nodes());
    const game = this.services.collection.game();
    if (game === undefined) {
      return;
    }
    game.sets = selection;
    await this.services.collection.updateGame(game);
  }
  private collectSelected(selection: string[], nodes: TreeModelNode[]) {
    for (const node of nodes) {
      if (node.selected) {
        selection.push(node.key);
      }
      this.collectSelected(selection, node.children);
    }
  }
}
