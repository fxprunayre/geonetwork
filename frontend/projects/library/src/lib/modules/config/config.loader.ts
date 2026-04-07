import { InjectionToken, WritableSignal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { DEFAULT_UI_CONFIGURATION, SEXTANT_UI_CONFIGURATION } from './gn4constants';
import { Recordview, Search, UiConfiguration } from './model/gn4config';
import { AppsConfiguration } from './model/gnConfig';

export interface ApplicationConfiguration {
  config: AppsConfiguration | undefined;
  space: string;
  catalogueUrl: string;
}

export const DEFAULT_SPACE = 'srv';

export const DEFAULT_LANGUAGE = 'eng';

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
      appConfig.catalogueUrl = environment.geonetworkApiUrl;
      appConfig.config.proxyUrl = environment.geonetworkApiUrl + '/proxy?url=';
      appConfig.config.backgroundImageUrl = environment.backgroundUrl;
      // TODO: parseGn4Config(conf);
      console.log(appConfig);
      appConfigLoading = false;
      return appConfig;
    });
}

export const DEFAULT_MAP_CONTEXT = {
  layers: [
    {
      type: 'xyz',
      id: 'basemap-osm',
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      visibility: true,
      opacity: 1,
      label: 'OpenStreetMap',
      attributions: '© OpenStreetMap contributors',
      extras: {
        basemap: true,
      },
    },
  ],
  view: {
    center: [-4.56243, 0],
    zoom: 1,
  },
};

export function migrateGn4Config(gn4config: UiConfiguration): AppsConfiguration {
  const conf: AppsConfiguration = { apps: {}, proxyUrl: '/geonetwork/proxy?url=' };

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
        mainThesaurus: (module as Recordview).mainThesaurus || [],
        distribution:
          (module as Recordview).distributionConfig ||
          DEFAULT_UI_CONFIGURATION.mods.recordview.distributionConfig,
      };
    } else if (modKey === 'map') {
      conf.apps.map = {
        enabled: true,
        context: DEFAULT_MAP_CONTEXT,
      };
    }
  }

  return conf;
}
