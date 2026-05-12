import { InjectionToken } from '@angular/core';
import { version } from 'package.json';

export const APP_VERSION = new InjectionToken<string>(
  'app.version',
  {
    providedIn: 'root',
    factory: () => version,
  },
);
