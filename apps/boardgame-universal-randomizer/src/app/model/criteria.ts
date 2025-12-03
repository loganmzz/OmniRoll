import { Result } from "./common";

export class CriteriaParsingError {
  constructor(
    public readonly index: number,
    public readonly started: boolean,
    public readonly expectedTokens: string[],
  ) {}
}

export class Criteria {
  constructor(public items: Criterion[] = []) {}

  resolve(context: Record<string, unknown>): boolean {
    return this.items.every(criterion => criterion.resolve(context));
  }
}

export type CriterionValueOutput = boolean|number|string|string[];

export abstract class CriterionValue {
  abstract resolve(context: Record<string, unknown>): CriterionValueOutput|undefined;

  static convertValue(value: unknown): CriterionValueOutput|undefined {
    switch (typeof value) {
      case 'boolean':
      case 'number':
      case 'string':
      case 'undefined':
        return value;
      case 'object':
        if (Array.isArray(value) && value.every(item => typeof item === 'string')) {
          return value;
        }
        if (value instanceof Set) {
          for (const item of value) {
            if (typeof item !== 'string') {
              return undefined;
            }
            return [...value];
          }
        }
        return undefined;
      default:
        return undefined;
    }
  }
}
export class CriterionValueLiteral extends CriterionValue {
  constructor(public value: CriterionValueOutput) {
    super();
  }

  override resolve(_context: Record<string, unknown>): CriterionValueOutput {
    return this.value;
  }
}
export class CriterionValueProperty extends CriterionValue {
  constructor(public property: string) {
    super();
  }

  override resolve(context: Record<string, unknown>): CriterionValueOutput | undefined {
    let value: unknown = undefined;
    const properties: unknown = context['properties'];
    if (properties !== null && typeof properties === 'object') {
      value = properties[this.property as keyof typeof properties];
    }
    if (value === undefined) {
      value = context[this.property];
    }
    return CriterionValue.convertValue(value);
  }
}

export abstract class CriterionOperator {
  resolve(context: Record<string, unknown>, left: CriterionValue, right: CriterionValue): boolean {
    const lvalue = left.resolve(context);
    if (lvalue === undefined) return false;
    const rvalue = right.resolve(context);
    if (rvalue === undefined) return false;
    return this.resolveValue(lvalue, rvalue);
  }
  abstract resolveValue(lvalue: CriterionValueOutput, rvalue: CriterionValueOutput): boolean
}
export class CriterionOperatorIsEqual extends CriterionOperator {
  override resolveValue(lvalue: CriterionValueOutput, rvalue: CriterionValueOutput): boolean {
    if (typeof lvalue === 'boolean' && typeof rvalue === 'boolean' && lvalue === rvalue) {
      return true;
    }
    if (typeof lvalue === 'number' && typeof rvalue === 'number' && lvalue === rvalue) {
      return true;
    }
    if (typeof lvalue === 'string' && typeof rvalue === 'string' && lvalue === rvalue) {
      return true;
    }
    if (Array.isArray(lvalue) && Array.isArray(rvalue) && new Set(lvalue).symmetricDifference(new Set(rvalue)).size === 0) {
      return true;
    }
    if (Array.isArray(lvalue) && typeof rvalue === 'string' && lvalue.includes(rvalue)) {
      return true;
    }
    if (Array.isArray(rvalue) && typeof lvalue === 'string' && rvalue.includes(lvalue)) {
      return true;
    }
    return false;
  }

  toJSON() {
    return "$eq";
  }
}
export class CriterionOperatorIsDifferent extends CriterionOperator {
  override resolveValue(lvalue: CriterionValueOutput, rvalue: CriterionValueOutput): boolean {
    return !new CriterionOperatorIsEqual().resolveValue(lvalue, rvalue);
  }

