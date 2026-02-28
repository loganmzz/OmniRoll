import jsep from 'jsep';
import { Result } from './common';

jsep.removeLiteral('null');
jsep.removeAllBinaryOps();
[
  '||', '&&', '==', '!=', 'in', '>', '>=', '<', '<=', '+', '-', '%', '*', '/',
].forEach((op, idx) => jsep.addBinaryOp(op, idx + 1));

function asBoolean(value: unknown): boolean {
  if (value === undefined) {
    return false;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number') {
    return value !== 0;
  }
  if (typeof value === 'string') {
    return value.length > 0;
  }
  if (value instanceof Set) {
    return value.size > 0;
  }
  return false;
}

export class ExpressionError {
  constructor(public message: string) {}
  static fromError(err: unknown): ExpressionError {
    if (err instanceof ExpressionError) {
      return err;
    }
    if (err instanceof Error) {
      return new ExpressionError(err.message);
    }
    return new ExpressionError(`${err}`);
  }

  toString(): string {
    return this.message;
  }
}
export class ExpressionParseError extends ExpressionError {
  constructor(message: string) {
    super(message);
  }
  static fromErrors(message: string, errors: ExpressionParseError[]): ExpressionParseError {
    const lines = errors
      .map(e => e.message
        .split('\n')
        .map((line, index) => index === 0 ? line : `  ${line}`)
        .join('\n')
      )
      .map(e => ` - ${e}`)
      .join('\n');
    return new ExpressionParseError(`${message}:\n${lines}`);
  }
}

export type ValueType = boolean|number|string|Set<string>|undefined;

export type Context = {
  component?: unknown;
}

export class Expression {
  constructor(
    private expression: string,
    private resolver: AbstractResolver) {}

  static literal(value: ValueType): Expression {
    return new Expression(JSON.stringify(value), new LiteralResolver(value));
  }

  static compile(expression: string): Result<Expression, ExpressionError> {
    try {
      const parsed = jsep(expression);
      const resolver = AbstractResolver.from(parsed);
      if (resolver.err !== undefined) {
        return Result.err(resolver.err);
      }
      return Result.ok(new Expression(expression, resolver.expect()));
    } catch (err) {
      return Result.err(ExpressionError.fromError(err));
    }
  }

  static fromJSON(json: ExpressionLike): Expression {
    const result = Expression.compile(json);
    if (result.err !== undefined) {
      throw result.err;
    }
    return result.expect();
  }

  resolve(context: Context): unknown {
    const evaluationContext: Record<string, unknown> = {};
    if (context.component !== undefined) {
      evaluationContext['component'] = context.component;
      evaluationContext['cmp'] = context.component;
      evaluationContext['c'] = context.component;
    }
    return this.resolver.resolve(evaluationContext);
  }
  resolveAsBoolean(context: Context): boolean {
    const value = this.resolve(context);
    switch (typeof value) {
      case 'undefined':
        return false;
      case 'boolean':
        return value;
      case 'number':
        return value !== 0;
      case 'string':
        return value.length > 0;
      default:
        if (value instanceof Set) {
          return value.size > 0;
        }
        return false;
    }
  }

  toString(): string {
    return this.expression;
  }
  toJSON(): ExpressionLike {
    return this.expression;
  }
}
export type ExpressionLike = string;

export type ResolutionContext = Record<string, unknown>;

abstract class AbstractResolver {
  static from(ast: jsep.Expression): Result<AbstractResolver, ExpressionParseError> {
    switch (ast.type) {
      case 'Literal':
        return LiteralResolver.from(ast as jsep.Literal);
      case 'Identifier':
        return IdentifierResolver.fromIdentifier(ast as jsep.Identifier);
      case 'ArrayExpression':
        return ArrayExpressionResolver.from(ast as jsep.ArrayExpression);
      case 'Compound':
        return CompoundResolver.from(ast as jsep.Compound);
      case 'UnaryExpression':
        return UnaryExpressionResolver.from(ast as jsep.UnaryExpression);
      case 'BinaryExpression':
        return BinaryExpressionResolver.from(ast as jsep.BinaryExpression);
      case 'MemberExpression':
        return IdentifierResolver.fromMember(ast as jsep.MemberExpression);
      default:
        return Result.err(new ExpressionParseError(`Unsupported expression type: ${ast.type}`));
    }
  }

  abstract resolve(context: ResolutionContext): unknown;
}

