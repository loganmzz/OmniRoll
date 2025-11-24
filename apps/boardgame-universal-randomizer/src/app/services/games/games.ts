import { Injectable } from '@angular/core';
import { CompiledGame } from '@project/model/compiled';
import { DataModelGame } from '@project/model/data-model';

@Injectable({
  providedIn: 'root'
})
export class Games {
  private _content: CompiledGame[] = [];

  constructor() {
    const models: DataModelGame[] = [
      {
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
      },
      {
        key: 'skytear-horde',
        name: 'Skytear Horde',
      },
    ];
    for (const model of models) {
      const result = CompiledGame.newFromDataModel(model);
      if (result.ok !== undefined) {
        this._content.push(result.ok);
      } else if (result.err !== undefined) {
        throw new Error(
          `Invalid game ${JSON.stringify(model.name)}\n${result.err.map(error => `- ${error}`).join('\n')}`
        );
      }
    }
  }

  list(): CompiledGame[] {
    return this._content;
  }

  get(key: string): CompiledGame|undefined {
    return this._content.find(game => game.key === key);
  }
}
