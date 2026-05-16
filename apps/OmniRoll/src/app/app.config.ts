import {
  ApplicationConfig,
  ErrorHandler,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import {
  provideRouter,
  withComponentInputBinding,
  withRouterConfig,
} from '@angular/router';
import { primeNGProviders } from './app.primeng';
import { appRoutes } from './app.routes';
import { ErrorHandlerService } from './services/error/error-handler';

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(withEventReplay()),
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      appRoutes,
      withRouterConfig({
        paramsInheritanceStrategy: 'emptyOnly',
      }),
      withComponentInputBinding(),
    ),
    primeNGProviders,
    { provide: ErrorHandler, useClass: ErrorHandlerService },
  ],
};