class LiteralResolver extends AbstractResolver {
  constructor(private value: ValueType) {
    super();
  }
  static override from(ast: jsep.Literal): Result<LiteralResolver, ExpressionParseError> {
    if (typeof ast.value === 'boolean' || typeof ast.value === 'number' || typeof ast.value === 'string') {
      return Result.ok(new LiteralResolver(ast.value));
    }
    return Result.err(new ExpressionParseError(`Unsupported literal ${JSON.stringify(ast.raw)}`));
  }

  override resolve(): ValueType {
    return this.value;
  }
}

class IdentifierResolver extends AbstractResolver {
  constructor(private path: (string|AbstractResolver)[]) {
    super();
  }
  static fromIdentifier(ast: jsep.Identifier): Result<IdentifierResolver, ExpressionParseError> {
    return Result.ok(new IdentifierResolver([ast.name]));
  }
  static fromMember(ast: jsep.MemberExpression): Result<IdentifierResolver, ExpressionParseError> {
    const path: (string|AbstractResolver)[] = [];
    const nodes: jsep.Expression[] = [ast.property, ast.object];
    let node: jsep.Expression | undefined = undefined;

    while ((node = nodes.pop()) !== undefined) {
      let resolverResult: Result<AbstractResolver, ExpressionParseError> | undefined = undefined;
      switch (node.type) {
        case 'Identifier':
          path.push((node as jsep.Identifier).name);
          break;
        case 'MemberExpression':
          nodes.push((node as jsep.MemberExpression).property);
          nodes.push((node as jsep.MemberExpression).object);
          break;
        default:
          resolverResult = AbstractResolver.from(node);
          if (resolverResult.err !== undefined) {
            return Result.err(resolverResult.err);
          }
          path.push(resolverResult.expect());
          break;
      }
    }
    return Result.ok(new IdentifierResolver(path));
  }

  override resolve(context: ResolutionContext): ValueType {
    let value: unknown = context;
    for (const segment of this.path) {
      const resolvedSegment = typeof segment === 'string' ? segment : segment.resolve(context);
      if (resolvedSegment === undefined) {
        return undefined;
      }
      if (typeof resolvedSegment !== 'string' && typeof resolvedSegment !== 'number') {
        return undefined;
      }
      const property = Object.getOwnPropertyDescriptor(value, resolvedSegment);
      if (property === undefined) {
        return undefined;
      }
      value = property.value;
    }
    if (value === undefined || typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string') {
      return value;
    }
    if (value instanceof Set) {
      return value;
    }
    if (Array.isArray(value)) {
      return new Set(value.filter(v => typeof v === 'string'));
    }
    return undefined;
  }
}

class ArrayExpressionResolver extends AbstractResolver {
  constructor(protected elements: AbstractResolver[]) {
    super();
  }
  static override from(ast: jsep.ArrayExpression): Result<ArrayExpressionResolver, ExpressionParseError> {
    const elements: AbstractResolver[] = [];
    const errors: ExpressionParseError[] = [];
    for (let i = 0; i < ast.elements.length; i++) {
      const element = ast.elements[i];
      if (element === null) {
        errors.push(new ExpressionParseError(`Array element (index: ${i}) cannot be empty`));
        continue;
      }
      const result = AbstractResolver.from(element);
      if (result.err !== undefined) {
        errors.push(new ExpressionParseError(`Array element (index: ${i}) is invalid: ${result.err.message}`));
      } else {
        elements.push(result.expect());
      }
    }
    if (errors.length > 0) {
      return Result.err(ExpressionParseError.fromErrors('Failed to parse array expression:', errors));
    }
    return Result.ok(new ArrayExpressionResolver(elements));
  }

  override resolve(context: ResolutionContext): Set<string>|undefined {
    const result = new Set<string>();
    for (const element of this.elements) {
      const value = element.resolve(context);
      if (typeof value === 'string') {
        result.add(value);
      } else {
        return undefined;
      }
    }
    return result;
  }
}

class CompoundResolver extends AbstractResolver {
  constructor(private nodes: AbstractResolver[]) {
    super();
  }
  static override from(ast: jsep.Compound): Result<CompoundResolver, ExpressionParseError> {
    const nodes: AbstractResolver[] = [];
    const errors: ExpressionParseError[] = [];
    for (const node of ast.body) {
      const result = AbstractResolver.from(node);
      if (result.err !== undefined) {
        errors.push(result.err);
      } else {
        nodes.push(result.expect());
      }
    }
    if (errors.length > 0) {
      return Result.err(ExpressionParseError.fromErrors('Failed to parse compound expression:', errors));
    }
    return Result.ok(new CompoundResolver(nodes));
  }

