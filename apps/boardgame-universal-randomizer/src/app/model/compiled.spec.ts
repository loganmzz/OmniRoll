import { CompiledComponent, CompiledGame } from "./compiled";
import { DataModelGame } from "./data-model";

describe('model/compiled', () => {
  describe('game', () => {
    test('empty', () => {
      const input: DataModelGame = {
        key: 'empty',
      };

      const expected = new CompiledGame();
      expected.key = 'empty';
      expected.name = 'empty';

      expect(CompiledGame.newFromDataModel(input).expect()).toStrictEqual(expected);
    });

    test('component', () => {
      const input: DataModelGame = {
        key: 'component',
        name: 'Component',
        sets: [
          {
            key: 'singleton',
            components: {
              One: [
                {
                  key: 'one',
                  name: 'Neo',
                  description: 'a single element',
                  properties: {
                    foo: 'bar',
                    answer: 42,
                  },
                },
              ],
            },
          },
        ],
      };

      const expected = new CompiledGame();
      expected.key = 'component';
      expected.name = 'Component';
      expected.components.push((() => {
        const component = new CompiledComponent();
        component.key = 'one';
        component.name = 'Neo';
        component.kinds.add('One');
        component.sets.add('singleton');
        component.properties['foo'] = 'bar';
        component.properties['answer'] = 42;
        return component;
      })());

      expect(CompiledGame.newFromDataModel(input).expect()).toStrictEqual(expected);
    });
  });
});
