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
                    {
                      key: 'brama',
                      name: 'Brama',
                    },
                  ],
                  Market: [
                    {
                      key: 'jade',
                      name: 'Jade',
                      properties: {
                        type: 'gem',
                        cost: 2
                      }
                    },
                    {
                      key: 'diamond-cluster',
                      name: 'Diamond cluster',
                      properties: {
                        type: 'gem',
                        cost: 4
                      }
                    },
                    {
                      key: 'burning-opal',
                      name: 'Burning opal',
                      properties: {
                        type: 'gem',
                        cost: 5
                      }
                    },
                    {
                      key: 'unstable-prism',
                      name: 'Unstable prism',
                      properties: {
                        type: 'relic',
                        cost: 3
                      }
                    },
                    {
                      key: 'blasting-staff',
                      name: 'Blasting staff',
                      properties: {
                        type: 'relic',
                        cost: 4
                      }
                    },
                    {
                      key: 'spectral-echo',
                      name: 'Spectral echo',
                      properties: {
                        type: 'spell',
                        cost: 3
                      }
                    },
                    {
                      key: 'ignite',
                      name: 'Ignite',
                      properties: {
                        type: 'spell',
                        cost: 4
                      }
                    },
                    {
                      key: 'essence-theft',
                      name: 'Essence theft',
                      properties: {
                        type: 'spell',
                        cost: 5
                      }
                    },
                    {
                      key: 'chaos-arc',
                      name: 'Chaos arc',
                      properties: {
                        type: 'spell',
                        cost: 6
                      }
                    },
                  ],
                },
              },
            ],
          },
        ],
        randomizers: [
          {
            key: '2-players',
            name: 'Two players',
            pools: [
              {
                key: 'nemesis',
                criteria: [
                  '@kinds == \'Nemesis\''
                ]
              },
              {
                key: 'mages',
                criteria: [
                  '@kinds == \'Mage\''
                ]
              },
              {
                key: 'gems',
                criteria: [
                  '@kinds == \'Market\' && @type == \'gem\''
                ]
              },
              {
                key: 'relics',
                criteria: [
                  '@kinds == \'Market\' && @type == \'relic\''
                ]
              },
              {
                key: 'spells',
                criteria: [
                  '@kinds == \'Market\' && @type == \'spell\''
                ]
              },
            ],
            groups: [
              {
                key: 'nemesis',
                name: 'Nemesis',
              },
              {
                key: 'mages',
                name: 'Mages',
              },
              {
                key: 'gems',
                name: 'Gems',
              },
              {
                key: 'relics',
                name: 'Relics',
              },
              {
                key: 'spells',
                name: 'Spells',
              },
            ],
            slots: [
              {
                key: 'nemesis',
                pool: 'nemesis',
                group: 'nemesis',
              },
              {
                key: 'mage1',
                pool: 'mages',
                group: 'mages',
              },
              {
                key: 'mage2',
                pool: 'mages',
                group: 'mages',
              },
              {
                key: 'gem1',
                pool: 'gems',
                group: 'gems',
                criteria: [
                  '@cost < 4'
                ],
              },
              {
                key: 'gem2',
                pool: 'gems',
                group: 'gems',
                criteria: [
                  '@cost == 4'
                ],
              },
              {
                key: 'gem3',
                pool: 'gems',
                group: 'gems',
                criteria: [
                  '@cost > 4'
                ],
              },
              {
                key: 'relic1',
                pool: 'relics',
                group: 'relics',
                criteria: [
                  '@cost < 4'
                ]
              },
              {
                key: 'relic2',
                pool: 'relics',
                group: 'relics',
                criteria: [
                  '@cost >= 4'
                ]
              },
              {
                key: 'spell1',
                pool: 'spells',
                group: 'spells',
                criteria: [
                  '@cost < 4'
                ]
              },
              {
                key: 'spell2',
                pool: 'spells',
                group: 'spells',
                criteria: [
                  '@cost == 4'
                ]
              },
              {
                key: 'spell3',
                pool: 'spells',
                group: 'spells',
                criteria: [
                  '@cost == 5'
                ]
              },
              {
                key: 'spell4',
                pool: 'spells',
                group: 'spells',
                criteria: [
                  '@cost >= 6'
                ]
              }
            ]
          }
        ]
      },
      {
        key: 'skytear-horde',
        name: 'Skytear Horde',
        sets: [
          {
            key: 'skytear-horde-year-1',
            name: 'Skytear Horde (Year #1)',
            sets: [
              {
                key: 'skytear-horde',
                name: 'Skytear Horde',
                components: {
                  Deck: [
                    {
                      key: 'liothan-shapeshifters',
                      name: 'Liothan Shapeshifters',
                      properties: {
                        faction: 'liothan',
                      },
                    },
                    {
                      key: 'taulot-followers',
                      name: 'Taulot Followers',
                      properties: {
                        faction: 'taulot',
                      },
                    },
                    {
                      key: 'kurumo-warriors',
                      name: 'Kurumo Warriors',
                      properties: {
                        faction: 'kurumo',
                      },
                    },
                  ],
                  Horde: [
                    {
                      key: 'renegade',
                      name: 'Renegade',
                      properties: {
                        difficulty: 10,
                      }
                    },
                    {
                      key: 'undead',
                      name: 'Undead',
                      properties: {
                        difficulty: 20,
                      },
                    },
                    {
                      key: 'predator',
                      name: 'Predator',
                      properties: {
                        difficulty: 30,
                      },
                    },
                  ],
                },
              },
            ],
          },
        ],
        randomizers: [
          {
            key: 'solo',
            name: 'Solo',
            pools: [
              {
                key: 'deck',
                criteria: [
                  '@kinds == \'Deck\'',
                ],
              },
              {
                key: 'horde',
                criteria: [
                  '@kinds == \'Horde\'',
                ],
              },
            ],
            slots: [
              {
                key: 'Deck',
                pool: 'deck',
              },
              {
                key: 'Horde',
                pool: 'horde',
              },
            ],
          },
        ]
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
