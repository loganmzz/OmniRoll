import { CriteriaParser, CriterionValueProperty, CriterionValueLiteral, CriterionOperatorIsEqual, CriterionOperatorIsDifferent, CriterionOperatorIsGreater, CriterionOperatorIsGreaterOrEqual, CriterionOperatorIn, CriterionOperatorIsLesser, CriterionOperatorIsLesserOrEqual, CriterionUnary, CriterionBinary, Criteria } from './criteria';

describe('model/criteria', () => {
  describe('Parser', () => {

    // tryReadBoundary
    test.each(
      [
        {
          input: ``,
          expected: true,
          index: 0,
        },
        {
          input: ` `,
          expected: true,
          index: 1,
        },
        {
          input: `  `,
          expected: true,
          index: 2,
        },
        {
          input: `  ,`,
          expected: true,
          index: 2,
        },
        {
          input: `  , `,
          expected: true,
          index: 2,
        },
        {
          input: `,`,
          expected: true,
          index: 0,
        },
        {
          input: `, `,
          expected: true,
          index: 0,
        },
        {
          input: `a, `,
          expected: false,
          index: 0,
        },
        {
          input: ` a, `,
          expected: true,
          index: 1,
        },
      ]
    )(
      'boundary[$#] `$input`',
      ({input, expected, index, logs}: {input: string, expected: ReturnType<CriteriaParser['tryReadBoundary']>, index: number, logs?: string[]}) => {
        const parser = new CriteriaParser(input)
          .withLogs(logs ?? []);
        expect(parser.tryReadBoundary()).toStrictEqual(expected);
        expect(parser.index).toStrictEqual(index);
      },
    );

    // tryReadBoolean
    test.each(
      [
        {
          input: ``,
          expected: undefined,
          index: 0,
        },
        {
          input: `a`,
          expected: undefined,
          index: 0,
        },
        {
          input: `0`,
          expected: undefined,
          index: 0,
        },
        {
          input: `true`,
          expected: true,
          index: 4,
        },
        {
          input: `false`,
          expected: false,
          index: 5,
        },
        {
          input: `true  ,`,
          expected: true,
          index: 6,
        },
        {
          input: `trues`,
          expected: undefined,
          index: 0,
        },
        {
          input: `true false`,
          expected: true,
          index: 5,
        },
      ]
    )(
      'boolean[$#] `$input`',
      ({input, expected, index, logs}: {input: string, expected: ReturnType<CriteriaParser['tryReadBoolean']>, index: number, logs?: string[]}) => {
        const parser = new CriteriaParser(input)
          .withLogs(logs ?? []);
        expect(parser.tryReadBoolean()).toStrictEqual(expected);
        expect(parser.index).toStrictEqual(index);
      },
    );

    // tryReadNumber
    test.each(
      [
        {
          input: ``,
          expected: undefined,
          index: 0,
        },
        {
          input: `a`,
          expected: undefined,
          index: 0,
        },
        {
          input: `true`,
          expected: undefined,
          index: 0,
        },
        {
          input: `false`,
          expected: undefined,
          index: 0,
        },
        {
          input: `0`,
          expected: 0,
          index: 1,
        },
        {
          input: `42`,
          expected: 42,
          index: 2,
        },
      ]
    )(
      'number[$#] `$input`',
      ({input, expected, index, logs}: {input: string, expected: ReturnType<CriteriaParser['tryReadNumber']>, index: number, logs?: string[]}) => {
        const parser = new CriteriaParser(input)
          .withLogs(logs ?? []);
        expect(parser.tryReadNumber()).toStrictEqual(expected);
        expect(parser.index).toStrictEqual(index);
      },
    );

    // tryReadString
    test.each(
      [
        {
          input: ``,
          expected: undefined,
          index: 0,
        },
        {
          input: `a`,
          expected: undefined,
          index: 0,
        },
        {
          input: `1`,
          expected: undefined,
          index: 0,
        },
        {
          input: `true`,
          expected: undefined,
          index: 0,
        },
        {
          input: `false`,
          expected: undefined,
          index: 0,
        },
        {
          input: `''`,
          expected: '',
          index: 2,
        },
        {
          input: `''a`,
          expected: undefined,
          index: 0,
        },
        {
          input: `''0`,
          expected: undefined,
          index: 0,
        },
        {
          input: `'a'`,
          expected: `a`,
          index: 3,
        },
        {
          input: `'"'`,
          expected: `"`,
          index: 3,
        },
        {
          input: `'\\"'`,
          expected: `"`,
          index: 4,
        },
        {
          input: `'\\''`,
          expected: `'`,
          index: 4,
        },
        {
          input: `'\\\\'`,
          expected: `\\`,
          index: 4,
        },
        {
          input: `'\\n'`,
          expected: `\n`,
          index: 4,
        },
      ]
    )(
      'string[$#] `$input`',
      ({input, expected, index, logs}: {input: string, expected: ReturnType<CriteriaParser['tryReadString']>, index: number, logs?: string[]}) => {
        const parser = new CriteriaParser(input)
          .withLogs(logs ?? []);
        expect(parser.tryReadString()).toStrictEqual(expected);
        expect(parser.index).toStrictEqual(index);
      },
    );

    // tryReadPropertyReference
    test.each(
      [
        {
          input: ``,
          expected: undefined,
          index: 0,
        },
        {
          input: `a`,
          expected: undefined,
          index: 0,
        },
        {
          input: `1`,
          expected: undefined,
          index: 0,
        },
        {
          input: `true`,
          expected: undefined,
          index: 0,
        },
        {
          input: `false`,
          expected: undefined,
          index: 0,
        },
        {
          input: `''`,
          expected: undefined,
          index: 0,
        },
        {
          input: `@`,
          expected: undefined,
          index: 0,
        },
        {
          input: `@a`,
          expected: 'a',
          index: 2,
        },
        {
          input: `@0`,
          expected: '0',
          index: 2,
        },
        {
          input: `@a-b`,
          expected: 'a-b',
          index: 4,
        },
        {
          input: `@a_b`,
          expected: 'a_b',
          index: 4,
        },
        {
          input: `@a-`,
          expected: 'a-',
          index: 3,
        },
        {
          input: `@a_`,
          expected: 'a_',
          index: 3,
        },
        {
          input: `@a `,
          expected: 'a',
          index: 3,
        },
      ]
    )(
      'property[$#] `$input`',
      ({input, expected, index, logs}: {input: string, expected: ReturnType<CriteriaParser['tryReadPropertyReference']>, index: number, logs?: string[]}) => {
        const parser = new CriteriaParser(input)
          .withLogs(logs ?? []);
        expect(parser.tryReadPropertyReference()).toStrictEqual(expected);
        expect(parser.index).toStrictEqual(index);
      },
    );

    // readWhitespaces
    test.each(
      [
        {
          input: ``,
          expected: 0,
          index: 0,
        },
        {
          input: `a`,
          expected: 0,
          index: 0,
        },
        {
          input: `1`,
          expected: 0,
          index: 0,
        },
        {
          input: `true`,
          expected: 0,
          index: 0,
        },
        {
          input: `false`,
          expected: 0,
          index: 0,
        },
        {
          input: `''`,
          expected: 0,
          index: 0,
        },
        {
          input: `@`,
          expected: 0,
          index: 0,
        },
        {
          input: `@a`,
          expected: 0,
          index: 0,
        },
        {
          input: ` `,
          expected: 1,
          index: 1,
        },
        {
          input: ` a`,
          expected: 1,
          index: 1,
        },
        {
          input: `  `,
          expected: 2,
          index: 2,
        },
      ]
    )(
      'whitespace[$#] `$input`',
      ({input, expected, index, logs}: {input: string, expected: ReturnType<CriteriaParser['readWhitespaces']>, index: number, logs?: string[]}) => {
        const parser = new CriteriaParser(input)
          .withLogs(logs ?? []);
        expect(parser.readWhitespaces()).toStrictEqual(expected);
        expect(parser.index).toStrictEqual(index);
      },
    );

    // tryReadSet
    test.each(
      [
        {
          input: ``,
          expected: undefined,
          index: 0,
        },
        {
          input: `a`,
          expected: undefined,
          index: 0,
        },
        {
          input: `1`,
          expected: undefined,
          index: 0,
        },
        {
          input: `true`,
          expected: undefined,
          index: 0,
        },
        {
          input: `false`,
          expected: undefined,
          index: 0,
        },
        {
          input: `''`,
          expected: undefined,
          index: 0,
        },
        {
          input: `@`,
          expected: undefined,
          index: 0,
        },
        {
          input: `@a`,
          expected: undefined,
          index: 0,
        },
        {
          input: `[`,
          expected: undefined,
          index: 0,
        },
        {
          input: `[]`,
          expected: [],
          index: 2,
        },
        {
          input: `[`,
          expected: undefined,
          index: 0,
        },
        {
          input: `[,`,
          expected: undefined,
          index: 0,
        },
        {
          input: `[a]`,
          expected: undefined,
          index: 0,
        },
        {
          input: `[true]`,
          expected: undefined,
          index: 0,
        },
        {
          input: `[0]`,
          expected: undefined,
          index: 0,
        },
        {
          input: `['`,
          expected: undefined,
          index: 0,
        },
        {
          input: `[''`,
          expected: undefined,
          index: 0,
        },
        {
          input: `['a'`,
          expected: undefined,
          index: 0,
        },
        {
          input: `['']`,
          expected: [''],
          index: 4,
        },
        {
          input: `['a']`,
          expected: ['a'],
          index: 5,
        },
        {
          input: `[ ' ' , ] `,
          expected: [' '],
          index: 9,
        },
        {
          input: `[ 'a' , 'b' , ]  `,
          expected: ['a','b'],
          index: 15,
        }
      ]
    )(
      'set[$#] `$input`',
      ({input, expected, index, logs}: {input: string, expected: ReturnType<CriteriaParser['tryReadSet']>, index: number, logs?: string[]}) => {
        const parser = new CriteriaParser(input)
          .withLogs(logs ?? []);
        expect(parser.tryReadSet()).toStrictEqual(expected);
        expect(parser.index).toStrictEqual(index);
      },
    );

    // tryReadExpression
    test.each(
      [
        {
          input: ``,
          expected: undefined,
          index: 0,
        },
        {
          input: `true`,
          expected: new CriterionValueLiteral(true),
          index: 4,
        },
        {
          input: `0`,
          expected: new CriterionValueLiteral(0),
          index: 1,
        },
        {
          input: `42`,
          expected: new CriterionValueLiteral(42),
          index: 2,
        },
        {
          input: `42`,
          expected: new CriterionValueLiteral(42),
          index: 2,
        },
        {
          input: `''`,
          expected: new CriterionValueLiteral(''),
          index: 2,
        },
        {
          input: `'a'`,
          expected: new CriterionValueLiteral('a'),
          index: 3,
        },
        {
          input: `[]`,
          expected: new CriterionValueLiteral([]),
          index: 2,
        },
        {
          input: `['a']`,
          expected: new CriterionValueLiteral(['a']),
          index: 5,
        },
        {
          input: `@a`,
          expected: new CriterionValueProperty('a'),
          index: 2,
        },
        {
          input: `@a `,
          expected: new CriterionValueProperty('a'),
          index: 3,
        },
      ]
    )(
      'value[$#] `$input`',
      ({input, expected, index, logs}: {input: string, expected: ReturnType<CriteriaParser['tryReadValue']>, index: number, logs?: string[]}) => {
        const parser = new CriteriaParser(input)
          .withLogs(logs ?? []);
        expect(parser.tryReadValue()).toStrictEqual(expected);
        expect(parser.index).toStrictEqual(index);
      },
    );

    // tryReadOperator
    test.each(
      [
        {
          input: ``,
          expected: undefined,
          index: 0,
        },
        {
          input: `=`,
          expected: undefined,
          index: 0,
        },
        {
          input: `= `,
          expected: undefined,
          index: 0,
        },
        {
          input: `==`,
          expected: undefined,
          index: 0,
        },
        {
          input: `== `,
          expected: new CriterionOperatorIsEqual(),
          index: 3,
        },
        {
          input: `= = `,
          expected: undefined,
          index: 0,
        },
        {
          input: `==  `,
          expected: new CriterionOperatorIsEqual(),
          index: 4,
        },
        {
          input: `!= `,
          expected: new CriterionOperatorIsDifferent(),
          index: 3,
        },
        {
          input: `> `,
          expected: new CriterionOperatorIsGreater(),
          index: 2,
        },
        {
          input: `>= `,
          expected: new CriterionOperatorIsGreaterOrEqual(),
          index: 3,
        },
        {
          input: `< `,
          expected: new CriterionOperatorIsLesser(),
          index: 2,
        },
        {
          input: `<= `,
          expected: new CriterionOperatorIsLesserOrEqual(),
          index: 3,
        },
        {
          input: `in `,
          expected: new CriterionOperatorIn(),
          index: 3,
        },
      ]
    )(
      'operator[$#] `$input`',
      ({input, expected, index, logs}: {input: string, expected: ReturnType<CriteriaParser['tryReadOperator']>, index: number, logs?: string[]}) => {
        const parser = new CriteriaParser(input)
          .withLogs(logs ?? []);
        expect(parser.tryReadOperator()).toStrictEqual(expected);
        expect(parser.index).toStrictEqual(index);
      },
    );

    // tryReadCriterion
    test.each(
      [
        {
          input: ``,
          expected: undefined,
          index: 0,
        },
        {
          input: `a`,
          expected: undefined,
          index: 0,
        },
        {
          input: `'a'`,
          expected: new CriterionUnary(
            new CriterionValueLiteral('a'),
          ),
          index: 3,
        },
        {
          input: `true`,
          expected: new CriterionUnary(
            new CriterionValueLiteral(true),
          ),
          index: 4,
        },
        {
          input: `42`,
          expected: new CriterionUnary(
            new CriterionValueLiteral(42),
          ),
          index: 2,
        },
        {
          input: `[]`,
          expected: new CriterionUnary(
            new CriterionValueLiteral([]),
          ),
          index: 2,
        },
        {
          input: `@a`,
          expected: new CriterionUnary(
            new CriterionValueProperty('a'),
          ),
          index: 2,
        },
        {
          input: `@a  `,
          expected: new CriterionUnary(
            new CriterionValueProperty('a'),
          ),
          index: 4,
        },
        {
          input: `@a==`,
          expected: undefined,
          index: 0,
        },
        {
          input: `@a ==`,
          expected: undefined,
          index: 0,
        },
        {
          input: `@a == `,
          expected: undefined,
          index: 0,
        },
        {
          input: `@a == 'a'`,
          expected: new CriterionBinary(
            new CriterionValueProperty('a'),
            new CriterionOperatorIsEqual(),
            new CriterionValueLiteral('a'),
          ),
          index: 9,
        },
        {
          input: `@a == 'a'  `,
          expected: new CriterionBinary(
            new CriterionValueProperty('a'),
            new CriterionOperatorIsEqual(),
            new CriterionValueLiteral('a'),
          ),
          index: 11,
        },
        {
          input: `@foo == 'bar'`,
          expected: new CriterionBinary(
            new CriterionValueProperty('foo'),
            new CriterionOperatorIsEqual(),
            new CriterionValueLiteral('bar'),
          ),
          index: 13,
        },
      ]
    )(
      'criterion[$#] `$input`',
      ({input, expected, index, logs}: {input: string, expected: ReturnType<CriteriaParser['tryReadCriterion']>, index: number, logs?: string[]}) => {
        const parser = new CriteriaParser(input)
          .withLogs(logs ?? []);
        expect(parser.tryReadCriterion()).toStrictEqual(expected);
        expect(parser.index).toStrictEqual(index);
      },
    );

    // tryReadCriteria
    test.each(
      [
        {
          input: ``,
          expected: undefined,
          index: 0,
        },
        {
          input: `a`,
          expected: undefined,
          index: 0,
        },
        {
          input: `true`,
          expected: new Criteria([
            new CriterionUnary(
              new CriterionValueLiteral(true),
            ),
          ]),
          index: 4,
        },
        {
          input: `42`,
          expected: new Criteria([
            new CriterionUnary(
              new CriterionValueLiteral(42),
            ),
          ]),
          index: 2,
        },
        {
          input: `42`,
          expected: new Criteria([
            new CriterionUnary(
              new CriterionValueLiteral(42),
            ),
          ]),
          index: 2,
        },
        {
          input: `'ab'`,
          expected: new Criteria([
            new CriterionUnary(
              new CriterionValueLiteral('ab'),
            ),
          ]),
          index: 4,
        },
        {
          input: `['a','b']`,
          expected: new Criteria([
            new CriterionUnary(
              new CriterionValueLiteral(['a','b']),
            ),
          ]),
          index: 9,
        },
        {
          input: `  [ 'a' , 'b' , ]  `,
          expected: new Criteria([
            new CriterionUnary(
              new CriterionValueLiteral(['a','b']),
            ),
          ]),
          index: 19,
        },
        {
          input: `@property-ref`,
          expected: new Criteria([
            new CriterionUnary(
              new CriterionValueProperty('property-ref'),
            ),
          ]),
          index: 13,
        },
        {
          input: `  @property-ref  `,
          expected: new Criteria([
            new CriterionUnary(
              new CriterionValueProperty('property-ref'),
            ),
          ]),
          index: 17,
        },
        {
          input: `@property-ref ==`,
          expected: undefined,
          index: 0,
        },
        {
          input: `@property-ref == true`,
          expected: new Criteria([
            new CriterionBinary(
              new CriterionValueProperty('property-ref'),
              new CriterionOperatorIsEqual,
              new CriterionValueLiteral(true),
            ),
          ]),
          index: 21,
        },
        {
          input: `  @property-ref  ==  true  `,
          expected: new Criteria([
            new CriterionBinary(
              new CriterionValueProperty('property-ref'),
              new CriterionOperatorIsEqual,
              new CriterionValueLiteral(true),
            ),
          ]),
          index: 27,
        },
        {
          input: `@foo && @bar`,
          expected: new Criteria([
            new CriterionUnary(
              new CriterionValueProperty('foo'),
            ),
            new CriterionUnary(
              new CriterionValueProperty('bar'),
            ),
          ]),
          index: 12,
        },
        {
          input: `@foo == 'bar' && @oof == 'rab'`,
          expected: new Criteria([
            new CriterionBinary(
              new CriterionValueProperty('foo'),
              new CriterionOperatorIsEqual,
              new CriterionValueLiteral('bar'),
            ),
            new CriterionBinary(
              new CriterionValueProperty('oof'),
              new CriterionOperatorIsEqual,
              new CriterionValueLiteral('rab'),
            ),
          ]),
          index: 30,
        },
        {
          input: `  @foo  ==  'bar'  &&  @oof  ==  'rab'`,
          expected: new Criteria([
            new CriterionBinary(
              new CriterionValueProperty('foo'),
              new CriterionOperatorIsEqual,
              new CriterionValueLiteral('bar'),
            ),
            new CriterionBinary(
              new CriterionValueProperty('oof'),
              new CriterionOperatorIsEqual,
              new CriterionValueLiteral('rab'),
            ),
          ]),
          index: 38,
        },
      ]
    )(
      'criteria[$#] `$input`',
      ({input, expected, index, logs}: {input: string, expected: ReturnType<CriteriaParser['tryReadCriteria']>, index: number, logs?: string[]}) => {
        const parser = new CriteriaParser(input)
          .withLogs(logs ?? []);
        expect(parser.tryReadCriteria()).toStrictEqual(expected);
        expect(parser.index).toStrictEqual(index);
      },
    );

  });

  describe('Value', () => {
    const context = {
      //unknown: undefined
      "root-boolean": true,
      "root-number": 0,
      "root-string": 'a',
      "root-strings": ['b', 'c'],
      "root-numbers": [1],

      "properties-boolean": false,
      "properties-number": 3,
      "properties-string": 'd',
      "properties-strings": ['e','f'],
      "properties-numbers": [4],
      "properties-invalid-set": 8,
      "properties-undefined": 9,
      "properties-null": 10,

      properties: {
        "properties-boolean": true,
        "properties-number": 5,
        "properties-string": 'g',
        "properties-strings": ['h','i'],
        "properties-numbers": [6],
        "properties-invalid-set": [7],
        "properties-undefined": undefined,
        "properties-null": null,
      }
    };

    // Criteria
    test.each(
      [
        {
          property: 'unknown',
          expected: undefined,
        },
        {
          property: 'root-boolean',
          expected: true,
        },
        {
          property: 'root-number',
          expected: 0,
        },
        {
          property: 'root-string',
          expected: 'a',
        },
        {
          property: 'root-strings',
          expected: ['b', 'c'],
        },
        {
          property: 'root-numbers',
          expected: undefined,
        },
        {
          property: 'properties-boolean',
          expected: true,
        },
        {
          property: 'properties-number',
          expected: 5,
        },
        {
          property: 'properties-string',
          expected: 'g',
        },
        {
          property: 'properties-strings',
          expected: ['h', 'i'],
        },
        {
          property: 'properties-numbers',
          expected: undefined,
        },
        {
          property: 'properties-invalid-set',
          expected: undefined,
        },
        {
          property: 'properties-undefined',
          expected: 9,
        },
        {
          property: 'properties-null',
          expected: undefined,
        },
      ]
    )(
      'property($property)',
      ({property, expected}: {property: string, expected: ReturnType<CriterionValueProperty['resolve']>}) => {
        const value = new CriterionValueProperty(property);
        expect(value.resolve(context)).toStrictEqual(expected);
      },
    );
  })
});
