declare namespace Cypress {
  interface Chainable {
    /**
     * Initialize the application with default intercepts and visit the home page.
     * Sign in to the application by returning a MeApi response
     * corresponding to the user profile.
     */
    initApp(profile?: string): Chainable<void>;

    /**
     * Clear browser cache (localStorage, sessionStorage, Cache Storage).
     */
    clearBrowserCache(): Chainable<void>;

    mockClipboard(initialText?: string): Chainable<void>;

    /**
     * Visit an application page, supporting both PathLocationStrategy and
     * HashLocationStrategy.
     * @param path The page path without leading slash (e.g. `'search'`, `'record/uuid'`).
     * @param params Optional query parameters as a key-value record.
     */
    visitPage(path: string, params?: Record<string, string>): Chainable<void>;
  }
}
