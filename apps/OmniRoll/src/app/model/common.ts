export type DataLocationIndex = string | number | [number, string];

export type DataLocationPath = {name: string, index?: DataLocationIndex}[];

export class DataLocation {

  constructor(readonly path: DataLocationPath = []) {}

  child(name: string): DataLocation {
    return new DataLocation(this.path.concat([{name}]));
  }
  index(name: string, index: DataLocationIndex): DataLocation {
    return new DataLocation(this.path.concat([{name, index}]));
  }

  toString(): string {
    return this.path
      .map(({name, index}) => index !== undefined ? Array.isArray(index) ? `/${name}[${index.join(':')}]` : `/${name}[${index}]` : `/${name}`)
      .join('');
  }
}

export interface DataErrorLike {
  path: DataLocationPath;
  message: string;
}

export class DataError {
  constructor(
    public readonly location: DataLocation,
    public readonly message: string,
  ) {}

  static fromJSON(error: DataErrorLike): DataError {
    const location = new DataLocation(error.path);
    return new DataError(location, error.message);
  }

  toString(): string {
    return `${this.location}: ${this.message}`;
  }
  toJSON(): DataErrorLike {
    return {
      path: this.location.path,
      message: this.message,
    };
  }
}

export class DataErrors {
  constructor(public errors: DataError[] = []) {}

  static fromJSON(errors: DataErrorLike[]): DataErrors {
    return new DataErrors(errors.map(e => DataError.fromJSON(e)));
  }

  get length(): number {
    return this.errors.length;
  }

  addError(error: DataError): void {
    this.errors.push(error);
  }
  addErrors(errors: DataErrors): void {
    this.errors.push(...errors.errors);
  }

  toString(): string {
    return this.errors.map(e => `- ${e}`).join('\n');
  }
  toJSON(): DataErrorLike[] {
    return this.errors.map(e => e.toJSON());
  }
}

export class Result<T, E> {
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

  static ok<T, E>(ok: T): Result<T, E> {
    return new Result<T, E>(ok, undefined);
  }
  static err<T, E>(err: E, ok?: T): Result<T, E> {
    return new Result<T, E>(ok, err);
  }

  toString(): string {
    if (this.err !== undefined) {
      if (this.ok !== undefined) {
        return `Partial(${this.ok}, ${this.err})`;
      }
      return `Err(${this.err})`;
    }
    return `Ok(${this.ok})`;
  }
}

export interface Entity {
  key: string;
  name: string;
}
export function isEntity(entity: unknown): entity is Entity {
  return typeof entity === 'object' && entity !== null && 'key' in entity && 'name' in entity;
}
export function formatEntity(entity: string|Entity): string {
  if (typeof entity === 'string') {
    return JSON.stringify(entity);
  }
  if (isEntity(entity)) {
    if (entity.name) {
      return `${JSON.stringify(entity.name)}`;
    }
    return JSON.stringify(entity.key);
  }
  return JSON.stringify(entity);
}
