import {
  CompiledComponent,
  CompiledGame,
  ComponentCompilation,
  ComponentSetCompilation,
  GameCompilation,
} from './compiled';
import {
  ReferentialComponent,
  ReferentialGame,
  ReferentialSet,
} from './referential';

describe('model/compiled', () => {
  describe('component', () => {
    test('default', () => {
      const input: ReferentialComponent = {
        key: 'default',
        name: 'Default',
      };

      const expected: ComponentCompilation = {
        content: new CompiledComponent(),
        needs: undefined,
      };
      expected.content.key = 'default';
      expected.content.name = 'Default';
      expected.content.kinds.add('One');
      expect(CompiledComponent.newFromDataModel({sets: new Set(), features: new Set()}, 'One', input).expect()).toStrictEqual(expected);
    });
  });

  describe('component.set', () => {
    test('single', () => {
      const input: ReferentialSet = {
        key: 'single',
        components: {
          One: [
            {
              key: 'a1',
            },
            {
              key: 'a2',
            },
          ],
        },
      };

      const expected: ComponentSetCompilation = {
        content: [
          (() => {
            const component = new CompiledComponent();
            component.key = 'a1';
            component.name = 'a1';
            component.kinds.add('One');
            component.sets.add('single');
            return component;
          })(),
          (() => {
            const component = new CompiledComponent();
            component.key = 'a2';
            component.name = 'a2';
            component.kinds.add('One');
            component.sets.add('single');
            return component;
          })(),
        ],
        conditionals: {
          components: [],
        },
      };

      expect(CompiledComponent.newFromDataModelSet({sets: new Set(), features: new Set()}, input).expect()).toStrictEqual(expected);
    });

    test('nested', () => {
      const input: ReferentialSet = {
        key: 'root',
        sets: [
          {
            key: 'a',
            components: {
              One: [
                {
                  key: 'a1',
                },
                {
                  key: 'a2',
                },
              ],
            }
          },

          {
            key: 'b',
            components: {
              One: [
                {
                  key: 'b1',
                },
                {
                  key: 'b2',
                },
              ],
            },
          },
        ],
      };

      const expected: ComponentSetCompilation = {
        content: [
          (() => {
            const component = new CompiledComponent();
            component.key = 'a1';
            component.name = 'a1';
            component.kinds.add('One');
            component.sets.add('root');
            component.sets.add('a');
            return component;
          })(),
          (() => {
            const component = new CompiledComponent();
            component.key = 'a2';
            component.name = 'a2';
            component.kinds.add('One');
            component.sets.add('root');
            component.sets.add('a');
            return component;
          })(),
          (() => {
            const component = new CompiledComponent();
            component.key = 'b1';
            component.name = 'b1';
            component.kinds.add('One');
            component.sets.add('root');
            component.sets.add('b');
            return component;
          })(),
          (() => {
            const component = new CompiledComponent();
            component.key = 'b2';
            component.name = 'b2';
            component.kinds.add('One');
            component.sets.add('root');
            component.sets.add('b');
            return component;
          })(),
        ],
        conditionals: {
          components: [],
        },
      };

      expect(CompiledComponent.newFromDataModelSet({sets: new Set(), features: new Set()}, input).expect()).toStrictEqual(expected);
    })
  });

  describe('game', () => {
    test('empty', () => {
      const input: ReferentialGame = {
        key: 'empty',
      };

      const expected: GameCompilation = {
        content: new CompiledGame(),
        conditionals: {
          components: [],
          randomizers: [],
        },
      };
      expected.content.key = 'empty';
      expected.content.name = 'empty';

      expect(CompiledGame.newFromDataModel(input).expect()).toStrictEqual(expected);
    });

    test('component', () => {
      const input: ReferentialGame = {
        key: 'component',
        name: 'Component',
        sets: [
          {
            key: 'singleton',
            name: 'Singleton',
            features: ['set:core'],
            components: {
              One: [
                {
                  key: 'one',
                  name: 'Neo',
                  description: 'a single element',
                  features: ['component:one'],
                  properties: {
                    foo: 'bar',
                    answer: 42,
                    // Check non-hidding common properties
                    key: false,
                    name: false,
                    kinds: false,
                    sets: false,
                  },
                },
                {
                  key: 'two',
                  name: 'Owt',
                  properties: {
                    foo: 'foo',
                    answer: 64,
                    // Check non-hidding common properties
                    key: true,
                    name: true,
                    kinds: true,
                    sets: true,
                  },
                },
              ],
            },
          },
          {
            key: 'another',
            components: {
              Another: [
                {
                  key: 'another',
                  name: 'Hornet'
                },
              ],
            },
          },
        ],
      };

      const expected: GameCompilation = {
        content: new CompiledGame(),
        conditionals: {
          components: [],
          randomizers: [],
        },
      };
      expected.content.key = 'component';
      expected.content.name = 'Component';
      expected.content.features.add('set:core');
      expected.content.features.add('component:one');
      expected.content.components.push((() => {
        const component = new CompiledComponent();
        component.key = 'one';
        component.name = 'Neo';
        component.kinds.add('One');
        component.features.add('set:core');
        component.features.add('component:one');
        component.sets.add('singleton');
        component['foo'] = 'bar';
        component['answer'] = 42;
        return component;
      })());
      expected.content.components.push((() => {
        const component = new CompiledComponent();
        component.key = 'two';
        component.name = 'Owt';
        component.kinds.add('One');
        component.features.add('set:core');
        component.sets.add('singleton');
        component['foo'] = 'foo';
        component['answer'] = 64;
        return component;
      })());
      expected.content.components.push((() => {
        const component = new CompiledComponent();
        component.key = 'another';
        component.name = 'Hornet';
        component.kinds.add('Another');
        component.sets.add('another');
        return component;
      })());

      expect(CompiledGame.newFromDataModel(input).expect()).toStrictEqual(expected);
    });

    describe('selection', () => {
      test('basic', () => {
        const input: ReferentialGame = {
          key: 'selection',

          sets: [
            {
              key: 's1',
              sets: [
                {
                  key: 's1-1',
                  components: {
                    One: [
                      {
                        key: 's1-1-a',
                      },
                    ],
                  },
                },
                {
                  key: 's1-2',
                  components: {
                    One: [
                      {
                        key: 's1-2-a',
                      },
                      {
                        key: 's1-2-b',
                        needs: {
                          sets: ['s1-1'],
                        },
                      },
                    ],
                  },
                },
                {
                  key: 's1-3',
                  components: {
                    One: [
                      {
                        key: 's1-3-a',
                        needs: {
                          sets: ['s1-2'],
                        }
                      },
                    ],
                  }
                }
              ],
            },
            {
              key: 's2',
              sets: [
                {
                  key: 's2-1',
                  components: {
                    One: [
                      {
                        key: 's2-1-a',
                      },
                    ],
                  },
                },
                {
                  key: 's2-2',
                  components: {
                    One: [
                      {
                        key: 's2-2-a',
                      },
                      {
                        key: 's2-2-b',
                        needs: {
                          sets: ['s1-1'],
                        },
                      },
                      {
                        key: 's2-2-c',
                        needs: {
                          sets: ['s2-1'],
                        },
                      },
                    ],
                  },
                },
              ],
            },
            {
              key: 'promo',
              components: {
                One: [
                  {
                    key: 'promo-a',
                    needs: {
                      sets: ['s1-3'],
                    }
                  },
                ],
              }
            }
          ],
        };

        const { content: game, conditionals } = CompiledGame.newFromDataModel(input).expect();
        expect(game).toStrictEqual((() => {
          const compiled = new CompiledGame();
          compiled.key = 'selection';
          compiled.name = 'selection';

          compiled.components.push((() => {
            const component = new CompiledComponent();
            component.key = 's1-1-a';
            component.name = 's1-1-a';
            component.kinds.add('One');
            component.sets.add('s1');
            component.sets.add('s1-1');
            return component;
          })());
          compiled.components.push((() => {
            const component = new CompiledComponent();
            component.key = 's1-2-a';
            component.name = 's1-2-a';
            component.kinds.add('One');
            component.sets.add('s1');
            component.sets.add('s1-2');
            return component;
          })());

          compiled.components.push((() => {
            const component = new CompiledComponent();
            component.key = 's2-1-a';
            component.name = 's2-1-a';
            component.kinds.add('One');
            component.sets.add('s2');
            component.sets.add('s2-1');
            return component;
          })());
          compiled.components.push((() => {
            const component = new CompiledComponent();
            component.key = 's2-2-a';
            component.name = 's2-2-a';
            component.kinds.add('One');
            component.sets.add('s2');
            component.sets.add('s2-2');
            return component;
          })());

          return compiled;
        })());

        game.applySelection(
          new Set([
            's1',
            'promo',
          ]),
          conditionals.components,
          conditionals.randomizers,
        );
        expect(game).toStrictEqual((() => {
          const compiled = new CompiledGame();
          compiled.key = 'selection';
          compiled.name = 'selection';

          compiled.components.push((() => {
            const component = new CompiledComponent();
            component.key = 's1-1-a';
            component.name = 's1-1-a';
            component.kinds.add('One');
            component.sets.add('s1');
            component.sets.add('s1-1');
            return component;
          })());
          compiled.components.push((() => {
            const component = new CompiledComponent();
            component.key = 's1-2-a';
            component.name = 's1-2-a';
            component.kinds.add('One');
            component.sets.add('s1');
            component.sets.add('s1-2');
            return component;
          })());
          compiled.components.push((() => {
            const component = new CompiledComponent();
            component.key = 's1-2-b';
            component.name = 's1-2-b';
            component.kinds.add('One');
            component.sets.add('s1');
            component.sets.add('s1-2');
            return component;
          })());
          compiled.components.push((() => {
            const component = new CompiledComponent();
            component.key = 's1-3-a';
            component.name = 's1-3-a';
            component.kinds.add('One');
            component.sets.add('s1');
            component.sets.add('s1-3');
            return component;
          })());
          compiled.components.push((() => {
            const component = new CompiledComponent();
            component.key = 'promo-a';
            component.name = 'promo-a';
            component.kinds.add('One');
            component.sets.add('promo');
            return component;
          })());

          return compiled;
        })());
      });

      test('no-promo', () => {
        const input: ReferentialGame = {
          key: 'selection',

          sets: [
            {
              key: 's1',
              sets: [
                {
                  key: 's1-1',
                  components: {
                    One: [
                      {
                        key: 's1-1-a',
                      },
                    ],
                  },
                },
                {
                  key: 's1-2',
                  components: {
                    One: [
                      {
                        key: 's1-2-a',
                      },
                      {
                        key: 's1-2-b',
                        needs: {
                          sets: ['s1-1'],
                        },
                      },
                    ],
                  },
                },
                {
                  key: 's1-3',
                  components: {
                    One: [
                      {
                        key: 's1-3-a',
                        needs: {
                          sets: ['s2-1'],
                        }
                      },
                    ],
                  }
                }
              ],
            },
            {
              key: 's2',
              sets: [
                {
                  key: 's2-1',
                  components: {
                    One: [
                      {
                        key: 's2-1-a',
                      },
                    ],
                  },
                },
                {
                  key: 's2-2',
                  components: {
                    One: [
                      {
                        key: 's2-2-a',
                      },
                      {
                        key: 's2-2-b',
                        needs: {
                          sets: ['s1-1'],
                        },
                      },
                      {
                        key: 's2-2-c',
                        needs: {
                          sets: ['s2-1'],
                        },
                      },
                    ],
                  },
                },
              ],
            },
            {
              key: 'promo',
              components: {
                One: [
                  {
                    key: 'promo-a',
                    needs: {
                      sets: ['s1-3'],
                    }
                  },
                ],
              }
            }
          ],
        };

        const { content: game, conditionals } = CompiledGame.newFromDataModel(input).expect();
        expect(game).toStrictEqual((() => {
          const compiled = new CompiledGame();
          compiled.key = 'selection';
          compiled.name = 'selection';

          compiled.components.push((() => {
            const component = new CompiledComponent();
            component.key = 's1-1-a';
            component.name = 's1-1-a';
            component.kinds.add('One');
            component.sets.add('s1');
            component.sets.add('s1-1');
            return component;
          })());
          compiled.components.push((() => {
            const component = new CompiledComponent();
            component.key = 's1-2-a';
            component.name = 's1-2-a';
            component.kinds.add('One');
            component.sets.add('s1');
            component.sets.add('s1-2');
            return component;
          })());

          compiled.components.push((() => {
            const component = new CompiledComponent();
            component.key = 's2-1-a';
            component.name = 's2-1-a';
            component.kinds.add('One');
            component.sets.add('s2');
            component.sets.add('s2-1');
            return component;
          })());
          compiled.components.push((() => {
            const component = new CompiledComponent();
            component.key = 's2-2-a';
            component.name = 's2-2-a';
            component.kinds.add('One');
            component.sets.add('s2');
            component.sets.add('s2-2');
            return component;
          })());

          return compiled;
        })());

        game.applySelection(
          new Set([
            's1',
            'promo',
          ]),
          conditionals.components,
          conditionals.randomizers,
        );
        expect(game).toStrictEqual((() => {
          const compiled = new CompiledGame();
          compiled.key = 'selection';
          compiled.name = 'selection';

          compiled.components.push((() => {
            const component = new CompiledComponent();
            component.key = 's1-1-a';
            component.name = 's1-1-a';
            component.kinds.add('One');
            component.sets.add('s1');
            component.sets.add('s1-1');
            return component;
          })());
          compiled.components.push((() => {
            const component = new CompiledComponent();
            component.key = 's1-2-a';
            component.name = 's1-2-a';
            component.kinds.add('One');
            component.sets.add('s1');
            component.sets.add('s1-2');
            return component;
          })());
          compiled.components.push((() => {
            const component = new CompiledComponent();
            component.key = 's1-2-b';
            component.name = 's1-2-b';
            component.kinds.add('One');
            component.sets.add('s1');
            component.sets.add('s1-2');
            return component;
          })());

          return compiled;
        })());
      });
    });

    test.each(
      [
        {
          title: 'Game key',
          input: {
            key: '_',
          },
          expected: [
            `/key: Game key "_" is invalid`,
          ],
        },
        {
          title: 'Set key',
          input: {
            key: 'game',
            sets: [
              {
                key: '_',
              },
            ],
          },
          expected: [
            `/sets[0:_]/key: Set key "_" is invalid`,
          ],
        },
        {
          title: 'Set duplicate sibling',
          input: {
            key: 'game',
            sets: [
              {
                key: 'a',
                name: 'first',
              },
              {
                key: 'a',
                name: 'second',
              },
            ],
          },
          expected: [
            `/sets[1:a]: Set "second" (a) already exists as "first" at /sets[0:a]`,
          ],
        },
        {
          title: 'Set duplicate any',
          input: {
            key: 'game',
            sets: [
              {
                key: 'a',
                name: 'level 0',
                sets: [
                  {
                    key: 'a1',
                    name: 'level 0-0',
                    sets: [
                      {
                        key: 'a1a',
                        name: 'level 0-0-0',
                      },
                      {
                        key: 'duplicate',
                        name: 'level 0-0-1',
                      },
                    ],
                  },
                  {
                    key: 'a2',
                    name: 'level 0-1',
                    sets: [
                      {
                        key: 'a2a',
                        name: 'level 0-1-0',
                      },
                      {
                        key: 'a2b',
                        name: 'level 0-1-1',
                      },
                    ],
                  },
                ],
              },
              {
                key: 'b',
                name: 'level 1',
                sets: [
                  {
                    key: 'b1',
                    name: 'level 1-0',
                    sets: [
                      {
                        key: 'b1a',
                        name: 'level 1-0-0',
                      },
                      {
                        key: 'b1b',
                        name: 'level 1-0-1',
                      },
                    ],
                  },
                  {
                    key: 'b2',
                    name: 'level 1-1',
                    sets: [
                      {
                        key: 'b2a',
                        name: 'level 1-1-0',
                      },
                      {
                        key: 'duplicate',
                        name: 'level 1-1-1',
                      },
                    ],
                  },
                ],
              },
            ],
          },
          expected: [
            `/sets[1:b]/sets[1:b2]/sets[1:duplicate]: Set "level 1-1-1" (duplicate) already exists as "level 0-0-1" at /sets[0:a]/sets[0:a1]/sets[1:duplicate]`,
          ],
        },
        {
          title: 'Component key',
          input: {
            key: 'game',
            sets: [
              {
                key: 'core',
                components: {
                  Main: [
                    {
                      key: '_',
                    },
                  ],
                },
              },
            ],
          },
          expected: [
            `/sets[0:core]/components[Main]/[0:_]/key: Component key "_" is invalid. It doesn't match /^[a-z0-9][a-z0-9_-]*$/`,
          ],
        },
        {
          title: 'Component duplicate sibling',
          input: {
            key: 'game',
            sets: [
              {
                key: 'core',
                components: {
                  Main: [
                    {
                      key: 'some',
                      name: 'first',
                    },
                    {
                      key: 'some',
                      name: 'second',
                    }
                  ],
                },
              },
            ],
          },
          expected: [
            `/sets[0:core]/components[Main]/[1:some]: Component "second" (some) already exists as "first" at /sets[0:core]/components[Main]/[0:some]`,
          ],
        },
        {
          title: 'Component duplicate any',
          input: {
            key: 'game',
            sets: [
              {
                key: 'a',
                sets: [
                  {
                    key: 'a1',
                    components: {
                      Boss: [
                        {
                          key: 'boss-0',
                          name: 'Boss 0',
                        },
                        {
                          key: 'duplicate',
                          name: 'Boss 1',
                        },
                      ],
                      Hero: [
                        {
                          key: 'hero-0',
                          name: 'Hero 0',
                        },
                        {
                          key: 'hero-1',
                          name: 'Hero 1',
                        },
                      ],
                    },
                  },
                  {
                    key: 'a2',
                    components: {
                      Boss: [
                        {
                          key: 'boss-2',
                          name: 'Boss 2',
                        },
                        {
                          key: 'boss-3',
                          name: 'Boss 3',
                        },
                      ],
                      Hero: [
                        {
                          key: 'hero-2',
                          name: 'Hero 2',
                        },
                        {
                          key: 'hero-3',
                          name: 'Hero 3',
                        },
                      ],
                    },
                  },
                ],
              },
              {
                key: 'b',
                sets: [
                  {
                    key: 'b1',
                    components: {
                      Boss: [
                        {
                          key: 'boss-4',
                          name: 'Boss 4',
                        },
                        {
                          key: 'boss-5',
                          name: 'Boss 5',
                        },
                      ],
                      Hero: [
                        {
                          key: 'hero-4',
                          name: 'Hero 4',
                        },
                        {
                          key: 'hero-5',
                          name: 'Hero 5',
                        },
                      ],
                    },
                  },
                  {
                    key: 'b2',
                    components: {
                      Boss: [
                        {
                          key: 'boss-6',
                          name: 'Boss 6',
                        },
                        {
                          key: 'boss-7',
                          name: 'Boss 7',
                        },
                      ],
                      Hero: [
                        {
                          key: 'duplicate',
                          name: 'Hero 6',
                        },
                        {
                          key: 'hero-7',
                          name: 'Hero 7',
                        },
                      ],
                    },
                  },
                ],
              },
            ],
          },
          expected: [
            `/sets[1:b]/sets[1:b2]/components[Hero]/[0:duplicate]: Component "Hero 6" (duplicate) already exists as "Boss 1" at /sets[0:a]/sets[0:a1]/components[Boss]/[1:duplicate]`,
          ],
        },
        {
          title: 'Randomizer key',
          input: {
            key: 'game',
            randomizers: [
              {
                key: '_',
              },
            ],
          },
          expected: [
            `/randomizers[0:_]/key: Randomizer key "_" is invalid`,
          ],
        },
        {
          title: 'Randomizer duplicate',
          input: {
            key: 'game',
            randomizers: [
              {
                key: 'default',
                name: 'first',
              },
              {
                key: 'default',
                name: 'second',
              },
            ],
          },
          expected: [
            `/randomizers[1:default]: Randomizer "second" (default) already exists as "first" at /randomizers[0:default]`,
          ],
        },
        {
          title: 'Randomizer pool key',
          input: {
            key: 'game',
            randomizers: [
              {
                key: 'default',
                pools: [
                  {
                    key: '_',
                  }
                ]
              },
            ],
          },
          expected: [
            `/randomizers[0:default]/pools[0:_]/key: Randomizer pool key "_" is invalid`,
          ],
        },
        {
          title: 'Randomizer pool duplicate',
          input: {
            key: 'game',
            randomizers: [
              {
                key: 'a',
                pools: [
                  {
                    key: 'some',
                  }
                ]
              },
              {
                key: 'b',
                pools: [
                  {
                    key: 'dup',
                  },
                  {
                    key: 'some',
                  },
                  {
                    key: 'dup',
                  },
                ],
              },
            ],
          },
          expected: [
            `/randomizers[1:b]/pools[2:dup]: Randomizer pool "dup" (dup) already exists as "dup" at /randomizers[1:b]/pools[0:dup]`,
          ],
        },
        {
          title: 'Randomizer group key',
          input: {
            key: 'game',
            randomizers: [
              {
                key: 'default',
                groups: [
                  {
                    key: '_'
                  }
                ]
              },
            ],
          },
          expected: [
            `/randomizers[0:default]/groups[0:_]/key: Randomizer group key "_" is invalid`,
          ],
        },
        {
          title: 'Randomizer group duplicate',
          input: {
            key: 'game',
            randomizers: [
              {
                key: 'a',
                groups: [
                  {
                    key: 'some',
                  }
                ]
              },
              {
                key: 'b',
                groups: [
                  {
                    key: 'dup',
                  },
                  {
                    key: 'some',
                  },
                  {
                    key: 'dup',
                  },
                ],
              },
            ],
          },
          expected: [
            `/randomizers[1:b]/groups[2:dup]: Randomizer group "dup" (dup) already exists as "dup" at /randomizers[1:b]/groups[0:dup]`,
          ],
        },
        {
          title: 'Randomizer slot key',
          input: {
            key: 'game',
            randomizers: [
              {
                key: 'default',
                slots: [
                  {
                    key: '_'
                  }
                ]
              },
            ],
          },
          expected: [
            `/randomizers[0:default]/slots[0:_]/key: Randomizer slot key "_" is invalid`,
          ],
        },
        {
          title: 'Randomizer slot duplicate',
          input: {
            key: 'game',
            randomizers: [
              {
                key: 'a',
                slots: [
                  {
                    key: 'some',
                  }
                ]
              },
              {
                key: 'b',
                slots: [
                  {
                    key: 'dup',
                  },
                  {
                    key: 'some',
                  },
                  {
                    key: 'dup',
                  },
                ],
              },
            ],
          },
          expected: [
            `/randomizers[1:b]/slots[2:dup]: Randomizer slot "dup" (dup) already exists as "dup" at /randomizers[1:b]/slots[0:dup]`,
          ],
        },
        {
          title: 'Randomizer slot group is required',
          input: {
            key: 'game',
            randomizers: [
              {
                key: 'default',
                groups: [
                  {
                    key: 'required',
                  },
                ],
                slots: [
                  {
                    key: 'a',
                  }
                ]
              },
            ],
          },
          expected: [
            `/randomizers[0:default]/slots[0:a]/group: Randomizer slot group is required. Must be one of: required`,
          ],
        },
        {
          title: 'Randomizer slot group is invalid',
          input: {
            key: 'game',
            randomizers: [
              {
                key: 'default',
                groups: [
                  {
                    key: 'required',
                  },
                ],
                slots: [
                  {
                    key: 'a',
                    group: 'default',
                  }
                ]
              },
            ],
          },
          expected: [
            `/randomizers[0:default]/slots[0:a]/group: Randomizer slot group "default" is invalid. Must be one of: required`,
          ],
        },
        {
          title: 'Randomizer slot group is unexpected',
          input: {
            key: 'game',
            randomizers: [
              {
                key: 'default',
                slots: [
                  {
                    key: 'a',
                    group: 'default',
                  }
                ]
              },
            ],
          },
          expected: [
            `/randomizers[0:default]/slots[0:a]/group: Randomizer slot group "default" is provided but none is expected`,
          ],
        },
      ] as {title: string, input: ReferentialGame, expected: string[]}[]
    )(
      'validation-errors[$#] $title',
      ({input, expected}: {input: ReferentialGame, expected: string[]}) => {
        const result = CompiledGame.newFromDataModel(input);
        if (result.err === undefined) {
          throw new Error(`Should have failed with:\n${expected.join('\n')}`);
        }
        expect(`${result.err}`).toStrictEqual(expected.map(e => `- ${e}`).join('\n'));
      }
    );
  });
});
