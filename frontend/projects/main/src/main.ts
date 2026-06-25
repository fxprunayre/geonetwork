import { createCustomElement } from '@angular/elements';
import { createApplication } from '@angular/platform-browser';
import { loadAppConfig } from 'gn-library';
import { App } from './app/app';
import { getAppConfig } from './app/app.config';

loadAppConfig().then((config) => {
  //bootstrapApplication(App, getAppConfig(config)).catch((err) => console.error(err));
  createApplication(getAppConfig(config))
    .then((app) => {
      const AppElement = createCustomElement(App, { injector: app.injector });
      customElements.define('sextant-app', AppElement);
    })
    .catch((err) => console.error(err));
});
