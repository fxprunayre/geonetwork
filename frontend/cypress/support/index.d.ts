declare namespace Cypress {
  interface Chainable {
    /**
     * Initialize the application with default intercepts and visit the home page.
     */
    initApp(): Chainable<void>;

    /**
     * Clear browser cache (localStorage, sessionStorage, Cache Storage).
     */
    clearBrowserCache(): Chainable<void>;

    mockClipboard(initialText?: string): Chainable<void>;
  }
}