  toJSON() {
    return "$ne";
  }
}
export class CriterionOperatorIsGreater extends CriterionOperator {
  override resolveValue(lvalue: CriterionValueOutput, rvalue: CriterionValueOutput): boolean {
    if (lvalue === true && rvalue === false) {
      return true;
    }
    if (typeof lvalue === 'number' && typeof rvalue === 'number' && lvalue > rvalue) {
      return true;
    }
    if (typeof lvalue === 'string' && typeof rvalue === 'string' && lvalue.localeCompare(rvalue) > 0) {
      return true;
    }
    if (Array.isArray(lvalue) && typeof rvalue === 'string' && lvalue.includes(rvalue)) {
      return true;
    }
    if (Array.isArray(lvalue) && Array.isArray(rvalue) && new Set(lvalue).isSupersetOf(new Set(rvalue)) && lvalue.length > rvalue.length) {
      return true;
    }
    return false;
  }

  toJSON() {
    return "$gt";
  }
}
export class CriterionOperatorIsGreaterOrEqual extends CriterionOperator {
  override resolveValue(lvalue: CriterionValueOutput, rvalue: CriterionValueOutput): boolean {
    if (lvalue === true && typeof rvalue === 'boolean') {
      return true;
    }
    if (lvalue === false && rvalue === false) {
      return true;
    }
    if (typeof lvalue === 'number' && typeof rvalue === 'number' && lvalue >= rvalue) {
      return true;
    }
    if (typeof lvalue === 'string' && typeof rvalue === 'string' && lvalue.localeCompare(rvalue) >= 0) {
      return true;
    }
    if (Array.isArray(lvalue) && typeof rvalue === 'string' && lvalue.includes(rvalue)) {
      return true;
    }
    if (Array.isArray(lvalue) && Array.isArray(rvalue) && new Set(lvalue).isSupersetOf(new Set(rvalue))) {
      return true;
    }
    return false;
  }

  toJSON() {
    return "$ge";
  }
}
export class CriterionOperatorIsLesser extends CriterionOperator {
  override resolveValue(lvalue: CriterionValueOutput, rvalue: CriterionValueOutput): boolean {
    return new CriterionOperatorIsGreater().resolveValue(rvalue, lvalue);
  }

  toJSON() {
    return "$lt";
  }
}
export class CriterionOperatorIsLesserOrEqual extends CriterionOperator {
  override resolveValue(lvalue: CriterionValueOutput, rvalue: CriterionValueOutput): boolean {
    return new CriterionOperatorIsGreaterOrEqual().resolveValue(rvalue, lvalue);
  }
  toJSON() {
    return "$le";
  }
}
export class CriterionOperatorIn extends CriterionOperator {
  override resolveValue(lvalue: CriterionValueOutput, rvalue: CriterionValueOutput): boolean {
    if (typeof lvalue === 'string' && Array.isArray(rvalue) && rvalue.includes(lvalue)) {
      return true;
    }
    if (Array.isArray(lvalue) && Array.isArray(rvalue) && new Set(rvalue).isSupersetOf(new Set(lvalue))) {
      return true;
    }
    return false;
  }

  toJSON() {
    return "$in";
  }
}

export abstract class Criterion {
  constructor(public reverse: boolean) {}

  abstract resolve(context: Record<string, unknown>): boolean;
}
export class CriterionBinary extends Criterion {
  constructor(reverse: boolean, public left: CriterionValue, public operator: CriterionOperator, public right: CriterionValue) {
    super(reverse);
  }

  resolve(context: Record<string, unknown>): boolean {
    const resolved = this.operator.resolve(context, this.left, this.right);
    return this.reverse ? !resolved : resolved;
  }
}
export class CriterionUnary extends Criterion {
  constructor (reverse: boolean, public value: CriterionValue) {
    super(reverse);
  }

  override resolve(context: Record<string, unknown>): boolean {
    const value = this.value.resolve(context);
    const resolved =
      value === true ||
      typeof value === 'number' && value !== 0 ||
      typeof value === 'string' && value !== '' ||
      Array.isArray(value) && value.length > 0 ||
      false
    ;
    return this.reverse ? !resolved : resolved;
  }
}

export class CriteriaParser {
  logs = new Set<string>();

  constructor(
    public input: string,
    public index = 0) {}

  withLogs(logs: string[]): this {
    for (const log of logs) {
      this.logs.add(log);
    }
    return this;
  }
  log(scope: string, message: string): this {
    if (this.logs.has(scope)) {
      console.log(`${this}.${scope}: ${message}`);
    }
    return this;
  }