  override resolve(context: ResolutionContext): unknown[] {
    return this.nodes.map(node => node.resolve(context));
  }
}

abstract class UnaryExpressionResolver extends AbstractResolver {
  constructor(protected term: AbstractResolver) {
    super();
  }
  static override from(ast: jsep.UnaryExpression): Result<UnaryExpressionResolver, ExpressionParseError> {
    const argument = AbstractResolver.from(ast.argument);
    if (argument.err !== undefined) {
      return Result.err(argument.err);
    }
    switch (ast.operator) {
      case '!':
        return Result.ok(new NotResolver(argument.expect()));
      default:
        return Result.err(new ExpressionParseError(`Unsupported unary operator: ${ast.operator}`));
    }
  }
  abstract override resolve(context: ResolutionContext): ValueType;
}

class NotResolver extends UnaryExpressionResolver {
  constructor(term: AbstractResolver) {
    super(term);
  }

  override resolve(context: ResolutionContext): boolean | undefined {
    const value = this.term.resolve(context);
    if (value === undefined) {
      return undefined;
    }
    if (
        typeof value === 'boolean' ||
        typeof value === 'number' ||
        typeof value === 'string' ||
        value instanceof Set
    ) {
      return !asBoolean(value);
    }
    return undefined;
  }
}

abstract class BinaryExpressionResolver extends AbstractResolver {

  constructor(
    protected left: AbstractResolver,
    protected right: AbstractResolver,) {
    super();
  }
  static override from(ast: jsep.BinaryExpression): Result<BinaryExpressionResolver, ExpressionParseError> {
    const left = AbstractResolver.from(ast.left);
    const right = AbstractResolver.from(ast.right);
    if (left.err !== undefined) {
      return Result.err(left.err);
    }
    if (right.err !== undefined) {
      return Result.err(right.err);
    }
    switch (ast.operator) {
      case '==':
        return Result.ok(new EqualResolver(left.expect(), right.expect()));
      case '!=':
        return Result.ok(new NotEqualResolver(left.expect(), right.expect()));
      case 'in':
        return Result.ok(new InResolver(left.expect(), right.expect()));
      case '>':
        return Result.ok(new GreaterThanResolver(left.expect(), right.expect()));
      case '>=':
        return Result.ok(new GreaterThanOrEqualResolver(left.expect(), right.expect()));
      case '<':
        return Result.ok(new LessThanResolver(left.expect(), right.expect()));
      case '<=':
        return Result.ok(new LessThanOrEqualResolver(left.expect(), right.expect()));
      case '||':
        return Result.ok(new OrResolver(left.expect(), right.expect()));
      case '&&':
        return Result.ok(new AndResolver(left.expect(), right.expect()));
      case '+':
        return Result.ok(new AddResolver(left.expect(), right.expect()));
      case '-':
        return Result.ok(new SubResolver(left.expect(), right.expect()));
      case '%':
        return Result.ok(new ModResolver(left.expect(), right.expect()));
      case '*':
        return Result.ok(new MulResolver(left.expect(), right.expect()));
      case '/':
        return Result.ok(new DivResolver(left.expect(), right.expect()));
      default:
        return Result.err(new ExpressionParseError(`Unsupported binary operator: ${ast.operator}`));
    }
  }
  abstract override resolve(context: ResolutionContext): ValueType;
}

class EqualResolver extends BinaryExpressionResolver {
  constructor(left: AbstractResolver, right: AbstractResolver) {
    super(left, right);
  }

  override resolve(context: ResolutionContext): boolean | undefined {
    const left = this.left.resolve(context);
    const right = this.right.resolve(context);
    if (left === undefined || right === undefined) {
      return undefined;
    }
    if (typeof left === 'boolean' && typeof right === 'boolean') {
      return left === right;
    }
    if (typeof left === 'number' && typeof right === 'number') {
      return left === right;
    }
    if (typeof left === 'string' && typeof right === 'string') {
      return left === right;
    }
    if (left instanceof Set && right instanceof Set) {
      return left.symmetricDifference(right).size === 0;
    }
    if (typeof left === 'string' && right instanceof Set) {
      return right.has(left);
    }
    if (left instanceof Set && typeof right === 'string') {
      return left.has(right);
    }
    return false;
  }
}

