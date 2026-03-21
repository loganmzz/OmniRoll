import axios, { AxiosInstance } from 'axios';

export interface DataFetcher {
  get(path: string|URL): Promise<string>;
  relative(path: string|URL): DataFetcher;
}

export class HttpDataFetcher implements DataFetcher {
  http: AxiosInstance;

  constructor(http?: AxiosInstance) {
    this.http = http ?? axios.create({
      responseType: 'text',
    });
  }

  async get(path: string|URL = ''): Promise<string> {
    if (this.http.defaults.baseURL) {
      path = new URL(path, this.http.defaults.baseURL).toString();
    }
    try {
      const response = await this.http.get(`${path}`);
      return response.data;
    } catch (e) {
      let errorMessage = `${e}`;
      if (axios.isAxiosError(e)) {
        errorMessage = `${e.response?.statusText}:\n${e.response?.data}`;
      }
      throw new Error(
        `Failed to fetch data from ${path}: ${errorMessage}`,
        {
          cause: e,
        },
      );
    }
  }

  relative(path: string|URL): HttpDataFetcher {
    const childHttp = axios.create({
      ...this.http.defaults,
      baseURL: new URL(path, this.http.defaults.baseURL).toString(),
    });
    return new HttpDataFetcher(childHttp);
  }
}
