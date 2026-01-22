import { migrateGn4Config, UiConfiguration } from './model/gn4config';
import { InjectionToken, signal, WritableSignal } from '@angular/core';
import { DEFAULT_UI_CONFIGURATION, SEXTANT_UI_CONFIGURATION } from './gn4constants';
import { AppsConfiguration } from './model/gnConfig';
import { environment } from '../../../environments/environment';

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
      // TODO: parseGn4Config(conf);
      console.log(appConfig);
      appConfigLoading = false;
      return appConfig;
    });
}