class NotEqualResolver extends BinaryExpressionResolver {
  protected equal: EqualResolver;

  constructor(left: AbstractResolver, right: AbstractResolver) {
    super(left, right);
    this.equal = new EqualResolver(left, right);
  }

  override resolve(context: ResolutionContext): boolean | undefined {
    return !this.equal.resolve(context);
  }
}

class GreaterThanResolver extends BinaryExpressionResolver {
  constructor(left: AbstractResolver, right: AbstractResolver) {
    super(left, right);
  }

  override resolve(context: ResolutionContext): boolean | undefined {
    const left = this.left.resolve(context);
    const right = this.right.resolve(context);
    if (left === undefined || right === undefined) {
      return undefined;
    }
    if (left === true && right === false) {
      return true;
    }
    if (typeof left === 'number' && typeof right === 'number') {
      return left > right;
    }
    if (typeof left === 'string' && typeof right === 'string') {
      return left > right;
    }
    if (left instanceof Set && typeof right === 'string') {
      return left.has(right);
    }
    if (left instanceof Set && right instanceof Set) {
      return left.size > right.size && right.isSubsetOf(left);
    }
    return false;
  }
}

class GreaterThanOrEqualResolver extends BinaryExpressionResolver {
  constructor(left: AbstractResolver, right: AbstractResolver) {
    super(left, right);
  }

  override resolve(context: ResolutionContext): boolean | undefined {
    const left = this.left.resolve(context);
    const right = this.right.resolve(context);
    if (left === undefined || right === undefined) {
      return undefined;
    }
    if (typeof left === 'boolean' && typeof right === 'boolean') {
      return left || right === left;
    }
    if (typeof left === 'number' && typeof right === 'number') {
      return left >= right;
    }
    if (typeof left === 'string' && typeof right === 'string') {
      return left >= right;
    }
    if (left instanceof Set && typeof right === 'string') {
      return left.has(right);
    }
    if (left instanceof Set && right instanceof Set) {
      return right.isSubsetOf(left);
    }
    return false;
  }
}

class LessThanResolver extends BinaryExpressionResolver {
  constructor(left: AbstractResolver, right: AbstractResolver) {
    super(left, right);
  }

  override resolve(context: ResolutionContext): boolean | undefined {
    const left = this.left.resolve(context);
    const right = this.right.resolve(context);
    if (left === undefined || right === undefined) {
      return undefined;
    }
    if (left === false && right === true) {
      return true;
    }
    if (typeof left === 'number' && typeof right === 'number') {
      return left < right;
    }
    if (typeof left === 'string' && typeof right === 'string') {
      return left < right;
    }
    if (typeof left === 'string' && right instanceof Set) {
      return right.has(left);
    }
    if (left instanceof Set && right instanceof Set) {
      return left.size < right.size && left.isSubsetOf(right);
    }
    return false;
  }
}

class LessThanOrEqualResolver extends BinaryExpressionResolver {
  constructor(left: AbstractResolver, right: AbstractResolver) {
    super(left, right);
  }

  override resolve(context: ResolutionContext): boolean | undefined {
    const left = this.left.resolve(context);
    const right = this.right.resolve(context);
    if (left === undefined || right === undefined) {
      return undefined;
    }
    if (typeof left === 'boolean' && typeof right === 'boolean') {
      return right || right === left;
    }
    if (typeof left === 'number' && typeof right === 'number') {
      return left <= right;
    }
    if (typeof left === 'string' && typeof right === 'string') {
      return left <= right;
    }
    if (typeof left === 'string' && right instanceof Set) {
      return right.has(left);
    }
    if (left instanceof Set && right instanceof Set) {
      return left.isSubsetOf(right);
    }
    return false;
  }
}

class InResolver extends BinaryExpressionResolver {
  constructor(left: AbstractResolver, right: AbstractResolver) {
    super(left, right);
  }

  override resolve(context: ResolutionContext): boolean | undefined {
    const left = this.left.resolve(context);
    const right = this.right.resolve(context);
    if (left === undefined || right === undefined) {
      return undefined;
    }
    if (typeof left === 'string' && right instanceof Set) {
      return right.has(left);
    }
    if (left instanceof Set && right instanceof Set) {
      return left.isSubsetOf(right);
    }
    return false;
  }
}

class OrResolver extends BinaryExpressionResolver {
  constructor(left: AbstractResolver, right: AbstractResolver) {
    super(left, right);
  }

