describe('Application config options', () => {
  it('should disable home, search, map, and signin menu links when config explicitly disables them', () => {
    cy.initApp();

    // Provide a mocked UI config that disables home, search, map, and signin
    cy.fixture('home-api-ui-srv.json').then((fixture) => {
      const config = JSON.parse(fixture.configuration);
      if (!config.mods.home) config.mods.home = {};
      config.mods.home.enabled = false;

      if (!config.mods.search) config.mods.search = {};
      config.mods.search.enabled = false;

      if (!config.mods.map) config.mods.map = {};
      config.mods.map.enabled = false;

      if (!config.mods.authentication) config.mods.authentication = {};
      config.mods.authentication.enabled = false;

      fixture.configuration = JSON.stringify(config);

      cy.intercept('GET', '**/srv/api/ui/srv', { body: fixture }).as('apiUiConfigOverride');
    });

    cy.visitPage('');

    // Wait for translation payload and config to load
    cy.wait(['@apiUiConfigOverride', '@apiI18nGnui']);

    // Check the menu
    cy.get('app-menu').should('exist');

    // Verify our items are absent
    cy.get('app-menu').within(() => {
      // With our override, the visible menu items should be just toggle
      cy.get('[role="menuitem"]').contains('Home').should('not.exist');
      cy.get('[role="menuitem"]').contains('Search').should('not.exist');
      cy.get('[role="menuitem"]').contains('Map').should('not.exist');
      cy.get('[role="menuitem"]').contains('Sign in').should('not.exist');
    });
  });

  it('should enable home, search, map, and signin menu links when config implicitly or explicitly enables them', () => {
    cy.initApp();
    cy.visitPage('');

    cy.wait(['@apiUiConfig', '@apiI18nGnui']);
    cy.get('app-menu').should('exist');

    // Verify our items are present
    cy.get('app-menu').within(() => {
      cy.get('[role="menuitem"]').contains('Home').should('exist');
      cy.get('[role="menuitem"]').contains('Search').should('exist');
      cy.get('[role="menuitem"]').contains('Map').should('exist');
      cy.get('[role="menuitem"]').contains('Sign in').should('exist');
    });
  });
});
