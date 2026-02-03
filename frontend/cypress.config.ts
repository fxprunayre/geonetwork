import { defineConfig } from 'cypress';

export default defineConfig({
  includeShadowDom: true,
  e2e: {
    baseUrl: 'http://0.0.0.0:4200',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
