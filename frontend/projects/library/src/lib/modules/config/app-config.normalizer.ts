import {
  DEFAULT_BANNER_APP_CONFIGURATION,
  DEFAULT_MENU_APP_CONFIGURATION,
} from '../app-shell/config/app-shell-config';
import { DEFAULT_AUTHENTICATION_APP_CONFIGURATION } from '../authentication/config/authentication-config';
import {
  DEFAULT_GEOLIBRE_MAP_CONFIGURATION,
  DEFAULT_GEOSPATIALSDK_MAP_CONFIGURATION,
  DEFAULT_MAP_TYPE,
} from '../data/config/map-config';
import { DEFAULT_HOME_APP_CONFIGURATION } from '../home/config/home-config';
import { DEFAULT_HEADER_APP_CONFIGURATION } from '../i18n/config/i18n-config';
import { DEFAULT_RECORD_DETAILS_APP_CONFIGURATION } from '../record';
import { DEFAULT_SEARCH_APP_CONFIGURATION } from '../search/config/search-config';
import { DEFAULT_SHARING_APP_CONFIGURATION } from '../sharing/config/sharing-config';
import { DEFAULT_USER_SELECTIONS_APP_CONFIGURATION } from '../user-selections/config/user-selections-config';
import { AppsConfiguration, MapApp } from './model/gnConfig';

const DEFAULT_MAP_APP_CONFIGURATION: MapApp = {
  enabled: true,
  type: DEFAULT_MAP_TYPE,
  geolibre: DEFAULT_GEOLIBRE_MAP_CONFIGURATION,
  geospatialsdk: DEFAULT_GEOSPATIALSDK_MAP_CONFIGURATION,
};

export function normalizeAppsConfiguration(config: AppsConfiguration): AppsConfiguration {
  const apps = config.apps || {};

  return {
    ...config,
    apps: {
      menu: {
        ...DEFAULT_MENU_APP_CONFIGURATION,
        ...apps.menu,
      },
      i18n: {
        ...DEFAULT_HEADER_APP_CONFIGURATION,
        ...apps.i18n,
      },
      authentication: {
        ...DEFAULT_AUTHENTICATION_APP_CONFIGURATION,
        ...apps.authentication,
      },
      sharing: {
        ...DEFAULT_SHARING_APP_CONFIGURATION,
        ...apps.sharing,
      },
      userSelections: {
        ...DEFAULT_USER_SELECTIONS_APP_CONFIGURATION,
        ...apps.userSelections,
      },
      home: {
        ...DEFAULT_HOME_APP_CONFIGURATION,
        ...apps.home,
        aggregations: apps.home?.aggregations ?? DEFAULT_HOME_APP_CONFIGURATION.aggregations,
      },
      search: {
        ...DEFAULT_SEARCH_APP_CONFIGURATION,
        ...apps.search,
        aggregations: apps.search?.aggregations ?? DEFAULT_SEARCH_APP_CONFIGURATION.aggregations,
        hitsPerPageOptions:
          apps.search?.hitsPerPageOptions ?? DEFAULT_SEARCH_APP_CONFIGURATION.hitsPerPageOptions,
      },
      record: {
        ...DEFAULT_RECORD_DETAILS_APP_CONFIGURATION,
        ...apps.record,
      },
      map: {
        ...DEFAULT_MAP_APP_CONFIGURATION,
        ...apps.map,
        type: apps.map?.type ?? DEFAULT_MAP_APP_CONFIGURATION.type,
        geospatialsdk: {
          context:
            apps.map?.geospatialsdk?.context ?? DEFAULT_GEOSPATIALSDK_MAP_CONFIGURATION.context,
        },
        geolibre: {
          ...DEFAULT_GEOLIBRE_MAP_CONFIGURATION,
          ...(apps.map?.geolibre || {}),
        },
      },
      banner: {
        ...DEFAULT_BANNER_APP_CONFIGURATION,
        ...apps.banner,
      },
    },
  };
}
