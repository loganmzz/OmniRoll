import * as de from './aeons-end/de-sets.json';
import * as eng from './aeons-end/eng-sets.json';
import * as fr from './aeons-end/fr-sets.json';
import * as pl from './aeons-end/pl-sets.json';
import { GameDataLoader } from './loader';

export const aeonsend: Record<string, GameDataLoader> = {
  'aeons-end': {
    version: '2026-02-24T20:00:00.000Z',
    async load() {
      return {
        key: 'aeons-end',
        name: 'Aeon\'s End',
        sets: [
          eng,
          fr,
          pl,
          de,
        ],
        randomizers: [
          {
            key: '2-players',
            name: 'Two players',
            pools: [
              {
                key: 'nemesis',
                criteria: 'c.kinds == \'Nemesis\''
              },
              {
                key: 'mages',
                criteria: 'c.kinds == \'Mage\''
              },
              {
                key: 'gems',
                criteria: 'c.kinds == \'Card\' && c.type == \'Gem\''
              },
              {
                key: 'relics',
                criteria: 'c.kinds == \'Card\' && c.type == \'Relic\''
              },
              {
                key: 'spells',
                criteria: 'c.kinds == \'Card\' && c.type == \'Spell\''
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
                criteria: 'c.cost < 4',
              },
              {
                key: 'gem2',
                pool: 'gems',
                group: 'gems',
                criteria: 'c.cost == 4',
              },
              {
                key: 'gem3',
                pool: 'gems',
                group: 'gems',
                criteria: 'c.cost > 4',
              },
              {
                key: 'relic1',
                pool: 'relics',
                group: 'relics',
                criteria: 'c.cost < 4',
              },
              {
                key: 'relic2',
                pool: 'relics',
                group: 'relics',
                criteria: 'c.cost >= 4',
              },
              {
                key: 'spell1',
                pool: 'spells',
                group: 'spells',
                criteria: 'c.cost < 4',
              },
              {
                key: 'spell2',
                pool: 'spells',
                group: 'spells',
                criteria: 'c.cost == 4',
              },
              {
                key: 'spell3',
                pool: 'spells',
                group: 'spells',
                criteria: 'c.cost == 5',
              },
              {
                key: 'spell4',
                pool: 'spells',
                group: 'spells',
                criteria: 'c.cost >= 6',
              },
            ],
          },
        ],
      };
    }
  },
};
