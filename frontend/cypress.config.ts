import { defineConfig } from 'cypress';

export default defineConfig({
  includeShadowDom: true,
  e2e: {
    retries: 0,
    baseUrl: 'http://0.0.0.0:4200',
    setupNodeEvents(on, config) {
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.family === 'chromium' && browser.name !== 'electron') {
          launchOptions.preferences.default['profile.managed_default_content_settings.clipboard'] =
            1;
        }
        return launchOptions;
      });
    },
  },
});
