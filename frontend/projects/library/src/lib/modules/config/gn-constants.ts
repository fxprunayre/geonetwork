import {
  DEFAULT_BANNER_APP_CONFIGURATION,
  DEFAULT_MENU_APP_CONFIGURATION,
} from '../app-shell/config/app-shell-config';
import { DEFAULT_AUTHENTICATION_APP_CONFIGURATION } from '../authentication/config/authentication-config';
import { DEFAULT_MAP_CONTEXT } from '../data/config/map-config';
import { DEFAULT_HOME_APP_CONFIGURATION } from '../home/config/home-config';
import { DEFAULT_HEADER_APP_CONFIGURATION } from '../i18n/config/i18n-config';
import { DEFAULT_RECORD_DETAILS_APP_CONFIGURATION } from '../record';
import { DEFAULT_SEARCH_APP_CONFIGURATION } from '../search/config/search-config';
import { DEFAULT_SHARING_APP_CONFIGURATION } from '../sharing/config/sharing-config';
import { DEFAULT_USER_SELECTIONS_APP_CONFIGURATION } from '../user-selections/config/user-selections-config';
import { DEFAULT_THEME } from './default-theme';
import { AppsConfiguration } from './model/gnConfig';

export { DEFAULT_HEADER_APP_CONFIGURATION, DEFAULT_LANGUAGE } from '../i18n/config/i18n-config';

export { DEFAULT_AUTHENTICATION_APP_CONFIGURATION } from '../authentication/config/authentication-config';

export {
  DEFAULT_BANNER_APP_CONFIGURATION,
  DEFAULT_MENU_APP_CONFIGURATION,
} from '../app-shell/config/app-shell-config';

export { DEFAULT_HOME_APP_CONFIGURATION } from '../home/config/home-config';

export { DEFAULT_SHARING_APP_CONFIGURATION } from '../sharing/config/sharing-config';

export { DEFAULT_USER_SELECTIONS_APP_CONFIGURATION } from '../user-selections/config/user-selections-config';

export { DEFAULT_SPACE } from '../space/config/space-config';

export { DEFAULT_MAP_CONTEXT } from '../data/config/map-config';

export {
  DEFAULT_RECORD_DETAILS_APP_CONFIGURATION,
  DEFAULT_RECORD_DETAILS_DISTRIBUTION_CONFIGURATION,
  DEFAULT_RECORD_DOWNLOAD_PROTOCOLS,
  DEFAULT_RECORD_VIEW_PROTOCOLS,
  MAP_LAYER_DISPLAY_TARGET_EXPLORE_EMBEDDED_MAP,
  MAP_LAYER_DISPLAY_TARGET_MAIN_MAP_TAB,
  type MapLayerDisplayTarget,
} from '../record';

export {
  DEFAULT_SEARCH_APP_AGGREGATIONS,
  DEFAULT_SEARCH_APP_CONFIGURATION,
  DEFAULT_SEARCH_APP_HITS_PER_PAGE_OPTIONS,
  DEFAULT_SEARCH_APP_SORTOPTIONS,
  DEFAULT_SEARCH_LAYOUT_OPTIONS,
  INSPIRE_AGGREGATION,
  RESOURCE_TYPE_AGGREGATION,
} from '../search/config/search-config';

export {
  DEFAULT_SPATIAL_FILTER_BBOX_LAYER_STYLE,
  DEFAULT_SPATIAL_FILTER_DRAW_LAYER_STYLE,
  DEFAULT_SPATIAL_FILTER_HOVER_LAYER_STYLE,
  DEFAULT_SPATIAL_FILTER_LAYER_STYLE,
} from '../search-filter/spatial-filter/config/spatial-filter-style-config';

export { CARD_LINES_1, CARD_LINES_2 } from './theme-card-lines';

export const DEFAULT_APPS_CONFIGURATION: AppsConfiguration = {
  apps: {
    menu: DEFAULT_MENU_APP_CONFIGURATION,
    home: DEFAULT_HOME_APP_CONFIGURATION,
    i18n: DEFAULT_HEADER_APP_CONFIGURATION,
    authentication: DEFAULT_AUTHENTICATION_APP_CONFIGURATION,
    sharing: DEFAULT_SHARING_APP_CONFIGURATION,
    userSelections: DEFAULT_USER_SELECTIONS_APP_CONFIGURATION,
    search: DEFAULT_SEARCH_APP_CONFIGURATION,
    map: {
      enabled: true,
      context: DEFAULT_MAP_CONTEXT,
    },
    record: DEFAULT_RECORD_DETAILS_APP_CONFIGURATION,
    banner: DEFAULT_BANNER_APP_CONFIGURATION,
  },
  proxyUrl: '/geonetwork/proxy?url=',
  theme: DEFAULT_THEME,
};
