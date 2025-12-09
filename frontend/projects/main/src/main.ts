import { createApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { getAppConfig } from './app/app.config';
import { App } from './app/app';
import { loadAppConfig } from 'gn-library';

loadAppConfig().then((config: any) => {
  //bootstrapApplication(App, getAppConfig(config)).catch((err) => console.error(err));
  createApplication(getAppConfig(config))
    .then((app) => {
      const AppElement = createCustomElement(App, { injector: app.injector });
      customElements.define('sextant-app', AppElement);
    })
    .catch((err) => console.error(err));
});
