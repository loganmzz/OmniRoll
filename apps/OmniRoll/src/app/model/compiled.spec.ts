import {
  DataLocation,
  Range,
} from './common';
import {
  CompiledComponent,
  CompiledGame,
  CompiledRandomizer,
  CompiledRandomizerPool,
  CompiledRandomizerSlot,
  CompiledRandomizerVariableBoolean,
  CompiledRandomizerVariableInteger,
  CompiledRandomizerVariableRange,
  ComponentCompilation,
  ComponentSetCompilation,
  GameCompilation,
  RandomizerCompilation,
} from './compiled';
import {
  ReferentialComponent,
  ReferentialGame,
  ReferentialRandomizer,
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
        location: new DataLocation(),
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

    describe('errors', () => {
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
          {
            title: 'Conditional component needs unknown feature',
            input: {
              key: 'game',
              sets: [
                {
                  key: 'default',
                  components: {
                    Main: [
                      {
                        key: 'base',
                        features: ['base'],
                      },
                      {
                        key: 'ok',
                        needs: {
                          features: ['base'],
                        },
                      },
                      {
                        key: 'faulty',
                        needs: {
                          features: ['unknown-feature'],
                        },
                      },
                    ],
                  },
                },
              ],
            },
            expected: [
              `/sets[0:default]/components[Main]/[2:faulty]/needs/features: Needed feature "unknown-feature" is unknown`,
            ],
          },
          {
            title: 'Conditional component needs unknown set',
            input: {
              key: 'game',
              sets: [
                {
                  key: 'default',
                  components: {
                    Main: [
                      {
                        key: 'ok',
                        needs: {
                          sets: ['default'],
                        },
                      },
                      {
                        key: 'faulty',
                        needs: {
                          sets: ['unknown-set'],
                        },
                      },
                    ],
                  },
                },
              ],
            },
            expected: [
              `/sets[0:default]/components[Main]/[1:faulty]/needs/sets: Needed set "unknown-set" is unknown`,
            ],
          },
          {
            title: 'Conditional randomizer needs unknown feature',
            input: {
              key: 'game',
              sets: [
                {
                  key: 'core',
                  components: {
                    Main: [
                      {
                        key: 'component',
                        features: ['base'],
                      }
                    ]
                  }
                }
              ],
              randomizers: [
                {
                  key: 'base',
                  needs: {
                    features: ['base'],
                  },
                },
                {
                  key: 'faulty',
                  needs: {
                    features: ['unknown-feature'],
                  },
                },
              ],
            },
            expected: [
              `/randomizers[1:faulty]/needs/features: Needed feature "unknown-feature" is unknown`,
            ],
          },
          {
            title: 'Conditional randomizer needs unknown set',
            input: {
              key: 'game',
              sets: [
                {
                  key: 'core'
                }
              ],
              randomizers: [
                {
                  key: 'core',
                  needs: {
                    sets: ['core'],
                  },
                },
                {
                  key: 'faulty',
                  needs: {
                    sets: ['unknown-set'],
                  },
                },
              ],
            },
            expected: [
              `/randomizers[1:faulty]/needs/sets: Needed set "unknown-set" is unknown`,
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

  describe('randomizer', () => {
    test('minimal', () => {
      const input: ReferentialRandomizer = {
        key: 'default',
        pools: [
          {
            key: 'a-pool',
          },
        ],
        slots: [
          {
            key: 'a-slot',
            pool: 'a-pool',
          },
        ],
      };

      const content = new CompiledRandomizer();
      content.key = 'default';
      content.name = 'default';

      const pool = new CompiledRandomizerPool();
      pool.key = 'a-pool';
      content.pools.push(pool);

      const slot = new CompiledRandomizerSlot();
      slot.key = 'a-slot';
      slot.name = 'a-slot';
      slot.pool = 'a-pool';
      content.slots.push(slot);


      const expected: RandomizerCompilation = {
        content: content,
        location: new DataLocation(),
        needs: undefined,
      };

      const actual = CompiledRandomizer.newFromDataModel(input).expect();
      expect(actual).toStrictEqual(expected);
    });
    test('variables', () => {
      const input: ReferentialRandomizer = {
        key: 'default',
        variables: [
          {
            key: 'boolean',
            type: 'boolean',
            default: false,
          },
          {
            key: 'integer-unbound',
            type: 'integer',
            default: 0,
          },
          {
            key: 'integer-bound',
            type: 'integer',
            default: 5,
            min: 0,
            max: 10,
          },
          {
            key: 'range-pair',
            type: 'range',
            min: 0,
            max: 100,
            default: [10, 90],
          },
          {
            key: 'range-object',
            type: 'range',
            min: 100,
            max: 1000,
            default: { min: 500, max: 600 },
          },
          {
            key: 'range-no-default',
            type: 'range',
            min: 40,
            max: 42,
          },
          {
            key: 'range-default-null',
            type: 'range',
            min: 50,
            max: 60,
            default: null,
          },
          {
            key: 'range-default-no-min',
            type: 'range',
            min: 70,
            max: 80,
            default: {
              max: 75,
            },
          },
          {
            key: 'range-default-min-null',
            type: 'range',
            min: 80,
            max: 90,
            default: {
              min: null,
              max: 85,
            },
          },
          {
            key: 'range-default-no-max',
            type: 'range',
            min: 90,
            max: 100,
            default: {
              min: 95,
            },
          },
          {
            key: 'range-default-max-null',
            type: 'range',
            min: 100,
            max: 110,
            default: {
              min: 105,
              max: null,
            },
          },
        ],
        pools: [
          {
            key: 'a-pool',
          },
        ],
        slots: [
          {
            key: 'a-slot',
            pool: 'a-pool',
          },
        ],
      };

      const content = new CompiledRandomizer();
      content.key = 'default';
      content.name = 'default';

      const boolVariable = new CompiledRandomizerVariableBoolean('boolean', 'boolean', false);
      content.variables.push(boolVariable);

      let intVariable = new CompiledRandomizerVariableInteger('integer-unbound', 'integer-unbound', 0);
      content.variables.push(intVariable);

      intVariable = new CompiledRandomizerVariableInteger('integer-bound', 'integer-bound', 5);
      intVariable.min = 0;
      intVariable.max = 10;
      content.variables.push(intVariable);

      let rangeVariable = new CompiledRandomizerVariableRange('range-pair', 'range-pair', new Range(10, 90));
      rangeVariable.min = 0;
      rangeVariable.max = 100;
      content.variables.push(rangeVariable);

      rangeVariable = new CompiledRandomizerVariableRange('range-object', 'range-object', new Range(500, 600));
      rangeVariable.min = 100;
      rangeVariable.max = 1000;
      content.variables.push(rangeVariable);

      rangeVariable = new CompiledRandomizerVariableRange('range-no-default', 'range-no-default', new Range(40, 42));
      rangeVariable.min = 40;
      rangeVariable.max = 42;
      content.variables.push(rangeVariable);

      rangeVariable = new CompiledRandomizerVariableRange('range-default-null', 'range-default-null', new Range(50, 60));
      rangeVariable.min = 50;
      rangeVariable.max = 60;
      content.variables.push(rangeVariable);

      rangeVariable = new CompiledRandomizerVariableRange('range-default-no-min', 'range-default-no-min', new Range(70, 75));
      rangeVariable.min = 70;
      rangeVariable.max = 80;
      content.variables.push(rangeVariable);

      rangeVariable = new CompiledRandomizerVariableRange('range-default-min-null', 'range-default-min-null', new Range(80, 85));
      rangeVariable.min = 80;
      rangeVariable.max = 90;
      content.variables.push(rangeVariable);

      rangeVariable = new CompiledRandomizerVariableRange('range-default-no-max', 'range-default-no-max', new Range(95, 100));
      rangeVariable.min = 90;
      rangeVariable.max = 100;
      content.variables.push(rangeVariable);

      rangeVariable = new CompiledRandomizerVariableRange('range-default-max-null', 'range-default-max-null', new Range(105, 110));
      rangeVariable.min = 100;
      rangeVariable.max = 110;
      content.variables.push(rangeVariable);

      const pool = new CompiledRandomizerPool();
      pool.key = 'a-pool';
      content.pools.push(pool);

      const slot = new CompiledRandomizerSlot();
      slot.key = 'a-slot';
      slot.name = 'a-slot';
      slot.pool = 'a-pool';
      content.slots.push(slot);


      const expected: RandomizerCompilation = {
        content: content,
        location: new DataLocation(),
        needs: undefined,
      };

      const actual = CompiledRandomizer.newFromDataModel(input).expect();
      expect(actual).toStrictEqual(expected);
    });
  });
});
