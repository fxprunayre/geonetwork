import { HashLocationStrategy, LocationStrategy, registerLocaleData } from '@angular/common';
import { HttpBackend, provideHttpClient } from '@angular/common/http';
import localeFr from '@angular/common/locales/fr';
import {
  ApplicationConfig,
  importProvidersFrom,
  Injectable,
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
  AuthenticationService,
  DEFAULT_SPACE,
  DEFAULT_THEME,
  getWebComponentAttribute,
  Gn4AuthenticationService,
  TranslationsLoader,
} from 'gn-library';
import { Gn4ApiModule, Configuration as Gn4Configuration } from 'gn4-api-client';
import { provideMarkdown } from 'ngx-markdown';
import { MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import { environment } from '../../../library/src/environments/environment';
import { routes } from './app.routes';

export function TranslationsLoaderFactory(_httpBackend: HttpBackend) {
  let scriptBaseUrl = '';
  const scripts = document.getElementsByTagName('script');
  for (let i = 0; i < scripts.length; i++) {
    const src = scripts[i].src;
    if (src && src.match(/(\/dist\/webcomponent\/browser|sextant.ifremer.fr\/.*)\/main\.js/)) {
      scriptBaseUrl = src.substring(0, src.lastIndexOf('/') + 1);
      break;
    }
  }

  let apiUrl = getWebComponentAttribute('url') || environment.geonetworkApiUrl;

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

/**
 * Custom implementation of LocationStrategy that keeps navigation in memory.
 * This prevents the Angular Web Component from interfering with the host page's URL.
 * But it will not support browser navigation buttons (back/forward).
 */
@Injectable()
export class InMemoryLocationStrategy extends LocationStrategy {
  private _path = '';
  private _baseHref = '';

  override getState(): unknown {
    return null;
  }

  override path(includeHash?: boolean): string {
    return this._path;
  }

  override prepareExternalUrl(internal: string): string {
    return this._baseHref + internal;
  }

  override pushState(state: any, title: string, url: string, queryParams: string): void {
    this._path = url + (queryParams ? '?' + queryParams : '');
  }

  override replaceState(state: any, title: string, url: string, queryParams: string): void {
    this._path = url + (queryParams ? '?' + queryParams : '');
  }

  override forward(): void {
    // No-op: no history to navigate
  }

  override back(): void {
    // No-op: no history to navigate
  }

  override onPopState(fn: (value: any) => void): void {
    // No-op: the browser back/forward buttons won't affect this strategy
  }

  override getBaseHref(): string {
    return this._baseHref;
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: AuthenticationService, useClass: Gn4AuthenticationService },
    importProvidersFrom([
      GnApiModule.forRoot(() => {
        const apiUrl = getWebComponentAttribute('url') || environment.geonetworkApiUrl;
        return new Configuration({
          basePath: apiUrl,
        });
      }),
      Gn4ApiModule.forRoot(() => {
        const apiUrl = getWebComponentAttribute('url') || environment.geonetworkApiUrl;
        return new Gn4Configuration({
          basePath: `${apiUrl}/${DEFAULT_SPACE}/api`,
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
      lang: 'en',
    }),
    provideMarkdown(),
  ],
};

registerLocaleData(localeFr);

export function getAppConfig(config: any): ApplicationConfig {
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
