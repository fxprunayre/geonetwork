import { Recordview, Search, UiConfiguration } from './model/gn4config';
import { InjectionToken } from '@angular/core';
import { DEFAULT_UI_CONFIGURATION, SEXTANT_UI_CONFIGURATION } from './gn4constants';
import { AppsConfiguration } from './model/gnConfig';
import { environment } from '../../../environments/environment';

export interface ApplicationConfiguration {
  config: AppsConfiguration | undefined;
  space: string;
}

export const DEFAULT_SPACE = 'srv';

export const DEFAULT_LANGUAGE = 'eng';

export const APPLICATION_CONFIGURATION = new InjectionToken<ApplicationConfiguration>('app.config');

let appConfig: ApplicationConfiguration = {
  config: undefined,
  space: DEFAULT_SPACE,
};

let appConfigLoading = false;

export function parseGn4Config(conf: any): UiConfiguration {
  return JSON.parse(conf.configuration) as UiConfiguration;
}

export function migrateGn4Config(gn4config: UiConfiguration): AppsConfiguration {
  const conf: AppsConfiguration = { apps: {} };

  for (const modKey of Object.keys(gn4config.mods)) {
    const module = gn4config.mods[modKey as keyof UiConfiguration['mods']];

    if (modKey === 'search') {
      conf.apps.search = {
        enabled: true,
        aggregations: Object.entries((module as Search).facetConfig).map(([key, value]) => ({
          [key]: value,
        })),
        sort: (module as Search).sortbyValues.map((sortOpt) => {
          const sortField = sortOpt.sortBy === 'relevance' ? '_score' : sortOpt.sortBy;
          const sortOrder = sortOpt.sortOrder === 'desc' ? '-' : '';
          return sortOrder + sortField;
        }),
        currentSort:
          (module as Search).sortBy === 'relevance' ? '_score' : (module as Search).sortBy,
        hitsPerPageOptions: (module as Search).hitsperpageValues,
        resultsLayoutOptions: (module as Search).resultViewTpls
          .map((layout) => {
            if (layout.tplUrl.indexOf('grid.html') !== -1) {
              return 'grid';
            } else if (layout.tplUrl.indexOf('list.html') !== -1) {
              return 'list';
            }
            return undefined;
          })
          .filter((layout) => layout !== undefined),
      };
      if (
        (module as Search).facetTabField &&
        (module as Search).facetConfig[(module as Search).facetTabField]
      ) {
        conf.apps.search.topTabFilter = (module as Search).facetTabField;
        conf.apps.search.filter = (module as Search).filters;
      }
    } else if (modKey === 'header') {
      conf.apps.i18n = {
        enabled: true,
        languages: (module as any).languages || DEFAULT_UI_CONFIGURATION.mods.header.languages,
        language: gn4config.langDetector.default || DEFAULT_LANGUAGE,
      };
    } else if (modKey === 'recordview') {
      conf.apps.record = {
        enabled: true,
        distribution:
          (module as Recordview).distributionConfig ||
          DEFAULT_UI_CONFIGURATION.mods.recordview.distributionConfig,
      };
    }
  }

  return conf;
}

export function loadAppConfig() {
  appConfigLoading = true;
  return fetch(`${environment.geonetworkApiUrl}/srv/api/ui/${appConfig.space}`, {
    headers: {
      Accept: 'application/json',
    },
  })
    .then((resp) => {
      if (!resp.ok) {
        //throw new Error('Configuration file could not be loaded')
        return SEXTANT_UI_CONFIGURATION;
      }
      return resp.json();
    })
    .then((conf) => {
      appConfig.config = migrateGn4Config(SEXTANT_UI_CONFIGURATION);
      // TODO: parseGn4Config(conf);
      console.log(appConfig);
      appConfigLoading = false;
      return appConfig;
    });
}
