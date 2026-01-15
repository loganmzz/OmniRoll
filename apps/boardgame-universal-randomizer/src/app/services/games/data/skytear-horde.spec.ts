import { CompiledComponent, CompiledGame } from '@project/model/compiled';
import { skytearhorde } from './skytear-horde';

describe('games/data/skytear-horde', () => {
  test('Data validation', async () => {
    const model = await skytearhorde['skytear-horde'].load();
    const compiled = CompiledGame.newFromDataModel(model).expect();

    const index = new Map<string, CompiledComponent>();
    for (const component of compiled.components) {
      index.set(component.key, component);
    }

    const allianceFactions = ['liothan', 'taulot', 'kurumo', 'nupten'];
    const outsiderTypes    = ['immortal', 'enchanter', 'colossal'];

    const errors: string[] = [];
    for (const component of compiled.components) {
      // If refering a horde, must exists
      if ('horde' in component.properties) {
        const hordeKey = component.properties['horde'];
        const horde = index.get(`${hordeKey}`);
        if (horde === undefined) {
          errors.push(`Component ${JSON.stringify(component.key)} is referring a missing horde ${JSON.stringify(hordeKey)}`);
        } else {
          if (!horde.kinds.has('Horde')) {
              errors.push(`Component ${JSON.stringify(component.key)} is referring horde ${JSON.stringify(horde.key)} but it is not a Horde: ${JSON.stringify([...horde.kinds])}`);
          }
        }
      }

      // If refering an alliance, must exists
      if ('alliance' in component.properties) {
        const allianceKey = component.properties['alliance'];
        const alliance = index.get(`${allianceKey}`);
        if (alliance === undefined) {
          errors.push(`Component ${JSON.stringify(component.key)} is referring a missing alliance ${JSON.stringify(allianceKey)}`);
        } else {
          if (!alliance.kinds.has('Alliance')) {
              errors.push(`Component ${JSON.stringify(component.key)} is referring alliance ${JSON.stringify(alliance.key)} but it is not an Alliance: ${JSON.stringify([...alliance.kinds])}`);
          }
        }
      }

      // If Alliance
      if (component.kinds.has('Alliance')) {
        if (!('complexity' in component.properties)) {
          errors.push(`Alliance ${JSON.stringify(component.key)} is missing complexity`);
        } else {
          const complexity = component.properties['complexity'];
          if (typeof complexity !== 'number') {
            errors.push(`Alliance ${JSON.stringify(component.key)} has non-numeric complexity`);
          }
        }
        if (!('faction' in component.properties)) {
          errors.push(`Alliance ${JSON.stringify(component.key)} is missing faction`);
        } else {
          const faction = component.properties['faction'];
          if (typeof faction !== 'string') {
            errors.push(`Alliance ${JSON.stringify(component.key)} has non-string faction`);
          } else if (!allianceFactions.includes(faction)) {
            errors.push(`Alliance ${JSON.stringify(component.key)} has invalid faction ${JSON.stringify(faction)}: must be one of ${allianceFactions.join(', ')}`);
          }
        }
      }

      // If Horde
      if (component.kinds.has('Horde')) {
        if (!('difficulty' in component.properties)) {
          errors.push(`Horde ${JSON.stringify(component.key)} is missing difficulty`);
        } else {
          const difficulty = component.properties['difficulty'];
          if (typeof difficulty !== 'number') {
            errors.push(`Horde ${JSON.stringify(component.key)} has non-numeric difficulty`);
          }
        }
      }

      // If Outsider
      if (component.kinds.has('Outsider')) {
        if (!('type' in component.properties)) {
          errors.push(`Outsider ${JSON.stringify(component.key)} is missing type`);
        } else {
          const type = component.properties['type'];
          if (typeof type !== 'string') {
            errors.push(`Outsider ${JSON.stringify(component.key)} has non-string type`);
          } else if (!outsiderTypes.includes(type)) {
            errors.push(`Outsider ${JSON.stringify(component.key)} has invalid type ${JSON.stringify(type)}: must be one of ${outsiderTypes.join(', ')}`);
          }
        }
        if (!('horde' in component.properties)) {
          errors.push(`Outsider ${JSON.stringify(component.key)} is missing horde`);
        }
      }

      // If Portal
      if (component.kinds.has('Portal')) {
        if (!('horde' in component.properties)) {
          errors.push(`Portal ${JSON.stringify(component.key)} is missing horde`);
        }
      }

      // If Scenario
      if (component.kinds.has('Scenario')) {
        if (!('horde' in component.properties)) {
          errors.push(`Scenario ${JSON.stringify(component.key)} is missing horde`);
        }
      }
    }
  })
})