  clone(shift = 0): CriteriaParser {
    const clone = new CriteriaParser(this.input, this.index + shift);
    clone.logs = this.logs;
    return clone;
  }

  eof(): boolean {
    return this.index >= this.input.length;
  }
  lookNext(): string|undefined {
    if (this.index >= this.input.length) {
      return undefined;
    }
    return this.input.charAt(this.index);
  }
  tryRead(text: string): boolean {
    let i = 0;
    for (; i < text.length && this.index + i < this.input.length; i++) {
      if (text.charAt(i) !== this.input.charAt(this.index + i)) {
        return false;
      }
    }
    if (i === text.length) {
      this.index += text.length;
      return true;
    }
    return false;
  }

  readWhitespaces(): number {
    let read = 0;
    while (this.tryRead(' ')) {
      read++;
    }
    return read;
  }

  tryReadBoundary(): boolean {
    this.log('tryReadBoundary', `Start`);
    if (this.eof()) {
      this.log('tryReadBoundary', `EOF`);
      return true;
    }
    let boundary = false;
    loop: for (let i = this.index; i < this.input.length; i++) {
      const char = this.input.charAt(i);
      switch (char) {
        case ' ':
          boundary = true;
          this.index++;
          break;
        case ',':
        case ']':
        case '&':
          boundary = true;
          break loop;
        default:
          break loop;
      }
    }
    this.log('tryReadBoundary', `Return ${boundary}`);
    return boundary;
  }

  tryReadBoolean(): Result<boolean, CriteriaParsingError> {
    for (const {token,value} of [{token:'true', value:true}, {token:'false', value:false}]) {
      const subparser = this.clone();
      if (subparser.tryRead(token)) {
        // Check token boundary
        if (subparser.tryReadBoundary()) {
          this.index = subparser.index;
          return Result.ok(value);
        }
      }
    }
    return Result.err(new CriteriaParsingError(
      this.index,
      false,
      ['boolean'],
    ));
  }

  tryReadNumber(): Result<number, CriteriaParsingError> {
    let length: number|undefined = undefined;
    for (let i = 0; this.index + i < this.input.length; i++) {
      const char = this.input.charAt(this.index + i);
      if (char >= '0' && char <= '9') {
        length = i + 1;
      } else {
        break;
      }
    }
    if (length === undefined) {
      return Result.err(new CriteriaParsingError(
        this.index,
        false,
        ['digit'],
      ));
    }
    const next = this.clone(length);
    if (next.tryReadBoundary()) {
      const result = JSON.parse(this.input.substring(this.index, this.index + length));
      this.index = next.index;
      return Result.ok(result);
    }
    return Result.err(new CriteriaParsingError(
      next.index,
      false,
      ['boundary'],
    ));
  }

