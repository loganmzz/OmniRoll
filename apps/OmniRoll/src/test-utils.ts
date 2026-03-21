import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DataFetcher } from '@project/services/data-fetch/data-fetch';

export const BASEDIR = path.resolve(__dirname, '..');
export const GAME_DATA_DIR = path.join(BASEDIR, 'public', 'data', 'games');

export class FileDataFetcher implements DataFetcher {
  constructor(public base: URL) {
    if (base.protocol !== 'file:') {
      throw new Error(`FileDataFetcher base must be a file URL, got ${base}`);
    }
  }

  resolve(path: string|URL): URL {
    const fullpath = new URL(path, this.base);
    if (fullpath?.protocol !== 'file:') {
      throw new Error(`FileDataFetcher can only fetch file URLs (self: ${JSON.stringify(this)} / path: ${JSON.stringify(path)} / resolved: ${JSON.stringify(fullpath)})`);
    }
    return fullpath;
  }

  get(path: string|URL): Promise<string> {
    return readFile(fileURLToPath(this.resolve(path)), 'utf-8');
  }

  relative(path: string|URL): FileDataFetcher {
    return new FileDataFetcher(this.resolve(path));
  }

  toJSON(): unknown {
    return {
      baseURL: this.base.toString(),
    }
  }
  toString(): string {
    return `FileDataFetcher(${JSON.stringify(this)})`;
  }
}
