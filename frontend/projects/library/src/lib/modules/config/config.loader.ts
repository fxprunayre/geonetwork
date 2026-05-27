import { InjectionToken, WritableSignal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { migrateGn4Config } from './config-gn4.loader';
import { migrateSextantConfig } from './config-sextant.loader';
import {
  DEFAULT_APPS_CONFIGURATION,
  DEFAULT_HEADER_APP_CONFIGURATION,
  DEFAULT_SPACE,
} from './gn-constants';
import { SEXTANT_GN4_UI_CONFIGURATION } from './gn4constants';
import { UiConfiguration } from './model/gn4config';
import { AppsConfiguration } from './model/gnConfig';

export interface ApplicationConfiguration {
  config: AppsConfiguration | undefined;
  space: string;
  catalogueUrl: string;
}

export const APPLICATION_CONFIGURATION = new InjectionToken<
  WritableSignal<ApplicationConfiguration>
>('app.config');

let appConfig: ApplicationConfiguration = {
  config: undefined,
  space: DEFAULT_SPACE,
  catalogueUrl: '/',
};

let appConfigLoading = false;

export interface LoadAppConfigOptions {
  apiUrl?: string;
  space?: string;
  language?: string;
  config?: string;
}

export function parseGn4Config(conf: any): UiConfiguration {
  return JSON.parse(conf.configuration) as UiConfiguration;
}

export function getWebComponentAttribute(name: string): string | null {
  const webComponent = document.querySelector('sextant-app');
  if (webComponent && webComponent.hasAttribute(name)) {
    return webComponent.getAttribute(name);
  }
  return null;
}

function parseInlineConfig(configValue: string): UiConfiguration | undefined {
  try {
    const parsed = JSON.parse(configValue);
    if (parsed?.configuration && typeof parsed.configuration === 'string') {
      return JSON.parse(parsed.configuration) as UiConfiguration;
    }
    return parsed as UiConfiguration;
  } catch {
    return undefined;
  }
}

function deepMerge(target: any, source: any): any {
  if (target === undefined || target === null) return source;
  if (source === undefined || source === null) return target;
  if (typeof target !== 'object' || Array.isArray(target)) return source;
  if (typeof source !== 'object' || Array.isArray(source)) return source;

  const merged = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object && !Array.isArray(source[key])) {
      merged[key] = deepMerge(target[key], source[key]);
    } else {
      merged[key] = source[key];
    }
  }
  return merged;
}

export function loadAppConfig(options: LoadAppConfigOptions = {}) {
  appConfigLoading = true;

  // Default to environment url, but allow override from web component attribute
  let apiUrl = options.apiUrl || getWebComponentAttribute('url') || environment.geonetworkApiUrl;
  const webComponentSpace = options.space || getWebComponentAttribute('space');
  const languageOverride = options.language || getWebComponentAttribute('language') || undefined;
  const configOverride = options.config || getWebComponentAttribute('config') || undefined;

  if (webComponentSpace) {
    appConfig.space = webComponentSpace;
  }

  const inlineConfig = configOverride ? parseInlineConfig(configOverride) : undefined;
  const configId = inlineConfig ? undefined : configOverride || appConfig.space;
  const configUrl = `${apiUrl}/${DEFAULT_SPACE}/api/ui/${configId}`;

  const confPromise = inlineConfig
    ? Promise.resolve(inlineConfig)
    : fetch(configUrl, {
        headers: {
          Accept: 'application/json',
        },
      })
        .then((resp) => (resp.ok ? resp.json() : undefined))
        .then((config) => {
          if (config?.configuration) {
            try {
              return JSON.parse(config.configuration) as UiConfiguration;
            } catch (e) {
              console.error(
                `Failed to parse configuration from ${configUrl}, falling back to default`,
                e,
              );
            }
          }
          return SEXTANT_GN4_UI_CONFIGURATION;
        });

  return confPromise.then((conf) => {
    // If conf contains keys config, it is a new configuration
    if ('config' in conf) {
      appConfig.config = conf.config as AppsConfiguration;
    } else {
      // Otherwise, it is a raw Gn4 UI configuration that needs to be migrated
      const migratedConfig = migrateSextantConfig(conf);
      appConfig.config = migrateGn4Config(migratedConfig);
    }

    if (inlineConfig && appConfig.config) {
      appConfig.config = deepMerge(DEFAULT_APPS_CONFIGURATION, appConfig.config);
    }

    if (appConfig.config) {
      if (languageOverride) {
        appConfig.config.apps.i18n = {
          ...(appConfig.config.apps.i18n || DEFAULT_HEADER_APP_CONFIGURATION),
          language: languageOverride,
        };
      }

      appConfig.catalogueUrl = apiUrl;

      appConfig.config.proxyUrl = `${apiUrl}/proxy?url=`;

      if (!appConfig.config.apps) {
        appConfig.config.apps = {};
      }
      if (!appConfig.config.apps.banner) {
        appConfig.config.apps.banner = { enabled: true };
      }

      appConfig.config.apps.banner!.background =
        appConfig.config.apps.banner!.background || environment.backgroundUrl || '';

      document.documentElement.style.setProperty(
        '--app-background-text-color',
        appConfig.config.apps.banner!.textColor || '#ffffff',
      );

      appConfig.config.apps.banner!.title =
        appConfig.config.apps.banner!.title ?? DEFAULT_APPS_CONFIGURATION.apps?.banner?.title;
      appConfig.config.apps.banner!.subTitle =
        appConfig.config.apps.banner!.subTitle ?? DEFAULT_APPS_CONFIGURATION.apps?.banner?.subTitle;

      if (appConfig.config.font) {
        document.documentElement.style.setProperty('--app-font-family-sans', appConfig.config.font);
      }
    } else {
      appConfig.catalogueUrl = apiUrl;
    }

    console.log('Application config:', appConfig);
    appConfigLoading = false;
    return appConfig;
  });
}
