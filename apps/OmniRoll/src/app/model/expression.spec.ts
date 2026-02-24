import { Expression } from './expression';

describe('model/expression', () => {
  describe('Resolve', () => {
      const component = {
        //unknown: undefined
        'root-boolean': true,
        'root-number': 0,
        'root-string': 'a',
        'root-strings': ['b', 'c'],
        'root-set-string': new Set(['j','k']),
        'root-numbers': [1],
        'root-set-number': new Set([11]),

        'properties-boolean': false,
        'properties-number': 3,
        'properties-string': 'd',
        'properties-strings': ['e','f'],
        'properties-set-string': new Set(['l', 'm']),
        'properties-numbers': [4],
        'properties-set-number': new Set([12]),
        'properties-invalid-set': 8,
        'properties-invalid-set2': 13,
        'properties-undefined': 9,
        'properties-null': 10,

        properties: {
          'properties-boolean': true,
          'properties-number': 5,
          'properties-string': 'g',
          'properties-strings': ['h','i'],
          'properties-set-string': new Set(['n', 'o']),
          'properties-numbers': [6],
          'properties-set-number': new Set([14]),
          'properties-invalid-set': [7],
          'properties-invalid-set2': new Set([15]),
          'properties-undefined': undefined,
          'properties-null': null,
        }
      };

      // Literal
      test.each(
        [
          { input: 'true', expected: true },
          { input: 'false', expected: false },
          { input: '0', expected: 0 },
          { input: '1', expected: 1 },
          { input: `'a'`, expected: 'a' },
          { input: `"b"`, expected: 'b' },
          { input: '[]', expected: new Set() },
          { input: `['c']`, expected: new Set(['c']) },
          { input: `['d', 'e']`, expected: new Set(['d', 'e']) },
        ]
      )(
        'literal($input)',
        ({input, expected}: {input: string, expected: ReturnType<Expression['resolve']>}) => {
          const {ok, err} = Expression.compile(input);
          expect(err).toBeUndefined();
          expect(ok?.resolve({})).toStrictEqual(expected);
        }
      )

      // Context
      test.each(
        [
          {
            input: `unknown`,
            expected: undefined,
          },
          {
            input: `unknown.unknown`,
            expected: undefined,
          },
          {
            input: `unknown.unknown.unknown`,
            expected: undefined,
          },
          {
            input: `component["root-boolean"]`,
            expected: true,
          },
          {
            input: `component["root-number"]`,
            expected: 0,
          },
          {
            input: `component["root-string"]`,
            expected: 'a',
          },
          {
            input: `component["root-strings"]`,
            expected: new Set(['b', 'c']),
          },
          {
            input: `component["root-set-string"]`,
            expected: new Set(['j', 'k']),
          },
          {
            input: `component["root-numbers"]`,
            expected: new Set(),
          },
          {
            input: `component["root-set-number"]`,
            expected: new Set([11]),
          },
          {
            input: `component["properties-boolean"]`,
            expected: false,
          },
          {
            input: `component["properties-number"]`,
            expected: 3,
          },
          {
            input: `component["properties-string"]`,
            expected: 'd',
          },
          {
            input: `component["properties-strings"]`,
            expected: new Set(['e', 'f']),
          },
          {
            input: `component["properties-set-string"]`,
            expected: new Set(['l', 'm']),
          },
          {
            input: `component["properties-numbers"]`,
            expected: new Set(),
          },
          {
            input: `component["properties-set-number"]`,
            expected: new Set([12]),
          },
          {
            input: `component["properties-invalid-set"]`,
            expected: 8,
          },
          {
            input: `component["properties-invalid-set2"]`,
            expected: 13,
          },
          {
            input: `component["properties-undefined"]`,
            expected: 9,
          },
          {
            input: `component["properties-null"]`,
            expected: 10,
          },
          {
            input: `component.properties["properties-boolean"]`,
            expected: true,
          },
          {
            input: `component.properties["properties-number"]`,
            expected: 5,
          },
          {
            input: `component.properties["properties-string"]`,
            expected: 'g',
          },
          {
            input: `component.properties["properties-strings"]`,
            expected: new Set(['h', 'i']),
          },
          {
            input: `component.properties["properties-set-string"]`,
            expected: new Set(['n', 'o']),
          },
          {
            input: `component.properties["properties-numbers"]`,
            expected: new Set(),
          },
          {
            input: `component.properties["properties-set-number"]`,
            expected: new Set([14]),
          },
          {
            input: `component.properties["properties-invalid-set"]`,
            expected: new Set(),
          },
          {
            input: `component.properties["properties-invalid-set2"]`,
            expected: new Set([15]),
          },
          {
            input: `component.properties["properties-undefined"]`,
            expected: undefined,
          },
          {
            input: `component.properties["properties-null"]`,
            expected: undefined,
          },
        ]
      )(
        'context($input)',
        ({input, expected}: {input: string, expected: ReturnType<Expression['resolve']>}) => {
          const {ok, err} = Expression.compile(input);
          expect(err).toBeUndefined();
          expect(ok?.resolve({component})).toStrictEqual(expected);
        },
      );

      // Unary operation
      test.each(
        [
          {
            input: `true`,
            expected: true,
          },
          {
            input: `! true`,
            expected: false,
          },
          {
            input: `false`,
            expected: false,
          },
          {
            input: `! false`,
            expected: true,
          },
          {
            input: `0`,
            expected: 0,
          },
          {
            input: `42`,
            expected: 42,
          },
          {
            input: `! 42`,
            expected: false,
          },
          {
            input: `''`,
            expected: '',
          },
          {
            input: `'a'`,
            expected: 'a',
          },
          {
            input: `! 'a'`,
            expected: false,
          },
          {
            input: `[]`,
            expected: new Set(),
          },
          {
            input: `['a']`,
            expected: new Set(['a']),
          },
          {
            input: `! ['a']`,
            expected: false,
          },
        ] as {input: string, expected: ReturnType<Expression['resolve']>}[]
      )(
        'unary($input)',
        ({input, expected}: {input: string, expected: ReturnType<Expression['resolve']>}) => {
          const {ok, err} = Expression.compile(input);
          expect(err).toBeUndefined();
          expect(ok?.resolve({})).toStrictEqual(expected);
        },
      );

      // Binary operation equal
      test.each(
        [
          {
            input: `true == true`,
            expected: true,
          },
          {
            input: `true == 0`,
            expected: false,
          },
          {
            input: `true == 1`,
            expected: false,
          },
          {
            input: `true == ''`,
            expected: false,
          },
          {
            input: `true == 'a'`,
            expected: false,
          },
          {
            input: `true == []`,
            expected: false,
          },
          {
            input: `true == ['a']`,
            expected: false,
          },
          {
            input: `0 == 0`,
            expected: true,
          },
          {
            input: `0 == 1`,
            expected: false,
          },
          {
            input: `0 == ''`,
            expected: false,
          },
          {
            input: `0 == '0'`,
            expected: false,
          },
          {
            input: `0 == []`,
            expected: false,
          },
          {
            input: `0 == ['0']`,
            expected: false,
          },
          {
            input: `1 == 0`,
            expected: false,
          },
          {
            input: `1 == 1`,
            expected: true,
          },
          {
            input: `1 == ''`,
            expected: false,
          },
          {
            input: `1 == '1'`,
            expected: false,
          },
          {
            input: `1 == []`,
            expected: false,
          },
          {
            input: `1 == ['1']`,
            expected: false,
          },
          {
            input: `'' == true`,
            expected: false,
          },
          {
            input: `'' == false`,
            expected: false,
          },
          {
            input: `'' == 0`,
            expected: false,
          },
          {
            input: `'' == 1`,
            expected: false,
          },
          {
            input: `'' == ''`,
            expected: true,
          },
          {
            input: `'' == '42'`,
            expected: false,
          },
          {
            input: `'' == ['']`,
            expected: true,
          },
          {
            input: `'' == ['a']`,
            expected: false,
          },
          {
            input: `'' == ['','a']`,
            expected: true,
          },
          {
            input: `'a' == true`,
            expected: false,
          },
          {
            input: `'a' == false`,
            expected: false,
          },
          {
            input: `'a' == 0`,
            expected: false,
          },
          {
            input: `'a' == 1`,
            expected: false,
          },
          {
            input: `'a' == ''`,
            expected: false,
          },
          {
            input: `'a' == 'a'`,
            expected: true,
          },
          {
            input: `'a' == ['']`,
            expected: false,
          },
          {
            input: `'a' == ['a']`,
            expected: true,
          },
          {
            input: `'a' == ['','a']`,
            expected: true,
          },
          {
            input: `[] == true`,
            expected: false,
          },
          {
            input: `[] == false`,
            expected: false,
          },
          {
            input: `[] == 0`,
            expected: false,
          },
          {
            input: `[] == 42`,
            expected: false,
          },
          {
            input: `[] == ''`,
            expected: false,
          },
          {
            input: `[] == 'a'`,
            expected: false,
          },
          {
            input: `[] == []`,
            expected: true,
          },
          {
            input: `[] == ['']`,
            expected: false,
          },
          {
            input: `[] == ['a']`,
            expected: false,
          },
          {
            input: `[] == ['','a']`,
            expected: false,
          },
          {
            input: `[''] == true`,
            expected: false,
          },
          {
            input: `[''] == false`,
            expected: false,
          },
          {
            input: `[''] == 0`,
            expected: false,
          },
          {
            input: `[''] == 42`,
            expected: false,
          },
          {
            input: `[''] == ''`,
            expected: true,
          },
          {
            input: `[''] == 'a'`,
            expected: false,
          },
          {
            input: `[''] == []`,
            expected: false,
          },
          {
            input: `[''] == ['']`,
            expected: true,
          },
          {
            input: `[''] == ['a']`,
            expected: false,
          },
          {
            input: `[''] == ['','a']`,
            expected: false,
          },
          {
            input: `['a'] == true`,
            expected: false,
          },
          {
            input: `['a'] == false`,
            expected: false,
          },
          {
            input: `['a'] == 0`,
            expected: false,
          },
          {
            input: `['a'] == 42`,
            expected: false,
          },
          {
            input: `['a'] == ''`,
            expected: false,
          },
          {
            input: `['a'] == 'a'`,
            expected: true,
          },
          {
            input: `['a'] == []`,
            expected: false,
          },
          {
            input: `['a'] == ['']`,
            expected: false,
          },
          {
            input: `['a'] == ['a']`,
            expected: true,
          },
          {
            input: `['a'] == ['','a']`,
            expected: false,
          },
          {
            input: `['a',''] == ['','a']`,
            expected: true,
          },
        ]
      )(
        'binary.equal($input)',
        ({input, expected}: {input: string, expected: ReturnType<Expression['resolve']>}) => {
          const {ok, err} = Expression.compile(input);
          expect(err).toBeUndefined();
          expect(ok?.resolve({})).toStrictEqual(expected);
        },
      );

      // Binary operation different
      test.each(
        [
          {
            input: `true != true`,
            expected: false,
          },
          {
            input: `true != 0`,
            expected: true,
          },
          {
            input: `true != 1`,
            expected: true,
          },
          {
            input: `true != ''`,
            expected: true,
          },
          {
            input: `true != 'a'`,
            expected: true,
          },
          {
            input: `true != []`,
            expected: true,
          },
          {
            input: `true != ['a']`,
            expected: true,
          },
          {
            input: `0 != 0`,
            expected: false,
          },
          {
            input: `0 != 1`,
            expected: true,
          },
          {
            input: `0 != ''`,
            expected: true,
          },
          {
            input: `0 != '0'`,
            expected: true,
          },
          {
            input: `0 != []`,
            expected: true,
          },
          {
            input: `0 != ['0']`,
            expected: true,
          },
          {
            input: `1 != 0`,
            expected: true,
          },
          {
            input: `1 != 1`,
            expected: false,
          },
          {
            input: `1 != ''`,
            expected: true,
          },
          {
            input: `1 != '1'`,
            expected: true,
          },
          {
            input: `1 != []`,
            expected: true,
          },
          {
            input: `1 != ['1']`,
            expected: true,
          },
          {
            input: `'' != true`,
            expected: true,
          },
          {
            input: `'' != false`,
            expected: true,
          },
          {
            input: `'' != 0`,
            expected: true,
          },
          {
            input: `'' != 1`,
            expected: true,
          },
          {
            input: `'' != ''`,
            expected: false,
          },
          {
            input: `'' != '42'`,
            expected: true,
          },
          {
            input: `'' != ['']`,
            expected: false,
          },
          {
            input: `'' != ['a']`,
            expected: true,
          },
          {
            input: `'' != ['','a']`,
            expected: false,
          },
          {
            input: `'a' != true`,
            expected: true,
          },
          {
            input: `'a' != false`,
            expected: true,
          },
          {
            input: `'a' != 0`,
            expected: true,
          },
          {
            input: `'a' != 1`,
            expected: true,
          },
          {
            input: `'a' != ''`,
            expected: true,
          },
          {
            input: `'a' != 'a'`,
            expected: false,
          },
          {
            input: `'a' != ['']`,
            expected: true,
          },
          {
            input: `'a' != ['a']`,
            expected: false,
          },
          {
            input: `'a' != ['','a']`,
            expected: false,
          },
          {
            input: `[] != true`,
            expected: true,
          },
          {
            input: `[] != false`,
            expected: true,
          },
          {
            input: `[] != 0`,
            expected: true,
          },
          {
            input: `[] != 42`,
            expected: true,
          },
          {
            input: `[] != ''`,
            expected: true,
          },
          {
            input: `[] != 'a'`,
            expected: true,
          },
          {
            input: `[] != []`,
            expected: false,
          },
          {
            input: `[] != ['']`,
            expected: true,
          },
          {
            input: `[] != ['a']`,
            expected: true,
          },
          {
            input: `[] != ['','a']`,
            expected: true,
          },
          {
            input: `[''] != true`,
            expected: true,
          },
          {
            input: `[''] != false`,
            expected: true,
          },
          {
            input: `[''] != 0`,
            expected: true,
          },
          {
            input: `[''] != 42`,
            expected: true,
          },
          {
            input: `[''] != ''`,
            expected: false,
          },
          {
            input: `[''] != 'a'`,
            expected: true,
          },
          {
            input: `[''] != []`,
            expected: true,
          },
          {
            input: `[''] != ['']`,
            expected: false,
          },
          {
            input: `[''] != ['a']`,
            expected: true,
          },
          {
            input: `[''] != ['','a']`,
            expected: true,
          },
          {
            input: `['a'] != true`,
            expected: true,
          },
          {
            input: `['a'] != false`,
            expected: true,
          },
          {
            input: `['a'] != 0`,
            expected: true,
          },
          {
            input: `['a'] != 42`,
            expected: true,
          },
          {
            input: `['a'] != ''`,
            expected: true,
          },
          {
            input: `['a'] != 'a'`,
            expected: false,
          },
          {
            input: `['a'] != []`,
            expected: true,
          },
          {
            input: `['a'] != ['']`,
            expected: true,
          },
          {
            input: `['a'] != ['a']`,
            expected: false,
          },
          {
            input: `['a'] != ['','a']`,
            expected: true,
          },
          {
            input: `['a',''] != ['','a']`,
            expected: false,
          },
        ]
      )(
        'binary.different($input)',
        ({input, expected}: {input: string, expected: ReturnType<Expression['resolve']>}) => {
          const {ok, err} = Expression.compile(input);
          expect(err).toBeUndefined();
          expect(ok?.resolve({})).toStrictEqual(expected);
        },
      );

      // Binary operation greater
      test.each(
        [
          {
            input: `true > true`,
            expected: false,
          },
          {
            input: `true > false`,
            expected: true,
          },
          {
            input: `true > 0`,
            expected: false,
          },
          {
            input: `true > 1`,
            expected: false,
          },
          {
            input: `true > ''`,
            expected: false,
          },
          {
            input: `true > 'a'`,
            expected: false,
          },
          {
            input: `true > []`,
            expected: false,
          },
          {
            input: `true > ['a']`,
            expected: false,
          },
          {
            input: `false > true`,
            expected: false,
          },
          {
            input: `false > false`,
            expected: false,
          },
          {
            input: `0 > 0`,
            expected: false,
          },
          {
            input: `0 > 1`,
            expected: false,
          },
          {
            input: `0 > ''`,
            expected: false,
          },
          {
            input: `0 > '0'`,
            expected: false,
          },
          {
            input: `0 > []`,
            expected: false,
          },
          {
            input: `0 > ['0']`,
            expected: false,
          },
          {
            input: `1 > 0`,
            expected: true,
          },
          {
            input: `1 > 1`,
            expected: false,
          },
          {
            input: `1 > ''`,
            expected: false,
          },
          {
            input: `1 > '1'`,
            expected: false,
          },
          {
            input: `1 > []`,
            expected: false,
          },
          {
            input: `1 > ['1']`,
            expected: false,
          },
          {
            input: `'' > true`,
            expected: false,
          },
          {
            input: `'' > false`,
            expected: false,
          },
          {
            input: `'' > 0`,
            expected: false,
          },
          {
            input: `'' > 1`,
            expected: false,
          },
          {
            input: `'' > ''`,
            expected: false,
          },
          {
            input: `'' > '42'`,
            expected: false,
          },
          {
            input: `'' > ['']`,
            expected: false,
          },
          {
            input: `'' > ['a']`,
            expected: false,
          },
          {
            input: `'' > ['','a']`,
            expected: false,
          },
          {
            input: `'a' > true`,
            expected: false,
          },
          {
            input: `'a' > false`,
            expected: false,
          },
          {
            input: `'a' > 0`,
            expected: false,
          },
          {
            input: `'a' > 1`,
            expected: false,
          },
          {
            input: `'a' > ''`,
            expected: true,
          },
          {
            input: `'a' > 'a'`,
            expected: false,
          },
          {
            input: `'a' > ['']`,
            expected: false,
          },
          {
            input: `'a' > ['a']`,
            expected: false,
          },
          {
            input: `'a' > ['','a']`,
            expected: false,
          },
          {
            input: `'b' > ''`,
            expected: true,
          },
          {
            input: `'b' > 'a'`,
            expected: true,
          },
          {
            input: `'b' > 'b'`,
            expected: false,
          },
          {
            input: `[] > true`,
            expected: false,
          },
          {
            input: `[] > false`,
            expected: false,
          },
          {
            input: `[] > 0`,
            expected: false,
          },
          {
            input: `[] > 42`,
            expected: false,
          },
          {
            input: `[] > ''`,
            expected: false,
          },
          {
            input: `[] > 'a'`,
            expected: false,
          },
          {
            input: `[] > []`,
            expected: false,
          },
          {
            input: `[] > ['']`,
            expected: false,
          },
          {
            input: `[] > ['a']`,
            expected: false,
          },
          {
            input: `[] > ['','a']`,
            expected: false,
          },
          {
            input: `[''] > true`,
            expected: false,
          },
          {
            input: `[''] > false`,
            expected: false,
          },
          {
            input: `[''] > 0`,
            expected: false,
          },
          {
            input: `[''] > 42`,
            expected: false,
          },
          {
            input: `[''] > ''`,
            expected: true,
          },
          {
            input: `[''] > 'a'`,
            expected: false,
          },
          {
            input: `[''] > []`,
            expected: true,
          },
          {
            input: `[''] > ['']`,
            expected: false,
          },
          {
            input: `[''] > ['a']`,
            expected: false,
          },
          {
            input: `[''] > ['','a']`,
            expected: false,
          },
          {
            input: `['a'] > true`,
            expected: false,
          },
          {
            input: `['a'] > false`,
            expected: false,
          },
          {
            input: `['a'] > 0`,
            expected: false,
          },
          {
            input: `['a'] > 42`,
            expected: false,
          },
          {
            input: `['a'] > ''`,
            expected: false,
          },
          {
            input: `['a'] > 'a'`,
            expected: true,
          },
          {
            input: `['a'] > []`,
            expected: true,
          },
          {
            input: `['a'] > ['']`,
            expected: false,
          },
          {
            input: `['a'] > ['a']`,
            expected: false,
          },
          {
            input: `['a'] > ['','a']`,
            expected: false,
          },
          {
            input: `['a',''] > ['','a']`,
            expected: false,
          },
        ]
      )(
        'binary.greater($input)',
        ({input, expected}: {input: string, expected: ReturnType<Expression['resolve']>}) => {
          const {ok, err} = Expression.compile(input);
          expect(err).toBeUndefined();
          expect(ok?.resolve({})).toStrictEqual(expected);
        },
      );

      // Binary operation greater or equal
      test.each(
        [
          {
            input: `true >= true`,
            expected: true,
          },
          {
            input: `true >= false`,
            expected: true,
          },
          {
            input: `true >= 0`,
            expected: false,
          },
          {
            input: `true >= 1`,
            expected: false,
          },
          {
            input: `true >= ''`,
            expected: false,
          },
          {
            input: `true >= 'a'`,
            expected: false,
          },
          {
            input: `true >= []`,
            expected: false,
          },
          {
            input: `true >= ['a']`,
            expected: false,
          },
          {
            input: `false >= true`,
            expected: false,
          },
          {
            input: `false >= false`,
            expected: true,
          },
          {
            input: `0 >= 0`,
            expected: true,
          },
          {
            input: `0 >= 1`,
            expected: false,
          },
          {
            input: `0 >= ''`,
            expected: false,
          },
          {
            input: `0 >= '0'`,
            expected: false,
          },
          {
            input: `0 >= []`,
            expected: false,
          },
          {
            input: `0 >= ['0']`,
            expected: false,
          },
          {
            input: `1 >= 0`,
            expected: true,
          },
          {
            input: `1 >= 1`,
            expected: true,
          },
          {
            input: `1 >= ''`,
            expected: false,
          },
          {
            input: `1 >= '1'`,
            expected: false,
          },
          {
            input: `1 >= []`,
            expected: false,
          },
          {
            input: `1 >= ['1']`,
            expected: false,
          },
          {
            input: `'' >= true`,
            expected: false,
          },
          {
            input: `'' >= false`,
            expected: false,
          },
          {
            input: `'' >= 0`,
            expected: false,
          },
          {
            input: `'' >= 1`,
            expected: false,
          },
          {
            input: `'' >= ''`,
            expected: true,
          },
          {
            input: `'' >= '42'`,
            expected: false,
          },
          {
            input: `'' >= ['']`,
            expected: false,
          },
          {
            input: `'' >= ['a']`,
            expected: false,
          },
          {
            input: `'' >= ['','a']`,
            expected: false,
          },
          {
            input: `'a' >= true`,
            expected: false,
          },
          {
            input: `'a' >= false`,
            expected: false,
          },
          {
            input: `'a' >= 0`,
            expected: false,
          },
          {
            input: `'a' >= 1`,
            expected: false,
          },
          {
            input: `'a' >= ''`,
            expected: true,
          },
          {
            input: `'a' >= 'a'`,
            expected: true,
          },
          {
            input: `'a' >= ['']`,
            expected: false,
          },
          {
            input: `'a' >= ['a']`,
            expected: false,
          },
          {
            input: `'a' >= ['','a']`,
            expected: false,
          },
          {
            input: `'b' >= ''`,
            expected: true,
          },
          {
            input: `'b' >= 'a'`,
            expected: true,
          },
          {
            input: `'b' >= 'b'`,
            expected: true,
          },
          {
            input: `[] >= true`,
            expected: false,
          },
          {
            input: `[] >= false`,
            expected: false,
          },
          {
            input: `[] >= 0`,
            expected: false,
          },
          {
            input: `[] >= 42`,
            expected: false,
          },
          {
            input: `[] >= ''`,
            expected: false,
          },
          {
            input: `[] >= 'a'`,
            expected: false,
          },
          {
            input: `[] >= []`,
            expected: true,
          },
          {
            input: `[] >= ['']`,
            expected: false,
          },
          {
            input: `[] >= ['a']`,
            expected: false,
          },
          {
            input: `[] >= ['','a']`,
            expected: false,
          },
          {
            input: `[''] >= true`,
            expected: false,
          },
          {
            input: `[''] >= false`,
            expected: false,
          },
          {
            input: `[''] >= 0`,
            expected: false,
          },
          {
            input: `[''] >= 42`,
            expected: false,
          },
          {
            input: `[''] >= ''`,
            expected: true,
          },
          {
            input: `[''] >= 'a'`,
            expected: false,
          },
          {
            input: `[''] >= []`,
            expected: true,
          },
          {
            input: `[''] >= ['']`,
            expected: true,
          },
          {
            input: `[''] >= ['a']`,
            expected: false,
          },
          {
            input: `[''] >= ['','a']`,
            expected: false,
          },
          {
            input: `['a'] >= true`,
            expected: false,
          },
          {
            input: `['a'] >= false`,
            expected: false,
          },
          {
            input: `['a'] >= 0`,
            expected: false,
          },
          {
            input: `['a'] >= 42`,
            expected: false,
          },
          {
            input: `['a'] >= ''`,
            expected: false,
          },
          {
            input: `['a'] >= 'a'`,
            expected: true,
          },
          {
            input: `['a'] >= []`,
            expected: true,
          },
          {
            input: `['a'] >= ['']`,
            expected: false,
          },
          {
            input: `['a'] >= ['a']`,
            expected: true,
          },
          {
            input: `['a'] >= ['','a']`,
            expected: false,
          },
          {
            input: `['a',''] >= ['','a']`,
            expected: true,
          },
        ]
      )(
        'binary.greater_or_equal($input)',
        ({input, expected}: {input: string, expected: ReturnType<Expression['resolve']>}) => {
          const {ok, err} = Expression.compile(input);
          expect(err).toBeUndefined();
          expect(ok?.resolve({})).toStrictEqual(expected);
        },
      );

      // Binary operation less
      test.each(
        [
          {
            input: `true < true`,
            expected: false,
          },
          {
            input: `true < false`,
            expected: false,
          },
          {
            input: `true < 0`,
            expected: false,
          },
          {
            input: `true < 1`,
            expected: false,
          },
          {
            input: `true < ''`,
            expected: false,
          },
          {
            input: `true < 'a'`,
            expected: false,
          },
          {
            input: `true < []`,
            expected: false,
          },
          {
            input: `true < ['a']`,
            expected: false,
          },
          {
            input: `false < true`,
            expected: true,
          },
          {
            input: `false < false`,
            expected: false,
          },
          {
            input: `0 < 0`,
            expected: false,
          },
          {
            input: `0 < 1`,
            expected: true,
          },
          {
            input: `0 < ''`,
            expected: false,
          },
          {
            input: `0 < '0'`,
            expected: false,
          },
          {
            input: `0 < []`,
            expected: false,
          },
          {
            input: `0 < ['0']`,
            expected: false,
          },
          {
            input: `1 < 0`,
            expected: false,
          },
          {
            input: `1 < 1`,
            expected: false,
          },
          {
            input: `1 < ''`,
            expected: false,
          },
          {
            input: `1 < '1'`,
            expected: false,
          },
          {
            input: `1 < []`,
            expected: false,
          },
          {
            input: `1 < ['1']`,
            expected: false,
          },
          {
            input: `'' < true`,
            expected: false,
          },
          {
            input: `'' < false`,
            expected: false,
          },
          {
            input: `'' < 0`,
            expected: false,
          },
          {
            input: `'' < 1`,
            expected: false,
          },
          {
            input: `'' < ''`,
            expected: false,
          },
          {
            input: `'' < '42'`,
            expected: true,
          },
          {
            input: `'' < ['']`,
            expected: true,
          },
          {
            input: `'' < ['a']`,
            expected: false,
          },
          {
            input: `'' < ['','a']`,
            expected: true,
          },
          {
            input: `'a' < true`,
            expected: false,
          },
          {
            input: `'a' < false`,
            expected: false,
          },
          {
            input: `'a' < 0`,
            expected: false,
          },
          {
            input: `'a' < 1`,
            expected: false,
          },
          {
            input: `'a' < ''`,
            expected: false,
          },
          {
            input: `'a' < 'a'`,
            expected: false,
          },
          {
            input: `'a' < ['']`,
            expected: false,
          },
          {
            input: `'a' < ['a']`,
            expected: true,
          },
          {
            input: `'a' < ['','a']`,
            expected: true,
          },
          {
            input: `'b' < ''`,
            expected: false,
          },
          {
            input: `'b' < 'a'`,
            expected: false,
          },
          {
            input: `'b' < 'b'`,
            expected: false,
          },
          {
            input: `[] < true`,
            expected: false,
          },
          {
            input: `[] < false`,
            expected: false,
          },
          {
            input: `[] < 0`,
            expected: false,
          },
          {
            input: `[] < 42`,
            expected: false,
          },
          {
            input: `[] < ''`,
            expected: false,
          },
          {
            input: `[] < 'a'`,
            expected: false,
          },
          {
            input: `[] < []`,
            expected: false,
          },
          {
            input: `[] < ['']`,
            expected: true,
          },
          {
            input: `[] < ['a']`,
            expected: true,
          },
          {
            input: `[] < ['','a']`,
            expected: true,
          },
          {
            input: `[''] < true`,
            expected: false,
          },
          {
            input: `[''] < false`,
            expected: false,
          },
          {
            input: `[''] < 0`,
            expected: false,
          },
          {
            input: `[''] < 42`,
            expected: false,
          },
          {
            input: `[''] < ''`,
            expected: false,
          },
          {
            input: `[''] < 'a'`,
            expected: false,
          },
          {
            input: `[''] < []`,
            expected: false,
          },
          {
            input: `[''] < ['']`,
            expected: false,
          },
          {
            input: `[''] < ['a']`,
            expected: false,
          },
          {
            input: `[''] < ['','a']`,
            expected: true,
          },
          {
            input: `['a'] < true`,
            expected: false,
          },
          {
            input: `['a'] < false`,
            expected: false,
          },
          {
            input: `['a'] < 0`,
            expected: false,
          },
          {
            input: `['a'] < 42`,
            expected: false,
          },
          {
            input: `['a'] < ''`,
            expected: false,
          },
          {
            input: `['a'] < 'a'`,
            expected: false,
          },
          {
            input: `['a'] < []`,
            expected: false,
          },
          {
            input: `['a'] < ['']`,
            expected: false,
          },
          {
            input: `['a'] < ['a']`,
            expected: false,
          },
          {
            input: `['a'] < ['','a']`,
            expected: true,
          },
          {
            input: `['a',''] < ['','a']`,
            expected: false,
          },
        ]
      )(
        'binary.lesser($input)',
        ({input, expected}: {input: string, expected: ReturnType<Expression['resolve']>}) => {
          const {ok, err} = Expression.compile(input);
          expect(err).toBeUndefined();
          expect(ok?.resolve({})).toStrictEqual(expected);
        },
      );

      // Binary operation greater or equal
      test.each(
        [
          {
            input: `true <= true`,
            expected: true,
          },
          {
            input: `true <= false`,
            expected: false,
          },
          {
            input: `true <= 0`,
            expected: false,
          },
          {
            input: `true <= 1`,
            expected: false,
          },
          {
            input: `true <= ''`,
            expected: false,
          },
          {
            input: `true <= 'a'`,
            expected: false,
          },
          {
            input: `true <= []`,
            expected: false,
          },
          {
            input: `true <= ['a']`,
            expected: false,
          },
          {
            input: `false <= true`,
            expected: true,
          },
          {
            input: `false <= false`,
            expected: true,
          },
          {
            input: `0 <= 0`,
            expected: true,
          },
          {
            input: `0 <= 1`,
            expected: true,
          },
          {
            input: `0 <= ''`,
            expected: false,
          },
          {
            input: `0 <= '0'`,
            expected: false,
          },
          {
            input: `0 <= []`,
            expected: false,
          },
          {
            input: `0 <= ['0']`,
            expected: false,
          },
          {
            input: `1 <= 0`,
            expected: false,
          },
          {
            input: `1 <= 1`,
            expected: true,
          },
          {
            input: `1 <= ''`,
            expected: false,
          },
          {
            input: `1 <= '1'`,
            expected: false,
          },
          {
            input: `1 <= []`,
            expected: false,
          },
          {
            input: `1 <= ['1']`,
            expected: false,
          },
          {
            input: `'' <= true`,
            expected: false,
          },
          {
            input: `'' <= false`,
            expected: false,
          },
          {
            input: `'' <= 0`,
            expected: false,
          },
          {
            input: `'' <= 1`,
            expected: false,
          },
          {
            input: `'' <= ''`,
            expected: true,
          },
          {
            input: `'' <= '42'`,
            expected: true,
          },
          {
            input: `'' <= ['']`,
            expected: true,
          },
          {
            input: `'' <= ['a']`,
            expected: false,
          },
          {
            input: `'' <= ['','a']`,
            expected: true,
          },
          {
            input: `'a' <= true`,
            expected: false,
          },
          {
            input: `'a' <= false`,
            expected: false,
          },
          {
            input: `'a' <= 0`,
            expected: false,
          },
          {
            input: `'a' <= 1`,
            expected: false,
          },
          {
            input: `'a' <= ''`,
            expected: false,
          },
          {
            input: `'a' <= 'a'`,
            expected: true,
          },
          {
            input: `'a' <= ['']`,
            expected: false,
          },
          {
            input: `'a' <= ['a']`,
            expected: true,
          },
          {
            input: `'a' <= ['','a']`,
            expected: true,
          },
          {
            input: `'b' <= ''`,
            expected: false,
          },
          {
            input: `'b' <= 'a'`,
            expected: false,
          },
          {
            input: `'b' <= 'b'`,
            expected: true,
          },
          {
            input: `[] <= true`,
            expected: false,
          },
          {
            input: `[] <= false`,
            expected: false,
          },
          {
            input: `[] <= 0`,
            expected: false,
          },
          {
            input: `[] <= 42`,
            expected: false,
          },
          {
            input: `[] <= ''`,
            expected: false,
          },
          {
            input: `[] <= 'a'`,
            expected: false,
          },
          {
            input: `[] <= []`,
            expected: true,
          },
          {
            input: `[] <= ['']`,
            expected: true,
          },
          {
            input: `[] <= ['a']`,
            expected: true,
          },
          {
            input: `[] <= ['','a']`,
            expected: true,
          },
          {
            input: `[''] <= true`,
            expected: false,
          },
          {
            input: `[''] <= false`,
            expected: false,
          },
          {
            input: `[''] <= 0`,
            expected: false,
          },
          {
            input: `[''] <= 42`,
            expected: false,
          },
          {
            input: `[''] <= ''`,
            expected: false,
          },
          {
            input: `[''] <= 'a'`,
            expected: false,
          },
          {
            input: `[''] <= []`,
            expected: false,
          },
          {
            input: `[''] <= ['']`,
            expected: true,
          },
          {
            input: `[''] <= ['a']`,
            expected: false,
          },
          {
            input: `[''] <= ['','a']`,
            expected: true,
          },
          {
            input: `['a'] <= true`,
            expected: false,
          },
          {
            input: `['a'] <= false`,
            expected: false,
          },
          {
            input: `['a'] <= 0`,
            expected: false,
          },
          {
            input: `['a'] <= 42`,
            expected: false,
          },
          {
            input: `['a'] <= ''`,
            expected: false,
          },
          {
            input: `['a'] <= 'a'`,
            expected: false,
          },
          {
            input: `['a'] <= []`,
            expected: false,
          },
          {
            input: `['a'] <= ['']`,
            expected: false,
          },
          {
            input: `['a'] <= ['a']`,
            expected: true,
          },
          {
            input: `['a'] <= ['','a']`,
            expected: true,
          },
          {
            input: `['a',''] <= ['','a']`,
            expected: true,
          },
        ]
      )(
        'binary.lesser_or_equal($input)',
        ({input, expected}: {input: string, expected: ReturnType<Expression['resolve']>}) => {
          const {ok, err} = Expression.compile(input);
          expect(err).toBeUndefined();
          expect(ok?.resolve({})).toStrictEqual(expected);
        },
      );

      // Binary operation in
      test.each(
        [
          {
            input: `true in true`,
            expected: false,
          },
          {
            input: `true in false`,
            expected: false,
          },
          {
            input: `true in 0`,
            expected: false,
          },
          {
            input: `true in 1`,
            expected: false,
          },
          {
            input: `true in ''`,
            expected: false,
          },
          {
            input: `true in 'a'`,
            expected: false,
          },
          {
            input: `true in []`,
            expected: false,
          },
          {
            input: `true in ['a']`,
            expected: false,
          },
          {
            input: `false in true`,
            expected: false,
          },
          {
            input: `false in false`,
            expected: false,
          },
          {
            input: `false in []`,
            expected: false,
          },
          {
            input: `0 in 0`,
            expected: false,
          },
          {
            input: `0 in 1`,
            expected: false,
          },
          {
            input: `0 in ''`,
            expected: false,
          },
          {
            input: `0 in '0'`,
            expected: false,
          },
          {
            input: `0 in []`,
            expected: false,
          },
          {
            input: `0 in ['0']`,
            expected: false,
          },
          {
            input: `1 in 0`,
            expected: false,
          },
          {
            input: `1 in 1`,
            expected: false,
          },
          {
            input: `1 in ''`,
            expected: false,
          },
          {
            input: `1 in '1'`,
            expected: false,
          },
          {
            input: `1 in []`,
            expected: false,
          },
          {
            input: `1 in ['1']`,
            expected: false,
          },
          {
            input: `'' in true`,
            expected: false,
          },
          {
            input: `'' in false`,
            expected: false,
          },
          {
            input: `'' in 0`,
            expected: false,
          },
          {
            input: `'' in 1`,
            expected: false,
          },
          {
            input: `'' in ''`,
            expected: false,
          },
          {
            input: `'' in '42'`,
            expected: false,
          },
          {
            input: `'' in ['']`,
            expected: true,
          },
          {
            input: `'' in ['a']`,
            expected: false,
          },
          {
            input: `'' in ['','a']`,
            expected: true,
          },
          {
            input: `'a' in true`,
            expected: false,
          },
          {
            input: `'a' in false`,
            expected: false,
          },
          {
            input: `'a' in 0`,
            expected: false,
          },
          {
            input: `'a' in 1`,
            expected: false,
          },
          {
            input: `'a' in ''`,
            expected: false,
          },
          {
            input: `'a' in 'a'`,
            expected: false,
          },
          {
            input: `'a' in ['']`,
            expected: false,
          },
          {
            input: `'a' in ['a']`,
            expected: true,
          },
          {
            input: `'a' in ['','a']`,
            expected: true,
          },
          {
            input: `'b' in ''`,
            expected: false,
          },
          {
            input: `'b' in 'a'`,
            expected: false,
          },
          {
            input: `'b' in 'b'`,
            expected: false,
          },
          {
            input: `[] in true`,
            expected: false,
          },
          {
            input: `[] in false`,
            expected: false,
          },
          {
            input: `[] in 0`,
            expected: false,
          },
          {
            input: `[] in 42`,
            expected: false,
          },
          {
            input: `[] in ''`,
            expected: false,
          },
          {
            input: `[] in 'a'`,
            expected: false,
          },
          {
            input: `[] in []`,
            expected: true,
          },
          {
            input: `[] in ['']`,
            expected: true,
          },
          {
            input: `[] in ['a']`,
            expected: true,
          },
          {
            input: `[] in ['','a']`,
            expected: true,
          },
          {
            input: `[''] in true`,
            expected: false,
          },
          {
            input: `[''] in false`,
            expected: false,
          },
          {
            input: `[''] in 0`,
            expected: false,
          },
          {
            input: `[''] in 42`,
            expected: false,
          },
          {
            input: `[''] in ''`,
            expected: false,
          },
          {
            input: `[''] in 'a'`,
            expected: false,
          },
          {
            input: `[''] in []`,
            expected: false,
          },
          {
            input: `[''] in ['']`,
            expected: true,
          },
          {
            input: `[''] in ['a']`,
            expected: false,
          },
          {
            input: `[''] in ['','a']`,
            expected: true,
          },
          {
            input: `['a'] in true`,
            expected: false,
          },
          {
            input: `['a'] in false`,
            expected: false,
          },
          {
            input: `['a'] in 0`,
            expected: false,
          },
          {
            input: `['a'] in 42`,
            expected: false,
          },
          {
            input: `['a'] in ''`,
            expected: false,
          },
          {
            input: `['a'] in 'a'`,
            expected: false,
          },
          {
            input: `['a'] in []`,
            expected: false,
          },
          {
            input: `['a'] in ['']`,
            expected: false,
          },
          {
            input: `['a'] in ['a']`,
            expected: true,
          },
          {
            input: `['a'] in ['','a']`,
            expected: true,
          },
          {
            input: `['a',''] in ['','a']`,
            expected: true,
          },
        ]
      )(
        'binary.in($input)',
        ({input, expected}: {input: string, expected: ReturnType<Expression['resolve']>}) => {
          const {ok, err} = Expression.compile(input);
          expect(err).toBeUndefined();
          expect(ok?.resolve({})).toStrictEqual(expected);
        },
      );

      // Binary operation or
      test.each(
        [
          {
            input: `true || true`,
            expected: true,
          },
          {
            input: `true || false`,
            expected: true,
          },
          {
            input: `false || true`,
            expected: true,
          },
          {
            input: `false || false`,
            expected: false,
          },
          {
            input: `0 || 0`,
            expected: false,
          },
          {
            input: `0 || 1`,
            expected: true,
          },
          {
            input: `1 || 0`,
            expected: true,
          },
          {
            input: `1 || 1`,
            expected: true,
          },
          {
            input: `'' || ''`,
            expected: false,
          },
          {
            input: `'' || 'a'`,
            expected: true,
          },
          {
            input: `'a' || ''`,
            expected: true,
          },
          {
            input: `'a' || 'a'`,
            expected: true,
          },
          {
            input: `[] || []`,
            expected: false,
          },
          {
            input: `[] || ['a']`,
            expected: true,
          },
          {
            input: `['a'] || []`,
            expected: true,
          },
          {
            input: `['a'] || ['a']`,
            expected: true,
          },
        ]
      )(
        'binary.or($input)',
        ({input, expected}: {input: string, expected: ReturnType<Expression['resolve']>}) => {
          const {ok, err} = Expression.compile(input);
          expect(err).toBeUndefined();
          expect(ok?.resolve({})).toStrictEqual(expected);
        },
      );

      // Binary operation and
      test.each(
        [
          {
            input: `true && true`,
            expected: true,
          },
          {
            input: `true && false`,
            expected: false,
          },
          {
            input: `false && true`,
            expected: false,
          },
          {
            input: `false && false`,
            expected: false,
          },
          {
            input: `0 && 0`,
            expected: false,
          },
          {
            input: `0 && 1`,
            expected: false,
          },
          {
            input: `1 && 0`,
            expected: false,
          },
          {
            input: `1 && 1`,
            expected: true,
          },
          {
            input: `'' && ''`,
            expected: false,
          },
          {
            input: `'' && 'a'`,
            expected: false,
          },
          {
            input: `'a' && ''`,
            expected: false,
          },
          {
            input: `'a' && 'a'`,
            expected: true,
          },
          {
            input: `[] && []`,
            expected: false,
          },
          {
            input: `[] && ['a']`,
            expected: false,
          },
          {
            input: `['a'] && []`,
            expected: false,
          },
          {
            input: `['a'] && ['a']`,
            expected: true,
          },
        ]
      )(
        'binary.and($input)',
        ({input, expected}: {input: string, expected: ReturnType<Expression['resolve']>}) => {
          const {ok, err} = Expression.compile(input);
          expect(err).toBeUndefined();
          expect(ok?.resolve({})).toStrictEqual(expected);
        },
      );

      // Binary operation add
      test.each(
        [
          {
            input: `false + false`,
            expected: false,
          },
          {
            input: `false + true`,
            expected: true,
          },
          {
            input: `true + false`,
            expected: true,
          },
          {
            input: `true + true`,
            expected: true,
          },
          {
            input: `true + 0`,
            expected: undefined,
          },
          {
            input: `true + 'a'`,
            expected: 'truea',
          },
          {
            input: `true + ['a']`,
            expected: undefined,
          },
          {
            input: `0 + true`,
            expected: undefined,
          },
          {
            input: `2 + 3`,
            expected: 5,
          },
          {
            input: `0 + 'a'`,
            expected: '0a',
          },
          {
            input: `0 + []`,
            expected: undefined,
          },
          {
            input: `'a' + true`,
            expected: 'atrue',
          },
          {
            input: `'b' + 1`,
            expected: 'b1',
          },
          {
            input: `'c' + 'd'`,
            expected: 'cd',
          },
          {
            input: `'e' + []`,
            expected: new Set(['e']),
          },
          {
            input: `'f' + ['f']`,
            expected: new Set(['f']),
          },
          {
            input: `'g' + ['h']`,
            expected: new Set(['g', 'h']),
          },
          {
            input: `[] + false`,
            expected: undefined,
          },
          {
            input: `[] + 1`,
            expected: undefined,
          },
          {
            input: `[] + 'i'`,
            expected: new Set(['i']),
          },
          {
            input: `[] + []`,
            expected: new Set(),
          },
          {
            input: `['k'] + 'k'`,
            expected: new Set(['k']),
          },
          {
            input: `['k'] + 'm'`,
            expected: new Set(['k', 'm']),
          },
          {
            input: `['k'] + []`,
            expected: new Set(['k']),
          },
          {
            input: `['k'] + ['k']`,
            expected: new Set(['k']),
          },
          {
            input: `['k'] + ['l']`,
            expected: new Set(['k', 'l']),
          },
          {
            input: `['k'] + ['l', 'n']`,
            expected: new Set(['k', 'l', 'n']),
          },
          {
            input: `['o', 'p'] + 'o'`,
            expected: new Set(['o', 'p']),
          },
          {
            input: `['o', 'p'] + 'p'`,
            expected: new Set(['o', 'p']),
          },
          {
            input: `['o', 'p'] + 'q'`,
            expected: new Set(['o', 'p', 'q']),
          },
          {
            input: `['o', 'p'] + []`,
            expected: new Set(['o', 'p']),
          },
          {
            input: `['o', 'p'] + ['o']`,
            expected: new Set(['o', 'p']),
          },
          {
            input: `['o', 'p'] + ['p']`,
            expected: new Set(['o', 'p']),
          },
          {
            input: `['o', 'p'] + ['r']`,
            expected: new Set(['o', 'p', 'r']),
          },
          {
            input: `['o', 'p'] + ['o', 'r']`,
            expected: new Set(['o', 'p', 'r']),
          },
          {
            input: `['o', 'p'] + ['s', 't']`,
            expected: new Set(['o', 'p', 's', 't']),
          },
        ]
      )(
        'binary.add($input)',
        ({input, expected}: {input: string, expected: ReturnType<Expression['resolve']>}) => {
          const {ok, err} = Expression.compile(input);
          expect(err).toBeUndefined();
          expect(ok?.resolve({})).toStrictEqual(expected);
        },
      );

      // Binary operation sub
      test.each(
        [
          {
            input: `false - false`,
            expected: false,
          },
          {
            input: `false - true`,
            expected: false,
          },
          {
            input: `true - false`,
            expected: true,
          },
          {
            input: `true - true`,
            expected: false,
          },
          {
            input: `true - 0`,
            expected: undefined,
          },
          {
            input: `true - 'a'`,
            expected: undefined,
          },
          {
            input: `true - ['a']`,
            expected: undefined,
          },
          {
            input: `0 - true`,
            expected: undefined,
          },
          {
            input: `2 - 3`,
            expected: -1,
          },
          {
            input: `0 - 'a'`,
            expected: undefined,
          },
          {
            input: `0 - []`,
            expected: undefined,
          },
          {
            input: `'a' - true`,
            expected: undefined,
          },
          {
            input: `'b' - 1`,
            expected: undefined,
          },
          {
            input: `'c' - 'd'`,
            expected: undefined,
          },
          {
            input: `'e' - []`,
            expected: undefined,
          },
          {
            input: `'f' - ['f']`,
            expected: undefined,
          },
          {
            input: `'g' - ['h']`,
            expected: undefined,
          },
          {
            input: `[] - false`,
            expected: undefined,
          },
          {
            input: `[] - 1`,
            expected: undefined,
          },
          {
            input: `[] - 'i'`,
            expected: new Set(),
          },
          {
            input: `[] - []`,
            expected: new Set(),
          },
          {
            input: `['k'] - 'k'`,
            expected: new Set(),
          },
          {
            input: `['k'] - 'm'`,
            expected: new Set(['k']),
          },
          {
            input: `['k'] - []`,
            expected: new Set(['k']),
          },
          {
            input: `['k'] - ['k']`,
            expected: new Set(),
          },
          {
            input: `['k'] - ['l']`,
            expected: new Set(['k']),
          },
          {
            input: `['k'] - ['l', 'n']`,
            expected: new Set(['k']),
          },
          {
            input: `['o', 'p'] - 'o'`,
            expected: new Set(['p']),
          },
          {
            input: `['o', 'p'] - 'p'`,
            expected: new Set(['o']),
          },
          {
            input: `['o', 'p'] - 'q'`,
            expected: new Set(['o', 'p']),
          },
          {
            input: `['o', 'p'] - []`,
            expected: new Set(['o', 'p']),
          },
          {
            input: `['o', 'p'] - ['o']`,
            expected: new Set(['p']),
          },
          {
            input: `['o', 'p'] - ['p']`,
            expected: new Set(['o']),
          },
          {
            input: `['o', 'p'] - ['r']`,
            expected: new Set(['o', 'p']),
          },
          {
            input: `['o', 'p'] - ['o', 'r']`,
            expected: new Set(['p']),
          },
          {
            input: `['o', 'p'] - ['s', 't']`,
            expected: new Set(['o', 'p']),
          },
        ]
      )(
        'binary.sub($input)',
        ({input, expected}: {input: string, expected: ReturnType<Expression['resolve']>}) => {
          const {ok, err} = Expression.compile(input);
          expect(err).toBeUndefined();
          expect(ok?.resolve({})).toStrictEqual(expected);
        },
      );

      // Binary operation mod
      test.each(
        [
          {
            input: `false % false`,
            expected: undefined,
          },
          {
            input: `false % true`,
            expected: undefined,
          },
          {
            input: `true % false`,
            expected: undefined,
          },
          {
            input: `true % true`,
            expected: undefined,
          },
          {
            input: `true % 0`,
            expected: undefined,
          },
          {
            input: `true % 'a'`,
            expected: undefined,
          },
          {
            input: `true % ['a']`,
            expected: undefined,
          },
          {
            input: `0 % true`,
            expected: undefined,
          },
          {
            input: `2 % 3`,
            expected: 2,
          },
          {
            input: `0 % 'a'`,
            expected: undefined,
          },
          {
            input: `0 % []`,
            expected: undefined,
          },
          {
            input: `'a' % true`,
            expected: undefined,
          },
          {
            input: `'b' % 1`,
            expected: undefined,
          },
          {
            input: `'c' % 'd'`,
            expected: undefined,
          },
          {
            input: `'e' % []`,
            expected: undefined,
          },
          {
            input: `'f' % ['f']`,
            expected: undefined,
          },
          {
            input: `'g' % ['h']`,
            expected: undefined,
          },
          {
            input: `[] % false`,
            expected: undefined,
          },
          {
            input: `[] % 1`,
            expected: undefined,
          },
          {
            input: `[] % 'i'`,
            expected: undefined,
          },
          {
            input: `[] % []`,
            expected: undefined,
          },
        ]
      )(
        'binary.mod($input)',
        ({input, expected}: {input: string, expected: ReturnType<Expression['resolve']>}) => {
          const {ok, err} = Expression.compile(input);
          expect(err).toBeUndefined();
          expect(ok?.resolve({})).toStrictEqual(expected);
        },
      );

      // Binary operation mul
      test.each(
        [
          {
            input: `false * false`,
            expected: false,
          },
          {
            input: `false * true`,
            expected: false,
          },
          {
            input: `true * false`,
            expected: false,
          },
          {
            input: `true * true`,
            expected: true,
          },
          {
            input: `true * 0`,
            expected: undefined,
          },
          {
            input: `true * 'a'`,
            expected: undefined,
          },
          {
            input: `true * ['a']`,
            expected: undefined,
          },
          {
            input: `0 * true`,
            expected: undefined,
          },
          {
            input: `2 * 3`,
            expected: 6,
          },
          {
            input: `0 * 'a'`,
            expected: '',
          },
          {
            input: `0 * []`,
            expected: undefined,
          },
          {
            input: `1 * 'ab'`,
            expected: 'ab',
          },
          {
            input: `3 * 'cd'`,
            expected: 'cdcdcd',
          },
          {
            input: `'a' * true`,
            expected: undefined,
          },
          {
            input: `'b' * 0`,
            expected: '',
          },
          {
            input: `'b' * 1`,
            expected: 'b',
          },
          {
            input: `'b' * 4`,
            expected: 'bbbb',
          },
          {
            input: `'c' * 'd'`,
            expected: undefined,
          },
          {
            input: `'e' * []`,
            expected: undefined,
          },
          {
            input: `'f' * ['f']`,
            expected: undefined,
          },
          {
            input: `'g' * ['h']`,
            expected: undefined,
          },
          {
            input: `[] * false`,
            expected: undefined,
          },
          {
            input: `[] * 1`,
            expected: undefined,
          },
          {
            input: `[] * 'i'`,
            expected: undefined,
          },
          {
            input: `[] * []`,
            expected: undefined,
          },
        ]
      )(
        'binary.mul($input)',
        ({input, expected}: {input: string, expected: ReturnType<Expression['resolve']>}) => {
          const {ok, err} = Expression.compile(input);
          expect(err).toBeUndefined();
          expect(ok?.resolve({})).toStrictEqual(expected);
        },
      );

      // Binary operation div
      test.each(
        [
          {
            input: `false / false`,
            expected: undefined,
          },
          {
            input: `false / true`,
            expected: undefined,
          },
          {
            input: `true / false`,
            expected: undefined,
          },
          {
            input: `true / true`,
            expected: undefined,
          },
          {
            input: `true / 0`,
            expected: undefined,
          },
          {
            input: `true / 'a'`,
            expected: undefined,
          },
          {
            input: `true / ['a']`,
            expected: undefined,
          },
          {
            input: `0 / true`,
            expected: undefined,
          },
          {
            input: `2 / 3`,
            expected: 2 / 3,
          },
          {
            input: `0 / 'a'`,
            expected: undefined,
          },
          {
            input: `0 / []`,
            expected: undefined,
          },
          {
            input: `'a' / true`,
            expected: undefined,
          },
          {
            input: `'b' / 0`,
            expected: undefined,
          },
          {
            input: `'b' / 1`,
            expected: undefined,
          },
          {
            input: `'c' / 'd'`,
            expected: undefined,
          },
          {
            input: `'e' / []`,
            expected: undefined,
          },
          {
            input: `'f' / ['f']`,
            expected: undefined,
          },
          {
            input: `'g' / ['h']`,
            expected: undefined,
          },
          {
            input: `[] / false`,
            expected: undefined,
          },
          {
            input: `[] / 1`,
            expected: undefined,
          },
          {
            input: `[] / 'i'`,
            expected: undefined,
          },
          {
            input: `[] / []`,
            expected: undefined,
          },
        ]
      )(
        'binary.div($input)',
        ({input, expected}: {input: string, expected: ReturnType<Expression['resolve']>}) => {
          const {ok, err} = Expression.compile(input);
          expect(err).toBeUndefined();
          expect(ok?.resolve({})).toStrictEqual(expected);
        },
      );

      // Priority
      test.each(
        [
          {
            input: `! false == 0`,
            expected: false,
          },
          {
            input: `(! false) == 0`,
            expected: false,
          },
          {
            input: `! (false == 0)`,
            expected: true,
          },
          {
            input: `false && false || false`,
            expected: false,
          },
          {
            input: `false && false || true`,
            expected: true,
          },
          {
            input: `false && true || false`,
            expected: false,
          },
          {
            input: `false && true || true`,
            expected: true,
          },
          {
            input: `true && false || false`,
            expected: false,
          },
          {
            input: `true && false || true`,
            expected: true,
          },
          {
            input: `true && true || false`,
            expected: true,
          },
          {
            input: `true && true || true`,
            expected: true,
          },
          {
            input: `false && (false || true)`,
            expected: false,
          },
          {
            input: `false && false == false`,
            expected: false,
          },
          {
            input: `false && (false == false)`,
            expected: false,
          },
          {
            input: `(false && false) == false`,
            expected: true,
          },
          {
            input: `1 == 1 != false`,
            expected: false,
          },
          {
            input: `(1 == 1) != false`,
            expected: true,
          },
          {
            input: `1 == (1 != false)`,
            expected: false,
          },
          {
            input: `true != false in []`,
            expected: true,
          },
          {
            input: `true != (false in [])`,
            expected: true,
          },
          {
            input: `(true != false) in []`,
            expected: false,
          },
          {
            input: `true > "b" in ["a"]`,
            expected: false,
          },
          {
            input: `(true > "b") in ["a"]`,
            expected: false,
          },
          {
            input: `true > ("b" in ["a"])`,
            expected: true,
          },
          {
            input: `true > false >= false`,
            expected: false,
          },
          {
            input: `true > (false >= false)`,
            expected: false,
          },
          {
            input: `(true > false) >= false`,
            expected: true,
          },
          {
            input: `true >= false < true`,
            expected: true,
          },
          {
            input: `true >= (false < true)`,
            expected: true,
          },
          {
            input: `(true >= false) < true`,
            expected: false,
          },
          {
            input: `true < false <= false`,
            expected: false,
          },
          {
            input: `true < (false <= false)`,
            expected: false,
          },
          {
            input: `(true < false) <= false`,
            expected: true,
          },
          {
            input: `1 <= 0 + 2`,
            expected: true,
          },
          {
            input: `1 <= (0 + 2)`,
            expected: true,
          },
          {
            input: `(1 <= 0) + 2`,
            expected: undefined,
          },
          {
            input: `5 - 3 + 1`,
            expected: 3,
          },
          {
            input: `5 - (3 + 1)`,
            expected: 1,
          },
          {
            input: `(5 - 3) + 1`,
            expected: 3,
          },
          {
            input: `6 - 2 * 2`,
            expected: 2,
          },
          {
            input: `6 - (2 * 2)`,
            expected: 2,
          },
          {
            input: `(6 - 2) * 2`,
            expected: 8,
          },
          {
            input: `6 / 3 * 2`,
            expected: 4,
          },
          {
            input: `(6 / 3) * 2`,
            expected: 4,
          },
          {
            input: `6 / (3 * 2)`,
            expected: 1,
          },
        ]
      )(
        'binary.priority($input)',
        ({input, expected}: {input: string, expected: ReturnType<Expression['resolve']>}) => {
          const {ok, err} = Expression.compile(input);
          expect(err).toBeUndefined();
          expect(ok?.resolve({})).toStrictEqual(expected);
        },
      );

    });
});
