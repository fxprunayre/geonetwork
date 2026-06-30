import { HashLocationStrategy, LocationStrategy, registerLocaleData } from '@angular/common';
import { HttpBackend, provideHttpClient } from '@angular/common/http';
import localeFr from '@angular/common/locales/fr';
import {
  ApplicationConfig,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
  signal,
} from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  provideRouter,
  withDisabledInitialNavigation,
  withInMemoryScrolling,
} from '@angular/router';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import { Configuration, GnApiModule } from 'gn-api-client';
import {
  APPLICATION_CONFIGURATION,
  ApplicationConfiguration,
  AuthenticationService,
  DEFAULT_SPACE,
  DEFAULT_THEME,
  getWebComponentAttribute,
  iso3ToIso2,
  TranslationsLoader,
  VersionAwareAuthenticationService,
} from 'gn-library';
import { Gn4ApiModule, Configuration as Gn4Configuration } from 'gn4-api-client';
import { provideMarkdown } from 'ngx-markdown';
import { MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import { environment } from '../../../library/src/environments/environment';
import { routes } from './app.routes';

// Keep GN/GN4 session cookies on API calls, especially when the web component is embedded cross-origin.
const API_WITH_CREDENTIALS = true;

export function TranslationsLoaderFactory(_httpBackend: HttpBackend) {
  const bundleFileName = environment.bundleName.endsWith('.js')
    ? environment.bundleName
    : `${environment.bundleName}.js`;
  let scriptBaseUrl = '';
  const scripts = document.getElementsByTagName('script');
  for (const script of scripts) {
    const src = script.src;
    if (src && src.includes(`/${bundleFileName}`)) {
      scriptBaseUrl = src.substring(0, src.lastIndexOf('/') + 1);
      break;
    }
  }

  const apiUrl = getWebComponentAttribute('url') || environment.geonetworkApiUrl;

  return new TranslationsLoader(_httpBackend, [
    // Order is important. The last files can override previous ones.
    {
      prefix: `${apiUrl}/${DEFAULT_SPACE}/api/i18n/packages/gnui`,
      suffix: '',
      useHeader: true,
    },
    { prefix: `${scriptBaseUrl}i18n/`, suffix: '.json' },
  ]);
}

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: AuthenticationService, useClass: VersionAwareAuthenticationService },
    importProvidersFrom([
      GnApiModule.forRoot(() => {
        const apiUrl = getWebComponentAttribute('url') || environment.geonetworkApiUrl;
        return new Configuration({
          basePath: apiUrl,
          withCredentials: API_WITH_CREDENTIALS,
        });
      }),
      Gn4ApiModule.forRoot(() => {
        const apiUrl = getWebComponentAttribute('url') || environment.geonetworkApiUrl;
        return new Gn4Configuration({
          basePath: `${apiUrl}/${DEFAULT_SPACE}/api`,
          withCredentials: API_WITH_CREDENTIALS,
        });
      }),
    ]),
    provideBrowserGlobalErrorListeners(),
    MessageService,
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      withDisabledInitialNavigation(),
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      }),
    ),
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    // { provide: LocationStrategy, useClass: InMemoryLocationStrategy },
    provideAnimationsAsync(),
    provideHttpClient(),
    provideTranslateService({
      loader: {
        provide: TranslateLoader,
        useFactory: TranslationsLoaderFactory,
        deps: [HttpBackend],
      },
      fallbackLang: 'en',
      lang: iso3ToIso2(getWebComponentAttribute('language') || 'eng'),
    }),
    provideMarkdown(),
  ],
};

registerLocaleData(localeFr);

export function getAppConfig(config: ApplicationConfiguration): ApplicationConfig {
  return {
    ...appConfig,
    providers: [
      ...appConfig.providers!,
      providePrimeNG({
        theme: {
          preset: definePreset(Aura, config?.config?.theme || DEFAULT_THEME),
          options: {
            darkModeSelector: '.no-dark-mode',
          },
        },
      }),
      { provide: APPLICATION_CONFIGURATION, useValue: signal(config) },
    ],
  };
}
