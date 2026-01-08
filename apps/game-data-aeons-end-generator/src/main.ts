import AERData from 'aer-data';
import * as types from 'aer-types/types';
import { Stats } from 'fs';
import * as fs from 'fs/promises';
import { env } from 'process';

class Canonizer {
  constructor(private language: string) {}

  canon(id: string): string {
    return `${this.language}-${id.replaceAll(' ', '-')}`.toLowerCase();
  }
}

class Game {
  sets: Record<string, ModelSet> = {};

  getSet(id: string): ModelSet {
    let set = this.sets[id];
    if (set === undefined) {
      set = new ModelSet();
      this.sets[id] = set;
      set.key = id;
    }
    return set;
  }
}

class ModelSet {
  key  = '';
  name = '';
  sets: ModelSet[]|undefined = undefined;
  components: ModelComponents|undefined = undefined;

  addNemesis(nemesis: ModelNemesis): this {
    if (this.components === undefined) {
      this.components = new ModelComponents();
    }
    this.components.addNemesis(nemesis);
    return this;
  }

  addMage(mage: ModelMage): this {
    if (this.components === undefined) {
      this.components = new ModelComponents();
    }
    this.components.addMage(mage);
    return this;
  }

  addCard(card: ModelCard): this {
    if (this.components === undefined) {
      this.components = new ModelComponents();
    }
    this.components.addCard(card);
    return this;
  }
}
class ModelComponents {
  Nemesis: ModelNemesis[] = [];
  Mage: ModelMage[] = [];
  Card: ModelCard[] = [];

  addNemesis(nemesis: ModelNemesis): this {
    this.Nemesis.push(nemesis);
    return this;
  }

  addMage(mage: ModelMage): this {
    this.Mage.push(mage);
    return this;
  }

  addCard(card: ModelCard): this {
    this.Card.push(card);
    return this;
  }
}
interface ModelNemesis {
  key: string;
  name: string;
}
interface ModelMage {
  key: string;
  name: string;
}
interface ModelCard {
  key: string;
  name: string;
  properties: {
    type: 'Gem'|'Relic'|'Spell';
    cost: number;
  }
}

const setTree = [
  {
    core: 'AE',
    sets: [
      'Depths',
      'Nameless',
    ],
  },
  {
    core: 'WE',
    sets: [
      'OD',
      'TV',
    ],
  },
  {
    core: 'Legacy',
    sets: [
      'BS',
    ],
  },
  {
    core: 'NA',
    sets: [
      'IW',
      'SD',
      'TA',
    ],
  },
  {
    core: 'O',
    sets: [
      'RTG',
      'SV',
    ],
  },
  {
    core: 'LOG',
    sets: [
      'RU',
    ],
  },
  {
    core: 'PAF',
    sets: [
      'EVO',
      'ORI',
      'PFPromo',
    ],
  },
  {
    core: 'ATD',
    sets: [
      'TOG',
      'AB',
      'TC',
      'TDPromo',
    ],
  },
  {
    wave: false,
    core: 'promos',
    sets: [
      'community',
    ]
  },
]

async function main() {
  for (const [lang, anyData] of Object.entries(AERData.normalizedData)) {
    console.log(`------------------------------------------------------------------------------------------------`);
    console.log(`--- Language ${JSON.stringify(lang)} ---`);

    const data = anyData as types.NormalizedData;
    const game = new Game();
    const canonizer = new Canonizer(lang);

    for (const expansion of Object.values(data.expansions)) {
      const expansionId = canonizer.canon(expansion.id);
      game.getSet(expansionId).name = expansion.name;
    }

    for (const nemesis of Object.values(data.nemeses)) {
      const expansionId = canonizer.canon(nemesis.expansion);
      game.getSet(expansionId).addNemesis({
        key: canonizer.canon(`nemesis-${nemesis.id}`),
        name: nemesis.name,
      });
    }
    for (const mage of Object.values(data.mages)) {
      const expansionId = canonizer.canon(mage.expansion);
      game.getSet(expansionId).addMage({
        key: canonizer.canon(`mage-${mage.id}`),
        name: mage.name,
      });
    }
    for (const card of Object.values(data.cards)) {
      const expansionId = canonizer.canon(card.expansion);
      const set = game.getSet(expansionId);
      const expansion = data.expansions[card.expansion];
      switch (card.type) {
        case 'Gem':
        case 'Relic':
        case 'Spell':
          set.addCard({
            key: canonizer.canon(card.id),
            name: card.name,
            properties: {
              type: card.type,
              cost: card.cost,
            },
          });
          break;
        default:
          throw new Error(`Invalid card type ${JSON.stringify(card.type)} for ${JSON.stringify(card.name)} (${card.id}) in ${JSON.stringify(expansion?.name ?? 'unknown')} (${card.expansion ?? `unknown`})`);
      }
    }

    for (const set of Object.values(game.sets)) {
      console.log(`  ${set.key}: ${set.name}`);
      for (const [kind, components] of Object.entries(set.components ?? {})) {
        console.log(`      ${kind}: ${components?.length ?? 0}`);
      }
    }

    const outputDir = env['GAME_DATA_AEONS_END_GENERATOR_OUTPUT_DIR'] ?? 'apps/boardgame-universal-randomizer/src/app/services/games/data/aeons-end';
    let outputDirStat: Stats|undefined = undefined;
    try {
      outputDirStat = await fs.stat(outputDir);
    } catch (e) {
      if ('code' in e && e.code === 'ENOENT') {
        // Not exists
      } else {
        throw e;
      }
    }
    if (outputDirStat === undefined) {
      await fs.mkdir(outputDir);
    } else if (!outputDirStat.isDirectory()) {
      throw new Error(`Output directory ${JSON.stringify(outputDir)} isn't a directory`);
    }

    const langSet = new ModelSet();
    langSet.key = canonizer.canon('set');
    langSet.name = lang;
    langSet.sets = [];
    let wave = 0;
    let count = 0;
    for (const treeItem of setTree) {
      const groupSet = new ModelSet();
      const coreSet = game.sets[canonizer.canon(treeItem.core)];
      if (coreSet === undefined) {
        continue;
      }
      if (treeItem.wave === false) {
        groupSet.key  = canonizer.canon(`group-${count++}-${coreSet.key}`);
        groupSet.name = coreSet.name;
      } else {
        wave++;
        groupSet.key  = canonizer.canon(`group-${count++}-wave-${wave}-${coreSet.key}`);
        groupSet.name = `${wave} - ${coreSet.name}`;
      }
      groupSet.sets = [coreSet];
      for (const treeItemSubset of treeItem.sets) {
        const subset = game.sets[canonizer.canon(treeItemSubset)];
        if (subset === undefined) {
          continue;
        }
        groupSet.sets.push(subset);
      }
      langSet.sets.push(groupSet);
      count++;
    }

    const outputFile = `${outputDir}/${canonizer.canon('sets')}.json`;
    const outputContent = JSON.stringify(langSet, undefined, 2);
    await fs.writeFile(outputFile, outputContent);
  }
}

main()
  .catch(e => {
    console.error(`ERROR: ${e}`);
    console.error(e);
    throw e;
  });