  tryReadString(): Result<string, CriteriaParsingError> {
    type ResultAction =
      {
        action: 'substring',
        start: number,
        end: number,
      } |
      {
        action: 'append',
        content: string,
      };

    const resultActions: ResultAction[] = [];
    if (this.lookNext() !== '\'') {
      return Result.err(new CriteriaParsingError(
        this.index,
        false,
        [`"'"`],
      ));
    }
    let start = this.index + 1;
    let mode: 'next'|'escaping'|'complete' = 'next';
    for (let i = start; i < this.input.length; i++) {
      const char = this.input.charAt(i);
      if (char === '\\') {
        if (mode === 'next') {
          mode = 'escaping';
        } else if (mode === 'escaping') {
          mode = 'next';
        }
      } else if (char === '"') {
        if (mode === 'next') {
          resultActions.push({ action: 'substring', start, end: i });
          resultActions.push({ action: 'append', content: '\\"' });
          start = i + 1;
        } else if (mode === 'escaping') {
          mode = 'next';
        }
      } else if (char === '\'') {
        if (mode === 'next') {
          this.log('tryReadString', `Push substring(${start}, ${i}): ${JSON.stringify(this.input.substring(start, i))}`);
          resultActions.push({ action: 'substring', start, end: i });
          start = i + 1;
          mode = 'complete';
          break;
        } else if (mode === 'escaping') {
          this.log('tryReadString', `Push substring(${start}, ${i - 1}): ${JSON.stringify(this.input.substring(start, i-1))}`);
          resultActions.push({action: 'substring', start, end: i - 1});
          start = i;
          mode = 'next';
        }
      } else {
        if (mode === 'next') {
          // Ignore
        } else if (mode === 'escaping') {
          mode = 'next';
        }
      }
    }
    if (mode !== 'complete') {
      this.log('tryReadString', `Failed not complete: ${mode}`);
      return Result.err(new CriteriaParsingError(
        start,
        true,
        [`"'"`],
      ));
    }
    const next = this.clone(start - this.index);
    if (next.tryReadBoundary()) {
      const encoded = resultActions.reduce(
        (result, action) => {
          switch (action.action) {
            case 'append':
              this.log('tryReadString', `Resolve action ${action.action}: ${JSON.stringify(action.content)}`);
              return result + action.content;
            case 'substring':
              this.log('tryReadString', `Resolve action ${action.action}: ${JSON.stringify(this.input.substring(action.start, action.end))}`);
              return result + this.input.substring(action.start, action.end);
          }
        },
        '"',
      ) + '"';
      this.log('tryReadString', `Try to parse: ${encoded}`);
      const result = JSON.parse(encoded);
      this.log('tryReadString', `Parsed: ${JSON.stringify(result)}`);
      this.index = next.index;
      return Result.ok(result);
    }
    this.log('tryReadString', `Failed not complete: ${mode}`);
    return Result.err(new CriteriaParsingError(
      next.index,
      true,
      ['boundary'],
    ));
  }

  tryReadPropertyReference(): Result<string, CriteriaParsingError> {
    if (!this.input.startsWith('@', this.index)) {
      this.log('tryReadPropertyReference', `Failed not starting with @`);
      return Result.err(new CriteriaParsingError(
        this.index,
        false,
        ['"@"'],
      ));
    }
    let length: number|undefined = undefined;
    for (let i = 1; this.index + i < this.input.length; i++) {
      const char = this.input.charAt(this.index + i);
      if (
        char >= '0' && char <= '9' ||
        char >= 'a' && char <= 'z' ||
        char >= 'A' && char <= 'Z' ||
        char === '_' ||
        char === '-' ||
        false
      ) {
          length = i;
      } else {
        break;
      }
    }
    if (length === undefined) {
      this.log('tryReadPropertyReference', `Failed empty`);
      return Result.err(new CriteriaParsingError(
        this.input.length,
        true,
        ['identifier'],
      ));
    }
    const next = this.clone(length+1);
    this.log('tryReadPropertyReference', `Next ${next}`);
    if (next.tryReadBoundary()) {
      const result = this.input.substring(this.index+1, this.index+1 + length);
      this.index = next.index;
      this.log('tryReadPropertyReference', `Return ${JSON.stringify(result)}`);
      return Result.ok(result);
    }
    this.log('tryReadPropertyReference', `Failed missing boundary`);
    return Result.err(new CriteriaParsingError(
      next.index,
      true,
      ['boundary'],
    ));
  }

  tryReadSet(): Result<string[], CriteriaParsingError> {
    const subparser = this.clone();
    if (!subparser.tryRead('[')) {
      return Result.err(new CriteriaParsingError(
        subparser.index,
        false,
        ['"["'],
      ));
    }
    const result: string[] = [];
    while (!subparser.eof()) {
      subparser.readWhitespaces();
      this.log('tryReadSet', `Skipped head whitespaces: ${subparser}`);
      if (subparser.tryRead(']')) {
        this.log('tryReadSet', `End without trailing comma`);
        this.index = subparser.index;
        return Result.ok(result);
      }
      this.log('tryReadSet', `Not closed #1: ${subparser}`);
      if (result.length > 0) {
        if (!subparser.tryRead(',')) {
          this.log('tryReadSet', `Fail on missing comma: ${subparser}`);
          return Result.err(new CriteriaParsingError(
            subparser.index,
            true,
            ['","'],
          ));
        }
        this.log('tryReadSet', `Skipped comma`);
        subparser.readWhitespaces();
        this.log('tryReadSet', `Skipped post-comma whitespaces: ${subparser}`);
        if (subparser.tryRead(']')) {
          this.log('tryReadSet', `End with trailing comma`);
          this.index = subparser.index;
          return Result.ok(result);
        }
        this.log('tryReadSet', `Not closed #2: ${subparser}`);
      }
      const item = subparser.tryReadString();
      if (item.ok === undefined) {
        this.log('tryReadSet', `Fail on missing string: ${subparser}`);
        if (item.err?.started) {
          return Result.err(item.err);
        }
        return Result.err(new CriteriaParsingError(
          subparser.index,
          true,
          ['string'],
        ));
      }
      this.log('tryReadSet', `Read string ${JSON.stringify(item)}: ${subparser}`);
      result.push(item.ok);
    }
    this.log('tryReadSet', `Fail on enclosed set: ${subparser}`);
    return Result.err(new CriteriaParsingError(
      subparser.index,
      true,
      ['"]"'],
    ));
  }

