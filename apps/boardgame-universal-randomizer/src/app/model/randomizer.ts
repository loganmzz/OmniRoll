export type CriterionExpressionOutput = boolean|number|string|string[];

export abstract class CriterionExpression {
  abstract resolve(context: Record<string, unknown>): CriterionExpressionOutput|undefined;

  static convertValue(value: unknown): CriterionExpressionOutput|undefined {
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

  static convertString(spec: string): string {
    spec = spec.trim();
    if (!spec.startsWith('\'') || !spec.endsWith('\'')) {
      throw new Error(
        `Invalid string criterion expression: ${JSON.stringify(spec)}`,
      );
    }
    const result: string[] = [];
    let start = 1;
    let escaping = false;
    for (let i = 1; i < spec.length - 1; i++) {
      const char = spec.charAt(i);
      switch (char) {
        case '\\':
          escaping = !escaping;
          break;
        case '"':
          if (!escaping) {
            result.push(spec.substring(start, i));
            result.push('\\"');
            start = i+1;
            break;
          }
          escaping = false;
          break;
        case '\'':
          if (!escaping) {
            throw new Error(
              `Invalid string criterion expression: ${JSON.stringify(spec)}`,
            );
          }
          escaping = false;
          result.push(spec.substring(start, i-1));
          start = i;
          break;
        default:
          break;
      }
    }
    result.push(spec.substring(start, spec.length-1));
    return `"${result.join('')}"`;
  }

  /**
   * Simple parser for string set (e.g. `['a','b']).
   * Just cut string expression and call #convertString for each.
   * All spaces around are ignored (e.g. `['a','b']` is equivalent to ` [  'a'   ,     'b'      ]       `).
   *
   * @param spec string set value expression
   */
  static convertStringSet(spec: string): string {
    spec = spec.trim();
    if (!spec.startsWith('[') || !spec.endsWith(']')) {
      throw new Error(
        `Invalid string set criterion expression: ${JSON.stringify(spec)}: should be enclosed by ${JSON.stringify('[')} and ${JSON.stringify(']')}`,
      );
    }
    const items = [];
    let openedAt: number|undefined = undefined;
    let escaping = false;
    let separatorRequired = false;
    for (let i = 1; i < spec.length - 1; i++) {
      const char = spec.charAt(i);
      switch (char) {
        // If in string expression:
        //   If escaping                 => reset escaping
        //   Otherwise                   => close string expression
        // Else:
        //   If expecting separator      => error
        //   Otherwise                   => open string expression
        case '\'':
          if (openedAt !== undefined) {
            if (escaping) {
              escaping = false;
              break;
            }
            items.push(spec.substring(openedAt, i+1));
            openedAt = undefined;
            separatorRequired = true;
            break;
          }
          if (separatorRequired) {
            throw new Error(
              `Invalid string set criterion expression: ${JSON.stringify(spec)}: expected ${JSON.stringify(',')} but found ${JSON.stringify(char)}`,
            );
          }
          openedAt = i;
          break;

        // If in string expression => reset escaping
        // If not expected         => error
        // Otherwise               => reset expectation
        case ',':
          if (openedAt !== undefined) {
            escaping = false;
            break;
          }
          if (!separatorRequired) {
            throw new Error(
              `Invalid string set criterion expression: ${JSON.stringify(spec)}: expected ${JSON.stringify('\'')} but found ${JSON.stringify(char)}`,
            );
          }
          separatorRequired = false;
          break;

        // If not in string expression => error
        // Otherwise                   => reverse escaping
        case '\\':
          if (openedAt === undefined) {
            throw new Error(
              `Invalid string set criterion expression: ${JSON.stringify(spec)}: expected ${JSON.stringify('\'')} but found ${JSON.stringify(char)}`,
            );
          }
          escaping = !escaping;
          break;

        // Ignore all spaces, but reset escaping
        case ' ':
          escaping = false;
          break;

        // If not in string expression => error
        // Otherwise                   => reset escaping
        default:
          if (openedAt === undefined) {
            throw new Error(
              `Invalid string set criterion expression: ${JSON.stringify(spec)}: expected ${JSON.stringify('\'')} but found ${JSON.stringify(char)}`,
            );
          }
          escaping = false;
          break;
      }
    }
    // If last string expression isn't closed, permitting trailing comma
    if (openedAt !== undefined) {
      throw new Error(
        `Invalid string set criterion expression: ${JSON.stringify(spec)}: expected ${JSON.stringify('\'')} but found ${JSON.stringify(']')}`,
      );
    }
    return `[${items.map(this.convertString).join(',')}]`;
  }

  static parse(spec: string): CriterionExpression {
    spec = spec.trim();
    if (spec.startsWith('@')) {
      return new CriterionExpressionProperty(spec.substring(1));
    }
    // Prepare spec
    let jsonSpec = spec;
    if (spec.startsWith('\'')) {
      jsonSpec = this.convertString(spec);
    } else if (spec.startsWith('[')) {
      jsonSpec = this.convertStringSet(spec);
    }

    let value: unknown = undefined;
    try {
      value = JSON.parse(jsonSpec);
    } catch (e) {
      throw new Error(
        `Unable to parse criterion expression ${JSON.stringify(spec)}: JSON expression (${JSON.stringify(jsonSpec)}): ${e}`,
        {
          cause: e,
        },
      );
    }
    const output = this.convertValue(value);
    if (output === undefined) {
      throw new Error(
        `Invalid criterion expression, not a valid value: ${JSON.stringify(spec)}`,
      );
    }
    return new CriterionExpressionValue(output);
  }
}

export class CriterionExpressionValue extends CriterionExpression {
  constructor(public value: CriterionExpressionOutput) {
    super();
  }

  override resolve(context: Record<string, unknown>): CriterionExpressionOutput {
    return this.value;
  }
}

export class CriterionExpressionProperty extends CriterionExpression {
  constructor(public property: string) {
    super();
  }

  override resolve(context: Record<string, unknown>): CriterionExpressionOutput | undefined {
    let value: unknown = undefined;
    const properties: unknown = context['properties'];
    if (properties !== null && typeof properties === 'object') {
      value = properties[this.property as keyof typeof properties];
    }
    if (value === undefined) {
      value = context[this.property];
    }
    return CriterionExpression.convertValue(value);
  }
}
