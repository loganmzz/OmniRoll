import { Component, inject, input, OnChanges, OnInit, signal } from '@angular/core';
import { TreeModelNode, TreeView } from '@project/components/tree-view/tree-view';
import { Collection, CollectionGame } from '@project/services/collection/collection';
import { GameMetadataSet, Games } from '@project/services/games/games';

@Component({
  selector: 'app-game-collection-page',
  imports: [TreeView],
  templateUrl: './game-collection-page.html',
  styleUrl: './game-collection-page.css',
})
export class GameCollectionPage implements OnInit, OnChanges {
  services = {
    games: inject(Games),
    collection: inject(Collection),
  }
  game = input.required<CollectionGame>();
  nodes = signal<TreeModelNode[]>([]);

  ngOnInit() {
    return this.ngOnChanges();
  }
  async ngOnChanges() {
    this.nodes.set(await this.loadNodes());
  }

  async loadNodes(): Promise<TreeModelNode[]> {
    const metadata = await this.services.games.getMetadata(this.game().key);
    const selecteds = new Set(this.game().sets);
    const nodes = (metadata?.sets || []).map(set => this.setToNode(set, selecteds));
    return nodes;
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
    const game = this.game();
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
