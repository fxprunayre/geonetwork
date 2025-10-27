import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HttpBackend, provideHttpClient } from '@angular/common/http';
import { APPLICATION_CONFIGURATION } from 'gn-library';
import Sextant from './sextant';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { TranslationsLoader } from 'gn-library';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';

export function TranslationsLoaderFactory(_httpBackend: HttpBackend) {
  return new TranslationsLoader(_httpBackend, [
    // Order is important. The last files can override previous ones.
    { prefix: '/geonetwork/srv/api/i18n/packages/gnui', suffix: '', useHeader: true },
    { prefix: '/i18n/', suffix: '.json' },
  ]);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(),
    provideTranslateService({
      loader: {
        provide: TranslateLoader,
        useFactory: TranslationsLoaderFactory,
        deps: [HttpBackend],
      },
      fallbackLang: 'en',
      lang: 'en',
    }),
    providePrimeNG({
      theme: {
        preset: Sextant,
        options: { darkModeSelector: '.p-dark' },
      },
    }),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
  ],
};

registerLocaleData(localeFr);

export function getAppConfig(config: any): ApplicationConfig {
  return {
    ...appConfig,
    providers: [...appConfig.providers!, { provide: APPLICATION_CONFIGURATION, useValue: config }],
  };
}
