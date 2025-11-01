import { Injectable } from '@angular/core';
import { CompiledGame } from '@project/model/compiled';

@Injectable({
  providedIn: 'root'
})
export class Games {
  private _content: CompiledGame[] = [];

  constructor() {
    this._content.push(CompiledGame.newFromDataModel({
      key: 'aeons-end',
      name: 'Aeon\'s End',
      sets: [
        {
          key: 'wave-1',
          name: 'Wave 1 - Base',
          sets: [
            {
              key: 'base',
              name: 'Base game',
              components: {
                Nemesis: [
                  {
                    key: 'carapace-queen',
                    name: 'Carapace Queen',
                  },
                ],
                Mage: [
                  {
                    key: 'adelheim',
                    name: 'Adelheim',
                  },
                ],
                Market: [
                  {
                    key: 'diamond-cluster',
                    name: 'Diamond Cluster',
                  },
                ],
              },
            },
          ],
        },
      ],
    }));
    this._content.push(CompiledGame.newFromDataModel({
      key: 'skytear-horde',
      name: 'Skytear Horde',
    }));
  }

  list(): CompiledGame[] {
    return this._content;
  }

  get(key: string): CompiledGame|undefined {
    return this._content.find(game => game.key === key);
  }
}
