import { DataModelGame } from "@project/model/data-model";

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
    }),
};