  override resolve(context: ResolutionContext): boolean | undefined {
    const left = this.left.resolve(context);
    const right = this.right.resolve(context);
    if (left === undefined || right === undefined) {
      return undefined;
    }
    return asBoolean(left) || asBoolean(right);
  }
}

class AndResolver extends BinaryExpressionResolver {
  constructor(left: AbstractResolver, right: AbstractResolver) {
    super(left, right);
  }

  override resolve(context: ResolutionContext): boolean | undefined {
    const left = this.left.resolve(context);
    const right = this.right.resolve(context);
    if (left === undefined || right === undefined) {
      return undefined;
    }
    return asBoolean(left) && asBoolean(right);
  }
}

class AddResolver extends BinaryExpressionResolver {
  constructor(left: AbstractResolver, right: AbstractResolver) {
    super(left, right);
  }

  override resolve(context: ResolutionContext): ValueType {
    const left = this.left.resolve(context);
    const right = this.right.resolve(context);

    if (typeof left === 'boolean' && typeof right === 'boolean') {
      return left || right;
    }
    if (typeof left === 'boolean' && typeof right === 'string') {
      return left + right;
    }
    if (typeof left === 'number' && typeof right === 'number') {
      return left + right;
    }
    if (typeof left === 'number' && typeof right === 'string') {
      return left + right;
    }
    if (typeof left === 'string' && typeof right === 'boolean') {
      return left + right;
    }
    if (typeof left === 'string' && typeof right === 'number') {
      return left + right;
    }
    if (typeof left === 'string' && typeof right === 'string') {
      return left + right;
    }
    if (typeof left === 'string' && right instanceof Set) {
      return new Set([...right, left]);
    }
    if (left instanceof Set && typeof right === 'string') {
      return new Set([...left, right]);
    }
    if (left instanceof Set && right instanceof Set) {
      return new Set([...left, ...right]);
    }
    return undefined;
  }
}

class SubResolver extends BinaryExpressionResolver {
  constructor(left: AbstractResolver, right: AbstractResolver) {
    super(left, right);
  }

  override resolve(context: ResolutionContext): ValueType {
    const left = this.left.resolve(context);
    const right = this.right.resolve(context);

    if (typeof left === 'boolean' && typeof right === 'boolean') {
      return left && !right;
    }
    if (typeof left === 'number' && typeof right === 'number') {
      return left - right;
    }
    if (left instanceof Set && typeof right === 'string') {
      if (left.has(right)) {
        const newSet = new Set(left);
        newSet.delete(right);
        return newSet;
      }
      return left;
    }
    if (left instanceof Set && right instanceof Set) {
      return left.difference(right);
    }
    return undefined;
  }
}

class ModResolver extends BinaryExpressionResolver {
  constructor(left: AbstractResolver, right: AbstractResolver) {
    super(left, right);
  }

  override resolve(context: ResolutionContext): ValueType {
    const left = this.left.resolve(context);
    const right = this.right.resolve(context);

    if (left === undefined || right === undefined) {
      return undefined;
    }
    if (typeof left === 'number' && typeof right === 'number') {
      return left % right;
    }
    return undefined;
  }
}

class MulResolver extends BinaryExpressionResolver {
  constructor(left: AbstractResolver, right: AbstractResolver) {
    super(left, right);
  }

  override resolve(context: ResolutionContext): ValueType {
    const left = this.left.resolve(context);
    const right = this.right.resolve(context);

    if (left === undefined || right === undefined) {
      return undefined;
    }

    if (typeof left === 'boolean' && typeof right === 'boolean') {
      return left && right;
    }
    if (typeof left === 'number' && typeof right === 'number') {
      return left * right;
    }
    if (typeof left === 'number' && typeof right === 'string') {
      return right.repeat(left);
    }
    if (typeof left === 'string' && typeof right === 'number') {
      return left.repeat(right);
    }
    return undefined;
  }
}

class DivResolver extends BinaryExpressionResolver {
  constructor(left: AbstractResolver, right: AbstractResolver) {
    super(left, right);
  }

  override resolve(context: ResolutionContext): ValueType {
    const left = this.left.resolve(context);
    const right = this.right.resolve(context);

    if (left === undefined || right === undefined) {
      return undefined;
    }
    if (typeof left === 'number' && typeof right === 'number') {
      return left / right;
    }
    return undefined;
  }
}
