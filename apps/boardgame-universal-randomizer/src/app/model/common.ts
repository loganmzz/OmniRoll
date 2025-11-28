export class Result<T,E> {
  constructor(
    public readonly ok: T|undefined,
    public readonly err: E|undefined,
  ) {}

  expect(): T {
    if (this.err !== undefined) {
      throw new Error(`${this.err}`, { cause: this.err });
    }
    if (this.ok === undefined) {
      throw new Error('Invalid result state. Neither err, Neither ok are defined');
    }
    return this.ok;
  }

  static ok<T,E>(ok: T): Result<T,E> {
    return new Result<T,E>(ok, undefined);
  }
  static err<T,E>(err: E): Result<T,E> {
    return new Result<T,E>(undefined, err);
  }

  toString(): string {
    if (this.ok !== undefined) {
      return `Ok(${this.ok})`;
    }
    return `Err(${this.err})`;
  }
}
