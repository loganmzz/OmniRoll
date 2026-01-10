import { DataModelGame } from '@project/model/data-model';

export const skytearhorde: Record<string, () => DataModelGame> = {
  'skytear-horde': () => ({
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
                Alliance: [
                  {
                    key: 'liothan-shapeshifters',
                    name: 'Liothan Shapeshifters',
                    properties: {
                      complexity: 10,
                      faction: 'liothan',
                    },
                  },
                  {
                    key: 'taulot-followers',
                    name: 'Taulot Followers',
                    properties: {
                      complexity: 20,
                      faction: 'taulot',
                    },
                  },
                  {
                    key: 'kurumo-warriors',
                    name: 'Kurumo Warriors',
                    properties: {
                      complexity: 30,
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
                Outsider: [
                  {
                    key: 'the-hate-bringer',
                    name: 'The Hate Bringer',
                    properties: {
                      type: 'immortal',
                      horde: 'renegade',
                    },
                  },
                  {
                    key: 'the-death-dealer',
                    name: 'The Death Dealer',
                    properties: {
                      type: 'immortal',
                      horde: 'undead',
                    },
                  },
                  {
                    key: 'the-beast-lord',
                    name: 'The Beast Lord',
                    properties: {
                      type: 'immortal',
                      horde: 'predator',
                    },
                  },
                ],
              },
            },
            {
              key: 'skytear-horde-nupten-utsesh',
              name: 'Nupten & Utsesh',
              components: {
                Alliance: [
                  {
                    key: 'nupten-illusionists',
                    name: 'Nupten Illusionists',
                    properties: {
                      complexity: 30,
                      faction: 'nupten',
                    },
                  },
                ],
                Horde: [
                  {
                    key: 'nightmare',
                    name: 'Nightmare',
                    properties: {
                      difficulty: 40,
                    },
                  },
                ],
                Outsider: [
                  {
                    key: 'the-dreaming-matriarch',
                    name: 'The Dreaming Matriarch',
                    properties: {
                      type: 'immortal',
                      horde: 'nightmare',
                    },
                  },
                ],
              },
            },
          ],
        },
        {
          key: 'skytear-horde-year-2-monoliths',
          name: 'Monoliths (Year #2)',
          sets: [
            {
              key: 'monoliths-core',
              name: 'Monoliths',
              components: {
                Alliance: [
                  {
                    key: 'liothan-enforcers',
                    name: 'Liothan Enforcers',
                    properties: {
                      complexity: 10,
                      faction: 'liothan',
                    },
                  },
                  {
                    key: 'kurumo-artificiers',
                    name: 'Kurumo Artificiers',
                    properties: {
                      complexity: 20,
                      faction: 'kurumo',
                    },
                  },
                  {
                    key: 'taulot-custodians',
                    name: 'Taulot Custodians',
                    properties: {
                      complexity: 30,
                      faction: 'taulot',
                    },
                  },
                ],
                Horde: [
                  {
                    key: 'monoliths',
                    name: 'Monoliths',
                    properties: {
                      difficulty: 10,
                    },
                  },
                  {
                    key: 'sinklings',
                    name: 'Sinklings',
                    properties: {
                      difficulty: 20,
                    },
                  },
                  {
                    key: 'slitherers',
                    name: 'Slitherers',
                    properties: {
                      difficulty: 30,
                    }
                  },
                ],
                Outsider: [
                  {
                    key: 'purple-circle',
                    name: 'Purple Circle',
                    properties: {
                      type: 'enchanter',
                      horde: 'monoliths',
                    }
                  },
                  {
                    key: 'damsel-of-silence',
                    name: 'Damsel of Silence',
                    properties: {
                      type: 'enchanter',
                      horde: 'sinklings',
                    }
                  },
                  {
                    key: 'doom-vines',
                    name: 'Doom Vines',
                    properties: {
                      type: 'enchanter',
                      horde: 'slitherers',
                    }
                  },
                ],
              },
            },
            {
              key: 'monoliths-diviners-broods-colossals',
              name: 'Diviners, Broods & Colossals',
              components: {
                Alliance: [
                  {
                    key: 'nupten-diviners',
                    name: 'Nupten Diviners',
                    properties: {
                      complexity: 30,
                      faction: 'nupten',
                    },
                  },
                ],
                Horde: [
                  {
                    key: 'the-brood',
                    name: 'The Brood',
                    properties: {
                      difficulty: 40,
                    },
                  },
                ],
                Outsider: [
                  {
                    key: 'genesis-monolith',
                    name: 'Genesis Monolith',
                    properties: {
                      type: 'enchanter',
                      horde: 'the-brood',
                    }
                  },
                  {
                    key: 'the-lost-legion',
                    name: 'The Lost Legion',
                    properties: {
                      type: 'enchanter',
                      horde: 'monoliths',
                    }
                  },
                  {
                    key: 'the-coral-beast',
                    name: 'The Coral Beast',
                    properties: {
                      type: 'enchanter',
                      horde: 'sinklings',
                    }
                  },
                  {
                    key: 'toxic-breath',
                    name: 'Toxic Breath',
                    properties: {
                      type: 'enchanter',
                      horde: 'slitherers',
                    }
                  },
                  {
                    key: 'brood-mother',
                    name: 'Brood Mother',
                    properties: {
                      type: 'enchanter',
                      horde: 'the-brood',
                    }
                  },
                  {
                    key: 'abyssal-terror',
                    name: 'Abyssal Terror',
                    properties: {
                      type: 'colossal',
                      horde: 'sinklings',
                    }
                  },
                  {
                    key: 'living-portal',
                    name: 'Living Portal',
                    properties: {
                      type: 'colossal',
                      horde: 'slitherers',
                    }
                  },
                  {
                    key: 'titan-brood',
                    name: 'Titan Brood',
                    properties: {
                      type: 'colossal',
                      horde: 'the-brood',
                    }
                  },
                  {
                    key: 'the-lost-city',
                    name: 'The Lost City',
                    properties: {
                      type: 'colossal',
                      horde: 'monoliths',
                    }
                  },
                  {
                    key: 'rider-of-death',
                    name: 'Rider of Death',
                    properties: {
                      type: 'colossal',
                      horde: 'undead',
                    }
                  },
                  {
                    key: 'slaver-of-beasts',
                    name: 'Slaver of Beasts',
                    properties: {
                      type: 'colossal',
                      horde: 'predator',
                    }
                  },
                  {
                    key: 'rider-of-hate',
                    name: 'Rider of Hate',
                    properties: {
                      type: 'colossal',
                      horde: 'renegade',
                    }
                  },
                  {
                    key: 'ancient-reborn',
                    name: 'Ancient Reborn',
                    properties: {
                      type: 'enchanter',
                      horde: '',
                    }
                  },
                  {
                    key: 'silent-shard',
                    name: 'Silent Shard',
                    properties: {
                      type: 'enchanter',
                      horde: '',
                    }
                  },
                  {
                    key: 'rider-of-dreams',
                    name: 'Rider of Dreams',
                    properties: {
                      type: 'enchanter',
                      horde: 'nightmare',
                    }
                  },
                ]
              },
            },
          ],
        },
        {
          key: 'skytear-horde-year-3-campaigns',
          name: 'Campaigns (Year #3)',
          sets: [
            {
              key: 'campaigns-core',
              name: 'Campaigns',
              components: {
                Alliance: [
                  {
                    key: 'liothan-zealots',
                    name: 'Liothan Zealots',
                    properties: {
                      complexity: 10,
                      faction: 'liothan',
                    },
                  },
                  {
                    key: 'taulot-dwellers',
                    name: 'Taulot Dwellers',
                    properties: {
                      complexity: 20,
                      faction: 'taulot',
                    },
                  },
                  {
                    key: 'kurumo-disciples',
                    name: 'Kurumo Disciples',
                    properties: {
                      complexity: 30,
                      faction: 'kurumo',
                    },
                  },
                ],
                Horde: [
                  {
                    key: 'skybooter',
                    name: 'Skybooter',
                    properties: {
                      difficulty: 10,
                    },
                  },
                  {
                    key: 'animerk',
                    name: 'Animerk',
                    properties: {
                      difficulty: 20,
                    },
                  },
                  {
                    key: 'scaleson',
                    name: 'Scaleson',
                    properties: {
                      difficulty: 30,
                    },
                  },
                ],
                Outsider: [
                  {
                    key: 'wast-3',
                    name: 'WAST-3',
                    properties: {
                      type: 'enchanter',
                      horde: '',
                    },
                  },
                  {
                    key: 'scalesider',
                    name: 'Scalesider',
                    properties: {
                      type: 'colossal',
                      horde: '',
                    },
                  },
                  {
                    key: 'atlas',
                    name: 'Atlas',
                    properties: {
                      type: 'immortal',
                      horde: '',
                    },
                  },
                ],
                Portal: [
                  {
                    key: 'portal-animerk',
                    name: 'Animerk',
                    properties: {
                      horde: 'animerk',
                    },
                  },
                  {
                    key: 'portal-skybooter',
                    name: 'Skybooter',
                    properties: {
                      horde: 'skybooter',
                    },
                  },
                  {
                    key: 'portal-scaleson',
                    name: 'Scaleson',
                    properties: {
                      horde: 'scaleson',
                    },
                  },
                ],
                Scenario: [
                  {
                    key: 'shadows-over-the-realm',
                    name: 'Shadows Over the Realm (Scaleson)',
                    properties: {
                      horde: 'scaleson',
                    },
                  },
                  {
                    key: 'the-enemy-within',
                    name: 'The Enemy Within (Scaleson)',
                    properties: {
                      horde: 'scaleson',
                    },
                  },
                  {
                    key: 'dead-wreckoning',
                    name: 'Dead Wreckoning (Animerk)',
                    properties: {
                      horde: 'animerk',
                    },
                  },
                  {
                    key: 'grounded',
                    name: 'Grounded (Animerk)',
                    properties: {
                      horde: 'animerk',
                    },
                  },
                  {
                    key: 'look-back-in-anger',
                    name: 'Look Back in Anger (Skybooter)',
                    properties: {
                      horde: 'skybooter',
                    },
                  },
                  {
                    key: 'trade-or-blade',
                    name: 'Trade or Blade (Skybooter)',
                    properties: {
                      horde: 'skybooter',
                    },
                  },
                  {
                    key: 'through-the-void',
                    name: 'Through the Void (Faefolk)',
                    properties: {
                      horde: 'faefolk',
                    },
                  },
                  {
                    key: 'hunting-party',
                    name: 'Hunting Party (Faefolk)',
                    properties: {
                      horde: 'faefolk',
                    },
                  },
                ],
              },
            },
            {
              key: 'campaigns-travelers-faefolk',
              name: 'Travelers & Faefolk',
              components: {
                Alliance: [
                  {
                    key: 'nupten-travelers',
                    name: 'Nupten Travelers',
                    properties: {
                      complexity: 30,
                      faction: 'nupten',
                    },
                  },
                ],
                Horde: [
                  {
                    key: 'faefolk',
                    name: 'Faefolk',
                    properties: {
                      difficulty: 40,
                    },
                  },
                ],
                Outsider: [
                  {
                    key: 'wishmaker',
                    name: 'Wishmaker',
                    properties: {
                      type: 'enchanter',
                      horde: '',
                    },
                  },
                ],
                Portal: [
                  {
                    key: 'portal-faefolk',
                    name: 'Faefolk',
                    properties: {
                      horde: 'faefolk',
                    },
                  },
                  {
                    key: 'portal-monoliths',
                    name: 'Monolights',
                    properties: {
                      horde: 'monoliths',
                    },
                  },
                  {
                    key: 'portal-slitherers',
                    name: 'Slitherers',
                    properties: {
                      horde: 'slitherers',
                    },
                  },
                  {
                    key: 'portal-sinklings',
                    name: 'Sinklings',
                    properties: {
                      horde: 'sinklings',
                    },
                  },
                  {
                    key: 'portal-the-brood',
                    name: 'The Brood',
                    properties: {
                      horde: 'the-brood',
                    },
                  },
                  {
                    key: 'portal-renegade',
                    name: 'Renegade',
                    properties: {
                      horde: 'renegade',
                    },
                  },
                  {
                    key: 'portal-undead',
                    name: 'Undead',
                    properties: {
                      horde: 'undead',
                    },
                  },
                  {
                    key: 'portal-predator',
                    name: 'Predator',
                    properties: {
                      horde: 'predator',
                    },
                  },
                  {
                    key: 'portal-nightmare',
                    name: 'Nightmare',
                    properties: {
                      horde: 'nightmare',
                    },
                  },
                ],
                Scenario: [
                  {
                    key: 'winds-of-rebellion',
                    name: 'Winds of Rebellion (Renegade)',
                    properties: {
                      horde: 'renegade',
                    },
                  },
                  {
                    key: 'fear-of-the-white',
                    name: 'Fear of the White (Renegade)',
                    properties: {
                      horde: 'renegade',
                    },
                  },
                  {
                    key: 'gitfs-from-beyond',
                    name: 'Gifts From Beyond (Monoliths)',
                    properties: {
                      horde: 'monoliths',
                    },
                  },
                  {
                    key: 'an-end-has-a-start',
                    name: 'An End Has a Start (Monoliths)',
                    properties: {
                      horde: 'monoliths',
                    },
                  },
                  {
                    key: 'unrest-in-peace',
                    name: 'Unrest in Peace (Undead)',
                    properties: {
                      horde: 'undead',
                    },
                  },
                  {
                    key: 'of-flesh-and-bones',
                    name: 'Of Flesh and Bones (Undead)',
                    properties: {
                      horde: 'undead',
                    },
                  },
                  {
                    key: 'riding-the-waves',
                    name: 'Riding the Waves (Sinklings)',
                    properties: {
                      horde: 'sinklings',
                    },
                  },
                  {
                    key: 'far-side-of-the-tide',
                    name: 'Far Side of the Tide (Sinklings)',
                    properties: {
                      horde: 'sinklings',
                    },
                  },
                  {
                    key: 'life-after-death',
                    name: 'Life After Death (Predator)',
                    properties: {
                      horde: 'predator',
                    },
                  },
                  {
                    key: 'they-awaken',
                    name: 'They Awaken (Predator)',
                    properties: {
                      horde: 'predator',
                    },
                  },
                  {
                    key: 'infectious-spread',
                    name: 'Infectious Spread (Slitherers)',
                    properties: {
                      horde: 'slitherers',
                    },
                  },
                  {
                    key: 'abandon-hope',
                    name: 'Abandon Hope (Slitherers)',
                    properties: {
                      horde: 'slitherers',
                    },
                  },
                  {
                    key: 'so-it-begins',
                    name: 'So It Begins (Nightmare)',
                    properties: {
                      horde: 'nightmare',
                    },
                  },
                  {
                    key: 'gaze-into-the-abyss',
                    name: 'Gaze Into the Abyss (Nightmare)',
                    properties: {
                      horde: 'nightmare',
                    },
                  },
                  {
                    key: 'the-hard-choice',
                    name: 'The Hard Choice (The Brood)',
                    properties: {
                      horde: 'the-brood',
                    },
                  },
                  {
                    key: 'rotten-time-and-light',
                    name: 'Rotten Time and Light (The Brood)',
                    properties: {
                      horde: 'the-brood',
                    },
                  },
                ],
              },
            },
          ]
        },
      ],
      randomizers: [
        {
          key: 'solo-one-shot',
          name: 'Solo one-shot',
          pools: [
            {
              key: 'alliance',
              criteria: [
                '@kinds == \'Alliance\'',
              ],
            },
            {
              key: 'horde',
              criteria: [
                '@kinds == \'Horde\'',
              ],
            },
            {
              key: 'outsider',
              criteria: [
                '@kinds == \'Outsider\'',
              ],
            },
          ],
          slots: [
            {
              key: 'alliance',
              name: 'Alliance',
              pool: 'alliance',
            },
            {
              key: 'horde',
              name: 'Horde',
              pool: 'horde',
            },
            {
              key: 'outsider',
              name: 'Outsider',
              pool: 'outsider',
            },
          ],
        },
        {
          key: 'solo-one-shot-portal',
          name: 'Solo one-shot (Portal)',
          pools: [
            {
              key: 'alliance',
              criteria: [
                '@kinds == \'Alliance\'',
              ],
            },
            {
              key: 'horde',
              criteria: [
                '@kinds == \'Horde\'',
              ],
            },
            {
              key: 'outsider',
              criteria: [
                '@kinds == \'Outsider\'',
              ],
            },
            {
              key: 'portal',
              criteria: [
                '@kinds == \'Portal\'',
              ],
            },
          ],
          slots: [
            {
              key: 'alliance',
              name: 'Alliance',
              pool: 'alliance',
            },
            {
              key: 'horde',
              name: 'Horde',
              pool: 'horde',
            },
            {
              key: 'outsider',
              name: 'Outsider',
              pool: 'outsider',
            },
            {
              key: 'portal',
              name: 'Portal',
              pool: 'portal',
            },
          ],
        },
        {
          key: 'solo-campaign',
          name: 'Solo campaign',
          pools: [
            {
              key: 'alliance',
              criteria: [
                '@kinds == \'Alliance\'',
              ],
            },
            {
              key: 'horde',
              criteria: [
                '@kinds == \'Horde\'',
              ],
            },
            {
              key: 'outsider',
              criteria: [
                '@kinds == \'Outsider\'',
              ],
            },
            {
              key: 'portal',
              criteria: [
                '@kinds == \'Portal\'',
              ],
            },
            {
              key: 'scenario',
              criteria: [
                '@kinds == \'Scenario\'',
              ],
            },
          ],
          groups: [
            {
              key: 'alliance',
              name: 'Alliance',
            },
            {
              key: 'horde',
              name: 'Horde',
            },
            {
              key: 'portal',
              name: 'Portal',
            },
            {
              key: 'scenario',
              name: 'Scenario',
            },
            {
              key: 'outsider',
              name: 'Final Outsider',
            },
          ],
          slots: [
            {
              key: 'alliance',
              name: '',
              pool: 'alliance',
              group: 'alliance',
            },
            {
              key: 'horde-0',
              name: 'Horde #1',
              pool: 'horde',
              group: 'horde',
            },
            {
              key: 'horde-1',
              name: 'Horde #2',
              pool: 'horde',
              group: 'horde',
            },
            {
              key: 'horde-2',
              name: 'Horde #3',
              pool: 'horde',
              group: 'horde',
            },
            {
              key: 'portal-0',
              name: 'Game #1',
              pool: 'portal',
              group: 'portal',
            },
            {
              key: 'portal-1',
              name: 'Game #2',
              pool: 'portal',
              group: 'portal',
            },
            {
              key: 'portal-2',
              name: 'Game #3',
              pool: 'portal',
              group: 'portal',
            },
            {
              key: 'portal-3',
              name: 'Game #4',
              pool: 'portal',
              group: 'portal',
            },
            {
              key: 'scenario-0',
              name: 'Game #1',
              pool: 'scenario',
              group: 'scenario',
            },
            {
              key: 'scenario-1',
              name: 'Game #2',
              pool: 'scenario',
              group: 'scenario',
            },
            {
              key: 'scenario-2',
              name: 'Henchman #2',
              pool: 'scenario',
              group: 'scenario',
            },
            {
              key: 'scenario-3',
              name: 'Game #3',
              pool: 'scenario',
              group: 'scenario',
            },
            {
              key: 'scenario-4',
              name: 'Henchman #3',
              pool: 'scenario',
              group: 'scenario',
            },
            {
              key: 'scenario-5',
              name: 'Game #4',
              pool: 'scenario',
              group: 'scenario',
            },
            {
              key: 'outsider',
              name: '',
              pool: 'outsider',
              group: 'outsider',
            },
          ],
        },
      ],
    }),
};
