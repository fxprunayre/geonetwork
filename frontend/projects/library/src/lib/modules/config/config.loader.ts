import { InjectionToken, WritableSignal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { DEFAULT_THEME } from './default-theme';
import {
  DEFAULT_APPS_CONFIGURATION,
  DEFAULT_AUTHENTICATION_APP_CONFIGURATION,
  DEFAULT_HEADER_APP_CONFIGURATION,
  DEFAULT_HOME_APP_CONFIGURATION,
  DEFAULT_LANGUAGE,
  DEFAULT_MAP_CONTEXT,
  DEFAULT_RECORD_DETAILS_APP_CONFIGURATION,
  DEFAULT_SEARCH_APP_CONFIGURATION,
  DEFAULT_SPACE,
} from './gn-constants';
import { DEFAULT_GN4_UI_CONFIGURATION, SEXTANT_GN4_UI_CONFIGURATION } from './gn4constants';
import { Recordview, Search, UiConfiguration } from './model/gn4config';
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

export function loadAppConfig() {
  appConfigLoading = true;

  // Default to environment url, but allow override from web component attribute
  let apiUrl = getWebComponentAttribute('url') || environment.geonetworkApiUrl;
  const webComponentSpace = getWebComponentAttribute('space');
  if (webComponentSpace) {
    appConfig.space = webComponentSpace;
  }
  const configUrl = `${apiUrl}/${DEFAULT_SPACE}/api/ui/${appConfig.space}`;
  return fetch(configUrl, {
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
    })
    .then((conf) => {
      appConfig.config = migrateGn4Config(conf);
      appConfig.catalogueUrl = apiUrl;
      appConfig.config.proxyUrl = `${apiUrl}/proxy?url=`;
      appConfig.config.backgroundImageUrl = environment.backgroundUrl;
      console.log(appConfig);
      appConfigLoading = false;
      return appConfig;
    });
}

export function migrateGn4Config(gn4config: UiConfiguration): AppsConfiguration {
  const conf: AppsConfiguration = {
    apps: {},
    proxyUrl: '/geonetwork/proxy?url=',
    theme: DEFAULT_THEME,
  };

  if (!gn4config || !gn4config.mods || Object.keys(gn4config.mods).length === 0) {
    return { ...DEFAULT_APPS_CONFIGURATION, ...conf };
  }

  for (const modKey of Object.keys(gn4config.mods)) {
    const module = gn4config.mods[modKey as keyof UiConfiguration['mods']];

    if (modKey === 'search') {
      const searchConfig = module as Search;
      conf.apps.search = {
        enabled: searchConfig.enabled ?? true,
        aggregations: searchConfig.facetConfig
          ? Object.entries(searchConfig.facetConfig).map(([key, value]) => ({
              [key]: value,
            }))
          : DEFAULT_SEARCH_APP_CONFIGURATION.aggregations,
        sort: searchConfig.sortbyValues
          ? searchConfig.sortbyValues.map((sortOpt) => {
              const sortField = sortOpt.sortBy === 'relevance' ? '_score' : sortOpt.sortBy;
              const sortOrder = sortOpt.sortOrder === 'desc' ? '-' : '';
              return sortOrder + sortField;
            })
          : DEFAULT_SEARCH_APP_CONFIGURATION.sort,
        currentSort:
          searchConfig.sortBy === 'relevance'
            ? '_score'
            : searchConfig.sortBy || DEFAULT_SEARCH_APP_CONFIGURATION.currentSort,
        hitsPerPageOptions:
          searchConfig.hitsperpageValues || DEFAULT_SEARCH_APP_CONFIGURATION.hitsPerPageOptions,
        resultsLayoutOptions: searchConfig.resultViewTpls
          ? searchConfig.resultViewTpls
              .map((layout) => {
                if (layout.tplUrl.indexOf('grid.html') !== -1) {
                  return 'grid';
                } else if (layout.tplUrl.indexOf('list.html') !== -1) {
                  return 'list';
                }
                return undefined;
              })
              .filter((layout) => layout !== undefined)
          : DEFAULT_SEARCH_APP_CONFIGURATION.resultsLayoutOptions,
      };
      if (searchConfig.facetTabField && searchConfig.facetConfig[searchConfig.facetTabField]) {
        conf.apps.search.topTabFilter = searchConfig.facetTabField;
        conf.apps.search.filter = searchConfig.filters;
      } else if (DEFAULT_SEARCH_APP_CONFIGURATION.topTabFilter) {
        conf.apps.search.topTabFilter = DEFAULT_SEARCH_APP_CONFIGURATION.topTabFilter;
      }
    } else if (modKey === 'header') {
      const headerConfig = module as any;
      conf.apps.i18n = {
        enabled: true,
        languages: headerConfig.languages || DEFAULT_GN4_UI_CONFIGURATION.mods.header.languages,
        language: gn4config.langDetector.default || DEFAULT_LANGUAGE,
      };
    } else if (modKey === 'recordview') {
      const recordConfig = module as Recordview;
      conf.apps.record = {
        enabled: true,
        mainThesaurus:
          recordConfig.mainThesaurus || DEFAULT_RECORD_DETAILS_APP_CONFIGURATION.mainThesaurus,
        distribution:
          recordConfig.distributionConfig || DEFAULT_RECORD_DETAILS_APP_CONFIGURATION.distribution,
      };
    } else if (modKey === 'map') {
      const mapConfig = module as any;
      conf.apps.map = {
        enabled: mapConfig.enabled ?? true,
        context: DEFAULT_MAP_CONTEXT,
      };
    } else if (modKey === 'home') {
      const homeConfig = module as any;
      conf.apps.home = {
        ...DEFAULT_HOME_APP_CONFIGURATION,
        enabled: homeConfig.enabled ?? true,
      };
    } else if (modKey === 'authentication') {
      const authConfig = module as any;
      conf.apps.authentication = {
        enabled: authConfig.enabled ?? true,
      };
    }
  }

  const hasHeader = Object.keys(gn4config.mods).includes('header');
  if (!hasHeader) {
    conf.apps.i18n = DEFAULT_HEADER_APP_CONFIGURATION;
  }
  const hasRecordDetails = Object.keys(gn4config.mods).includes('recordview');
  if (!hasRecordDetails) {
    conf.apps.record = DEFAULT_RECORD_DETAILS_APP_CONFIGURATION;
  }
  const hasHome = Object.keys(gn4config.mods).includes('home');
  if (!hasHome) {
    conf.apps.home = DEFAULT_HOME_APP_CONFIGURATION;
  }
  const hasAuthentication = Object.keys(gn4config.mods).includes('authentication');
  if (!hasAuthentication) {
    conf.apps.authentication = DEFAULT_AUTHENTICATION_APP_CONFIGURATION;
  }
  const hasMap = Object.keys(gn4config.mods).includes('map');
  if (!hasMap) {
    conf.apps.map = {
      enabled: true,
      context: DEFAULT_MAP_CONTEXT,
    };
  }

  return conf;
}
