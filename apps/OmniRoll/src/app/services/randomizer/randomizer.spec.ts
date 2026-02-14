import { CompiledComponent, CompiledGame, CompiledRandomizer } from '@project/model/compiled';
import { DataModelGame, DataModelRandomizer } from '@project/model/data-model';
import { Randomizer } from './randomizer';

function toKey(input: Record<string, CompiledComponent>): Record<string, string> {
  return Object.fromEntries(Object.entries(input).map(([key, value]) => [key, value.key]));
}

describe('service/randomizer', () => {
  const randomizer = new Randomizer();

  describe('randomize', () => {

    describe('d1', () => {
      const components: CompiledComponent[] = [];
      CompiledComponent.fillFromDataModel(components, new Set(), {
        key: 'core',
        components: {
          face: [
            {
              key: 'one',
            },
          ],
        }
      }, );
      test('select 1', () => {
        const model: DataModelRandomizer = {
          key: 'select-1',
          pools: [
            {
              key: 'all',
            }
          ],
          slots: [
            {
              key: 'single',
              pool: 'all',
              pick: 'keep',
            }
          ],
        };
        const expected: Record<string, string> = {
          single: 'one',
        };

        const compiled = CompiledRandomizer.newFromDataModel(model).expect();
        expect(
          toKey(randomizer.randomize(components, compiled))
        ).toEqual(expected);
      });

      test('select-2', () => {
        const model: DataModelRandomizer = {
          key: 'select-2',
          pools: [
            {
              key: 'all',
            }
          ],
          slots: [
            {
              key: 'first',
              pool: 'all',
              pick: 'remove',
            },
            {
              key: 'impossible',
              pool: 'all',
              pick: 'remove',
            },
          ],
        };

        const compiled = CompiledRandomizer.newFromDataModel(model).expect();
        expect(
          () => randomizer.randomize(components, compiled)
        ).toThrow('Slot "impossible" can\'t be fulfilled. No left component matching.');
      });
    });

    describe('d6', () => {
      const components: CompiledComponent[] = [];
      CompiledComponent.fillFromDataModel(components, new Set(), {
        key: 'core',
        components: {
          face: [
            {
              key: 'one',
            },
            {
              key: 'two',
            },
            {
              key: 'three',
            },
            {
              key: 'four',
            },
            {
              key: 'five',
            },
            {
              key: 'six',
            },
          ],
        }
      });
      test('select-1', () => {
        const model: DataModelRandomizer = {
          key: 'select-1',
          pools: [
            {
              key: 'all',
            }
          ],
          slots: [
            {
              key: 'single',
              pool: 'all',
              pick: 'keep',
            }
          ],
        };
        const expected: Record<string, string[]> = {
          single: expect.toBeOneOf(['one','two','three','four','five','six']),
        };

        const compiled = CompiledRandomizer.newFromDataModel(model).expect();
        expect(
          toKey(randomizer.randomize(components, compiled))
        ).toMatchObject(expected);
      });
      test('select-10-x-100', () => {
        const model: DataModelRandomizer = {
          key: 'select-10-x-100',
          pools: [
            {
              key: 'all',
            }
          ],
          slots: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => ({
            key: `try${i}`,
            pool: 'all',
            pick: 'keep',
          })),
        };
        const expected: Record<string, string[]> = {
          try0: expect.toBeOneOf(['one','two','three','four','five','six']),
          try1: expect.toBeOneOf(['one','two','three','four','five','six']),
          try2: expect.toBeOneOf(['one','two','three','four','five','six']),
          try3: expect.toBeOneOf(['one','two','three','four','five','six']),
          try4: expect.toBeOneOf(['one','two','three','four','five','six']),
          try5: expect.toBeOneOf(['one','two','three','four','five','six']),
          try6: expect.toBeOneOf(['one','two','three','four','five','six']),
          try7: expect.toBeOneOf(['one','two','three','four','five','six']),
          try8: expect.toBeOneOf(['one','two','three','four','five','six']),
          try9: expect.toBeOneOf(['one','two','three','four','five','six']),
        };

        for (let i = 0; i < 100; i++) {
          const compiled = CompiledRandomizer.newFromDataModel(model).expect();
          expect(
            toKey(randomizer.randomize(components, compiled))
          ).toMatchObject(expected);
        }
      });
      test('pick-3-x-100', () => {
        const model: DataModelRandomizer = {
          key: 'pick-3-x-100',
          pools: [
            {
              key: 'all',
            }
          ],
          slots: [0, 1, 2].map(i => ({
            key: `try${i}`,
            pool: 'all',
            pick: 'remove',
          })),
        };

        for (let i = 0; i < 100; i++) {
          const compiled = CompiledRandomizer.newFromDataModel(model).expect();
          const actual = toKey(randomizer.randomize(components, compiled));
          const left = new Set(['one','two','three','four','five','six']);
          const expected: Record<string, unknown> = {};
          [0, 1, 2].forEach(i => {
            expected[`try${i}`] = expect.toBeOneOf([...left]);
            left.delete(actual[`try${i}`]);
          })
          expect(actual).toMatchObject(expected);
        }
      });
    });

    describe('aeon\'s end', () => {
      const model: DataModelGame = {
        key: 'aeons-end',
        sets: [
          {
            key: 'minimalist',
            components: {
              Nemesis: [
                {
                  key: 'carapace-queen'
                }
              ],
              Mage: [
                {
                  key: 'adelheim'
                },
                {
                  key: 'brama'
                }
              ],
              Market: [
                {
                  key: 'jade',
                  properties: {
                    type: 'gem',
                    cost: 2
                  }
                },
                {
                  key: 'diamond-cluster',
                  properties: {
                    type: 'gem',
                    cost: 4
                  }
                },
                {
                  key: 'burning-opal',
                  properties: {
                    type: 'gem',
                    cost: 5
                  }
                },
                {
                  key: 'unstable-prism',
                  properties: {
                    type: 'relic',
                    cost: 3
                  }
                },
                {
                  key: 'blasting-staff',
                  properties: {
                    type: 'relic',
                    cost: 4
                  }
                },
                {
                  key: 'spectral-echo',
                  properties: {
                    type: 'spell',
                    cost: 3
                  }
                },
                {
                  key: 'ignite',
                  properties: {
                    type: 'spell',
                    cost: 4
                  }
                },
                {
                  key: 'essence-theft',
                  properties: {
                    type: 'spell',
                    cost: 5
                  }
                },
                {
                  key: 'chaos-arc',
                  properties: {
                    type: 'spell',
                    cost: 6
                  }
                }
              ]
            }
          }
        ],
        randomizers: [
          {
            key: '2-players',
            pools: [
              {
                key: 'nemesis',
                criteria: 'c.kinds == \'Nemesis\'',
              },
              {
                key: 'mages',
                criteria: 'c.kinds == \'Mage\'',
              },
              {
                key: 'gems',
                criteria: 'c.kinds == \'Market\' && c.type == \'gem\'',
              },
              {
                key: 'relics',
                criteria: 'c.kinds == \'Market\' && c.type == \'relic\'',
              },
              {
                key: 'spells',
                criteria: 'c.kinds == \'Market\' && c.type == \'spell\'',
              },
            ],
            slots: [
              {
                key: 'nemesis',
                pool: 'nemesis'
              },
              {
                key: 'mage1',
                pool: 'mages'
              },
              {
                key: 'mage2',
                pool: 'mages'
              },
              {
                key: 'gem1',
                pool: 'gems',
                criteria: 'c.cost < 4',
              },
              {
                key: 'gem2',
                pool: 'gems',
                criteria: 'c.cost == 4',
              },
              {
                key: 'gem3',
                pool: 'gems',
                criteria: 'c.cost > 4',
              },
              {
                key: 'relic1',
                pool: 'relics',
                criteria: 'c.cost < 4',
              },
              {
                key: 'relic2',
                pool: 'relics',
                criteria: 'c.cost >= 4',
              },
              {
                key: 'spell1',
                pool: 'spells',
                criteria: 'c.cost < 4'
              },
              {
                key: 'spell2',
                pool: 'spells',
                criteria: 'c.cost == 4',
              },
              {
                key: 'spell3',
                pool: 'spells',
                criteria: 'c.cost == 5',
              },
              {
                key: 'spell4',
                pool: 'spells',
                criteria: 'c.cost >= 6',
              }
            ]
          }
        ]
      };
      const compiled = CompiledGame.newFromDataModel(model).expect();

      test('2-players', () => {
        const rand = compiled.randomizers.find(r => r.key === '2-players');
        if (rand === undefined) {
          throw new Error(`Randomizer "standard 2-players" not found`);
        }
        const randomized = randomizer.randomize(
          compiled.components,
          rand,
        );
        const expected = {
          nemesis: 'carapace-queen',
          mages: new Set(['adelheim', 'brama']),
          gems: ['jade', 'diamond-cluster', 'burning-opal'],
          relics: ['unstable-prism', 'blasting-staff'],
          spells: ['spectral-echo', 'ignite', 'essence-theft', 'chaos-arc'],
        };
        const actual = {
          nemesis: '',
          mages: new Set<string>(),
          gems: [] as string[],
          relics: [] as string[],
          spells: [] as string[],
        };
        for (const pool of Object.keys(randomized).sort()) {
          const key = randomized[pool]?.key ?? '';
          if (pool === 'nemesis') {
            actual.nemesis = key;
          } else if (pool.startsWith('mage')) {
            actual.mages.add(key);
          } else if (pool.startsWith('gem')) {
            actual.gems.push(key);
          } else if (pool.startsWith('relic')) {
            actual.relics.push(key);
          } else if (pool.startsWith('spell')) {
            actual.spells.push(key);
          } else {
            throw new Error(`Invalid randomized pool name ${JSON.stringify(pool)}`);
          }
        }
        expect(actual).toEqual(expected);
      });
    })
  });
});