  tryReadValue(): Result<CriterionValue, CriteriaParsingError> {
    const subparser = this.clone();
    type Resolver = {
      type: 'boolean'|'number'|'string'|'set';
      resolver: () => Result<CriterionValueOutput, CriteriaParsingError>;
    };
    const literalResolvers: Resolver[] = [
      { type: 'boolean', resolver: () => subparser.tryReadBoolean() },
      { type: 'number' , resolver: () => subparser.tryReadNumber()  },
      { type: 'string' , resolver: () => subparser.tryReadString()  },
      { type: 'set'    , resolver: () => subparser.tryReadSet()     },
    ];
    let value: CriterionValue|undefined = undefined;
    for (const {type, resolver} of literalResolvers) {
      this.log('tryReadValue', `Try ${type}`);
      const literal = resolver();
      if (literal.ok !== undefined) {
        this.log('tryReadValue', `Resolve ${type}: ${literal.ok} (${subparser})`);
        value = new CriterionValueLiteral(literal.ok);
        break;
      }
      if (literal.err?.started) {
        return Result.err(literal.err);
      }
      this.log('tryReadValue', `Miss ${type}`);
    }
    if (value === undefined) {
      this.log('tryReadValue', `Try property`);
      const property = subparser.tryReadPropertyReference();
      if (property.ok !== undefined) {
        this.log('tryReadValue', `Resolve property: ${property} (${subparser})`);
        value = new CriterionValueProperty(property.ok);
      } else {
        if (property.err?.started) {
          return Result.err(property.err);
        }
        this.log('tryReadValue', `Miss property`);
        return Result.err(new CriteriaParsingError(
          subparser.index,
          false,
          ['boolean', 'number', 'string', 'set', 'property'],
        ));
      }
    }
    this.index = subparser.index;
    return Result.ok(value);
  }

  tryReadOperator(): Result<CriterionOperator, CriteriaParsingError> {
    this.log('tryReadOperator', `Start`);
    const resolvers: {tokens: string, resolver: () => CriterionOperator}[] = [
      {
        tokens: '==',
        resolver: () => new CriterionOperatorIsEqual(),
      },
      {
        tokens: '!=',
        resolver: () => new CriterionOperatorIsDifferent(),
      },
      {
        tokens: '>=',
        resolver: () => new CriterionOperatorIsGreaterOrEqual(),
      },
      {
        tokens: '>',
        resolver: () => new CriterionOperatorIsGreater(),
      },
      {
        tokens: '<=',
        resolver: () => new CriterionOperatorIsLesserOrEqual(),
      },
      {
        tokens: '<',
        resolver: () => new CriterionOperatorIsLesser(),
      },
      {
        tokens: 'in',
        resolver: () => new CriterionOperatorIn(),
      },
    ]
    for (const {tokens, resolver} of resolvers) {
      const subparser = this.clone();
      if (subparser.tryRead(tokens)) {
        if (subparser.tryReadBoundary()) {
          const operator = resolver();
          this.index = subparser.index;
          this.log('tryReadOperator', `Return ${JSON.stringify(operator)}`);
          return Result.ok(operator);
        }
      }
    }
    this.log('tryReadOperator', `Failed no token found`);
    return Result.err(new CriteriaParsingError(
      this.index,
      false,
      ['operator'],
    ));
  }

