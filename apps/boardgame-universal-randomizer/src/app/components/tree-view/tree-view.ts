import { Component, input, output } from '@angular/core';

export interface TreeModelNode {
  key: string;
  label: string;
  selected: boolean;
  children: TreeModelNode[];
}

export interface TreeNodeSelectionEvent {
  path: TreeModelNode[];
  node: TreeModelNode;
  selected: boolean;
}

@Component({
  selector: 'app-tree-view',
  imports: [],
  templateUrl: './tree-view.html',
  styleUrl: './tree-view.css',
})
export class TreeView {
  parents = input<TreeModelNode[]>();
  nodes = input.required<TreeModelNode[]>();
  preselected = input<boolean>(false);
  nodeSelectionChanged = output<TreeNodeSelectionEvent>();

  childPath(node: TreeModelNode): TreeModelNode[] {
    const parents = this.parents() ?? [];
    return [...parents, node];
  }

  dispatch(event: TreeNodeSelectionEvent) {
    this.nodeSelectionChanged.emit(event);
  }
  switchNodeSelection(node: TreeModelNode) {
    node.selected = !node.selected;
    this.nodeSelectionChanged.emit({
      path: this.childPath(node),
      node,
      selected: node.selected,
    });
  }
}
