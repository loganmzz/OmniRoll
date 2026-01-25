import * as matchers from 'jest-extended';
import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

expect.extend(matchers);

setupZoneTestEnv({
  errorOnUnknownElements: true,
  errorOnUnknownProperties: true,
});
