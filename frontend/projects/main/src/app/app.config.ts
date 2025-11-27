import {
  ApplicationConfig,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HttpBackend, provideHttpClient } from '@angular/common/http';
import { APPLICATION_CONFIGURATION, TranslationsLoader } from 'gn-library';
import AppTheme from './app.theme';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { provideMarkdown } from 'ngx-markdown';
import { environment } from '../../../library/src/environments/environment';
import { Configuration, GnApiModule } from 'gn-api-client';
import { Gn4ApiModule, Configuration as Gn4Configuration } from 'gn4-api-client';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

export function TranslationsLoaderFactory(_httpBackend: HttpBackend) {
  return new TranslationsLoader(_httpBackend, [
    // Order is important. The last files can override previous ones.
    {
      prefix: `${environment.geonetworkApiUrl}/srv/api/i18n/packages/gnui`,
      suffix: '',
      useHeader: true,
    },
    { prefix: 'i18n/', suffix: '.json' },
  ]);
}

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom([
      GnApiModule.forRoot(() => {
        return new Configuration({
          basePath: environment.geonetworkApiUrl,
        });
      }),
      Gn4ApiModule.forRoot(() => {
        return new Gn4Configuration({
          basePath: environment.geonetworkApiUrl + '/srv/api',
        });
      }),
    ]),
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
        preset: definePreset(Aura, AppTheme),
        options: {
          darkModeSelector: '.no-dark-mode',
        },
      },
    }),
    provideMarkdown(),
  ],
};

registerLocaleData(localeFr);

export function getAppConfig(config: any): ApplicationConfig {
  return {
    ...appConfig,
    providers: [...appConfig.providers!, { provide: APPLICATION_CONFIGURATION, useValue: config }],
  };
}