  tryReadCriterion(): Result<Criterion, CriteriaParsingError> {
    const subparser = this.clone();

    const reverse = subparser.tryRead('! ');
      this.log('tryReadCriterion', `Try read reverse (${reverse}): ${subparser}`);
    subparser.readWhitespaces();

    const left = subparser.tryReadValue();
    if (left.ok === undefined) {
      this.log('tryReadCriterion', `Failed missing first value: ${subparser}`);
      if (left.err?.started) {
        return Result.err(left.err);
      }
      return Result.err(new CriteriaParsingError(
        subparser.index,
        reverse,
        ['value'],
      ));
    }
    this.log('tryReadCriterion', `First value: ${JSON.stringify(left)}: ${subparser}`);
    subparser.readWhitespaces();
    const operator = subparser.tryReadOperator();
    if (operator.ok === undefined) {
      if (operator.err?.started) {
        return Result.err(operator.err);
      }
      if (subparser.tryReadBoundary()) {
        const criterion = new CriterionUnary(reverse, left.ok);
        this.index = subparser.index;
        this.log('tryReadCriterion', `Return unary: ${JSON.stringify(criterion)}`);
        return Result.ok(criterion);
      }
      this.log('tryReadCriterion', `Failed missing operator: ${subparser}`);
      return Result.err(new CriteriaParsingError(
        subparser.index,
        true,
        ['boundary'],
      ));
    }
    this.log('tryReadCriterion', `operator: ${JSON.stringify(operator)}: ${subparser}`);
    const right = subparser.tryReadValue();
    if (right.ok === undefined) {
      this.log('tryReadCriterion', `Failed missing second value: ${subparser}`);
      if (right.err?.started) {
        return Result.err(right.err);
      }
      return Result.err(new CriteriaParsingError(
        subparser.index,
        true,
        ['value'],
      ));
    }
    if (subparser.tryReadBoundary()) {
      const criterion = new CriterionBinary(reverse, left.ok, operator.ok, right.ok);
      this.index = subparser.index;
      this.log('tryReadCriterion', `Return binary: ${JSON.stringify(criterion)}`);
      return Result.ok(criterion);
    }
    this.log('tryReadCriterion', `Failed invalid second value: ${subparser}`);
    return Result.err(new CriteriaParsingError(
      subparser.index,
      true,
      ['end boundary'],
    ));
  }

  tryReadCriteria(): Result<Criteria, CriteriaParsingError> {
    this.log('tryReadCriteria', `Start`);
    const criteria: Criterion[] = [];
    const subparser = this.clone();
    while (!subparser.eof()) {
      subparser.readWhitespaces();
      this.log('tryReadCriteria', `Skipped head whitespaces: ${subparser}`);
      if (criteria.length > 0) {
        if (!subparser.tryRead('&& ')) {
          this.log('tryReadCriteria', `Failed missing "&&": ${subparser}`);
          return Result.err(new CriteriaParsingError(
            subparser.index,
            true,
            ['&&'],
          ));
        }
        this.log('tryReadCriteria', `Read "&& ": ${subparser}`);
        subparser.readWhitespaces();
        this.log('tryReadCriteria', `Skipped post whitespaces: ${subparser}`);
      }
      const criterion = subparser.tryReadCriterion();
      if (criterion.ok === undefined) {
        this.log('tryReadCriteria', `Failed missing criterion: ${subparser}`);
        if (criterion.err?.started) {
          return Result.err(criterion.err);
        }
        return Result.err(new CriteriaParsingError(
          subparser.index,
          criteria.length > 0,
          ['criterion'],
        ));
      }
      this.log('tryReadCriteria', `Read criterion ${JSON.stringify(criterion)}: ${subparser}`);
      criteria.push(criterion.ok);
    }
    if (criteria.length === 0) {
      this.log('tryReadCriteria', `Failed no criterion: ${subparser}`);
      return Result.err(new CriteriaParsingError(
        subparser.index,
        false,
        ['criterion'],
      ));
    }
    this.index = subparser.index;
    this.log('tryReadCriteria', `Return: ${JSON.stringify(criteria)}`);
    return Result.ok(new Criteria(criteria));
  }

  toString() {
    return `Parser(${this.input.substring(this.index)})`;
  }
}
