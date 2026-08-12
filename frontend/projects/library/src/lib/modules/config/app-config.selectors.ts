import {
  DEFAULT_BANNER_APP_CONFIGURATION,
  DEFAULT_MENU_APP_CONFIGURATION,
} from '../app-shell/config/app-shell-config';
import {
  DEFAULT_GEOLIBRE_MAP_CONFIGURATION,
  DEFAULT_GEOSPATIALSDK_MAP_CONFIGURATION,
  DEFAULT_MAP_TYPE,
} from '../data/config/map-config';
import { DEFAULT_HEADER_APP_CONFIGURATION } from '../i18n/config/i18n-config';
import { DEFAULT_RECORD_DETAILS_APP_CONFIGURATION } from '../record';
import { DEFAULT_SEARCH_APP_CONFIGURATION } from '../search/config/search-config';
import { DEFAULT_SHARING_APP_CONFIGURATION } from '../sharing/config/sharing-config';
import { DEFAULT_USER_SELECTIONS_APP_CONFIGURATION } from '../user-selections/config/user-selections-config';
import { ApplicationConfiguration } from './config.loader';
import {
  Apps,
  BannerApp,
  I18nApp,
  MapApp,
  Menu,
  RecordDetailsApp,
  SearchApp,
  SharingApp,
  UserSelectionsApp,
} from './model/gnConfig';

export function selectApps(appConfig: ApplicationConfiguration): Apps | undefined {
  return appConfig.config?.apps;
}

export function selectMenuAppConfiguration(appConfig: ApplicationConfiguration): Menu {
  return appConfig.config?.apps?.menu ?? DEFAULT_MENU_APP_CONFIGURATION;
}

export function selectBannerAppConfiguration(appConfig: ApplicationConfiguration): BannerApp {
  return appConfig.config?.apps?.banner ?? DEFAULT_BANNER_APP_CONFIGURATION;
}

export function selectI18nAppConfiguration(appConfig: ApplicationConfiguration): I18nApp {
  return appConfig.config?.apps?.i18n ?? DEFAULT_HEADER_APP_CONFIGURATION;
}

export function selectSharingAppConfiguration(appConfig: ApplicationConfiguration): SharingApp {
  return appConfig.config?.apps?.sharing ?? DEFAULT_SHARING_APP_CONFIGURATION;
}

export function selectUserSelectionsAppConfiguration(
  appConfig: ApplicationConfiguration,
): UserSelectionsApp {
  return appConfig.config?.apps?.userSelections ?? DEFAULT_USER_SELECTIONS_APP_CONFIGURATION;
}

export function selectSearchAppConfiguration(appConfig: ApplicationConfiguration): SearchApp {
  return appConfig.config?.apps?.search ?? DEFAULT_SEARCH_APP_CONFIGURATION;
}

export function selectRecordAppConfiguration(
  appConfig: ApplicationConfiguration,
): RecordDetailsApp {
  return appConfig.config?.apps?.record ?? DEFAULT_RECORD_DETAILS_APP_CONFIGURATION;
}

export function selectMapAppConfiguration(appConfig: ApplicationConfiguration): MapApp {
  return (
    appConfig.config?.apps?.map ?? {
      enabled: true,
      type: DEFAULT_MAP_TYPE,
      geolibre: DEFAULT_GEOLIBRE_MAP_CONFIGURATION,
      geospatialsdk: DEFAULT_GEOSPATIALSDK_MAP_CONFIGURATION,
    }
  );
}
