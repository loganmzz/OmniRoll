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
        if (!Array.isArray(value)) {
          return undefined;
        }
        if (value.every(item => typeof item === 'string')) {
          return value;
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

  override resolve(context: Record<string, unknown>): CriterionValueOutput {
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

export abstract class CriterionOperator {}
export class CriterionOperatorIsEqual extends CriterionOperator {}
export class CriterionOperatorIsDifferent extends CriterionOperator {}
export class CriterionOperatorIsGreater extends CriterionOperator {}
export class CriterionOperatorIsGreaterOrEqual extends CriterionOperator {}
export class CriterionOperatorIsLesser extends CriterionOperator {}
export class CriterionOperatorIsLesserOrEqual extends CriterionOperator {}
export class CriterionOperatorIn extends CriterionOperator {}

export abstract class Criterion {}
export class CriterionBinary extends Criterion {
  constructor(public left: CriterionValue, public operator: CriterionOperator, public right: CriterionValue) {
    super();
  }
}
export class CriterionUnary extends Criterion {
  constructor (public value: CriterionValue) {
    super();
  }
}

export class CriteriaParser {
  constructor(
    public input: string,
    public index = 0) {}

  clone(shift: number = 0): CriteriaParser {
    return new CriteriaParser(this.input, this.index + shift);
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
    if (this.eof()) {
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
          boundary = true;
          break;
        default:
          break loop;
      }
    }
    return boundary;
  }

  tryReadBoolean(): boolean|undefined {
    const subparser = this.clone();
    for (const {token,value} of [{token:'true', value:true}, {token:'false', value:false}]) {
      if (subparser.tryRead(token)) {
        // Check token boundary
        if (subparser.tryReadBoundary()) {
          this.index = subparser.index;
          return value;
        }
      }
    }
    return undefined;
  }

  tryReadNumber(): number|undefined {
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
      return undefined;
    }
    const next = this.clone(length);
    if (next.tryReadBoundary()) {
      const result = JSON.parse(this.input.substring(this.index, this.index + length));
      this.index = next.index;
      return result;
    }
    return undefined;
  }

  tryReadString(): string|undefined {
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
      return undefined;
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
          // console.log (`Push substring(${start}, ${i}): ${JSON.stringify(this.input.substring(start, i))}`);
          resultActions.push({ action: 'substring', start, end: i });
          start = i + 1;
          mode = 'complete';
          break;
        } else if (mode === 'escaping') {
          // console.debug (`Push substring(${start}, ${i - 1}): ${JSON.stringify(this.input.substring(start, i-1))}`);
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
      // console.log(`Failed not complete: ${mode}`);
      return undefined;
    }
    const next = this.clone(start - this.index);
    if (next.tryReadBoundary()) {
      const encoded = resultActions.reduce(
        (result, action) => {
          switch (action.action) {
            case 'append':
              // console.log(`Resolve action ${action.action}: ${JSON.stringify(action.content)}`);
              return result + action.content;
            case 'substring':
              // console.log(`Resolve action ${action.action}: ${JSON.stringify(this.input.substring(action.start, action.end))}`);
              return result + this.input.substring(action.start, action.end);
          }
        },
        '"',
      ) + '"';
      // console.log(`Try to parse:${encoded}`);
      const result = JSON.parse(encoded);
      this.index = next.index;
      return result;
    }
    // console.log(`Failed not complete: ${mode}`);
    return undefined;
  }

  tryReadPropertyReference(): string|undefined {
    if (!this.input.startsWith('@', this.index)) {
      // console.log(`${this}.tryReadPropertyReference: Failed not starting with @`);
      return undefined;
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
      // console.log(`${this}.tryReadPropertyReference: Failed empty`);
      return undefined;
    }
    const next = this.clone(length+1);
    // console.log(`${this}.tryReadPropertyReference: Next ${next}`);
    if (next.tryReadBoundary()) {
      const result = this.input.substring(this.index+1, this.index+1 + length);
      this.index = next.index;
      // console.log(`${this}.tryReadPropertyReference: Return ${JSON.stringify(result)}`);
      return result;
    }
      // console.log(`${this}.tryReadPropertyReference: Failed missing boundary`);
    return undefined;
  }

  tryReadSet(): string[]|undefined {
    const subparser = this.clone();
    if (!subparser.tryRead('[')) {
      return undefined;
    }
    const result: string[] = [];
    while (subparser.index < subparser.input.length) {
      subparser.readWhitespaces();
      if (subparser.tryRead(']')) {
        // console.log('End without trailing comma');
        this.index = subparser.index;
        return result;
      }
      if (result.length > 0) {
        if (!subparser.tryRead(',')) {
          // console.log(`Fail on missing comma. Next: ${subparser.lookNext()}`);
          return undefined;
        }
        subparser.readWhitespaces();
      }
      if (subparser.tryRead(']')) {
        // console.log('End with trailing comma');
        this.index = subparser.index;
        return result;
      }
      const item = subparser.tryReadString();
      if (item === undefined) {
        // console.log(`Fail on missing string. Next: ${subparser.lookNext()}`);
        return undefined;
      }
      result.push(item);
    }
    return undefined;
  }

  tryReadValue(): CriterionValue|undefined {
    const subparser = this.clone();
    type Resolver = () => CriterionValueOutput|undefined;
    const literalResolvers: Resolver[] = [
      () => subparser.tryReadBoolean(),
      () => subparser.tryReadNumber(),
      () => subparser.tryReadString(),
      () => subparser.tryReadSet(),
    ];
    let value: CriterionValue|undefined = undefined;
    for (const literalResolver of literalResolvers) {
      const literal = literalResolver();
      if (literal !== undefined) {
        value = new CriterionValueLiteral(literal);
        break;
      }
    }
    if (value === undefined) {
      const property = subparser.tryReadPropertyReference();
      if (property !== undefined) {
        value = new CriterionValueProperty(property);
      }
    }
    this.index = subparser.index;
    return value;
  }

  tryReadOperator(): CriterionOperator|undefined {
    // console.log(`${this}.tryReadOperator`);
    const subparser = this.clone();
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
      if (subparser.tryRead(tokens)) {
        if (subparser.readWhitespaces() > 0) {
          const operator = resolver();
          this.index = subparser.index;
          // console.log(`${this}.tryReadOperator: Return ${JSON.stringify(operator)}`);
          return operator;
        }
      }
    }
    // console.log(`${this}.tryReadOperator: Failed no token found`);
    return undefined;
  }

  tryReadCriterion(): Criterion|undefined {
    const subparser = this.clone();
    const left = subparser.tryReadValue();
    if (left === undefined) {
      // console.log(`${this}.tryReadCriterion > Failed missing first value`);
      return undefined;
    }
    // console.log(`${this}.tryReadCriterion > First value: ${JSON.stringify(left)}`);
    const operator = subparser.tryReadOperator();
    if (operator === undefined) {
      if (subparser.readWhitespaces() > 0 || subparser.eof()) {
        const criterion = new CriterionUnary(left);
        this.index = subparser.index;
        // console.log(`${this}.tryReadCriterion > Return unnary: ${JSON.stringify(criterion)}`);
        return criterion;
      }
      // console.log(`${this}.tryReadCriterion > Failed missing operator`);
      return undefined;
    }
    const right = subparser.tryReadValue();
    if (right === undefined) {
      // console.log(`${this}.tryReadCriterion > Failed missing second value`);
      return undefined;
    }
    if (subparser.readWhitespaces() > 0 || subparser.eof()) {
      const criterion = new CriterionBinary(left, operator, right);
      this.index = subparser.index;
        // console.log(`${this}.tryReadCriterion > Return binary: ${JSON.stringify(criterion)}`);
      return criterion;
    }
    // console.log(`${this}.tryReadCriterion > Failed invalid second value`);
    return undefined;
  }

  toString() {
    return `Parser(${this.input.substring(this.index)})`;
  }
}
