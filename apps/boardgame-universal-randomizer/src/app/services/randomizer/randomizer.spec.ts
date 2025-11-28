import { CompiledComponent, CompiledRandomizer } from '@project/model/compiled';
import { DataModelRandomizer } from '@project/model/data-model';
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
      });
      test('select 1', () => {
        const model: DataModelRandomizer = {
          key: 'select 1',
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

      test('select 2', () => {
        const model: DataModelRandomizer = {
          key: 'select 2',
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
      test('select 1', () => {
        const model: DataModelRandomizer = {
          key: 'select 1',
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
          single: ['one','two','three','four','five','six'],
        };

        const compiled = CompiledRandomizer.newFromDataModel(model).expect();
        expect(
          toKey(randomizer.randomize(components, compiled))
        ).toEqual(expected);
      });
    });
  });
});
