declare namespace Cypress {
  interface Chainable {
    /**
     * Initialize the application with default intercepts and visit the home page.
     */
    initApp(): Chainable<void>;
  }
}
