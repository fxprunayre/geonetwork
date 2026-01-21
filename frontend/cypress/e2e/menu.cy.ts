describe('Navigation menu', () => {
  beforeEach(() => {
    cy.initApp();
    cy.visit('/');

    // Wait for the app to load and alias the menu items for all tests
    cy.wait('@apiI18nGnui');
    cy.get('app-menu').should('exist');
    cy.get('app-menu [role="menuitem"]').as('menuItems');
  });

  it('should expand and collapse the menu', () => {
    cy.get('@menuItems').its('length').should('eq', 6);

    // The first item is the toggle/logo
    cy.get('@menuItems').first().as('toggleBtn');

    // Expand
    cy.get('@toggleBtn').trigger('mouseover');
    // FIXME cy.get('@toggleBtn').parent().find('img[alt="Logo"]').should('be.visible');
    cy.get('@toggleBtn').parent().find('a[href="/"]').should('exist');

    // Collapse
    cy.get('@toggleBtn').trigger('mouseout');
    cy.get('@toggleBtn').parent().find('img[alt="Logo"]').should('not.be.visible');
  });

  it('should navigate to Home', () => {
    cy.get('@menuItems').eq(1).click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });

  it('should navigate to Search', () => {
    cy.get('@menuItems').eq(2).click();
    cy.url().should('include', '/search');
  });

  it('should open the Map in a new window', () => {
    cy.window().then((win) => {
      cy.stub(win, 'open').as('windowOpen');
    });

    cy.get('@menuItems').eq(3).click();

    cy.get('@windowOpen').should(
      'be.calledWith',
      'https://sextant.ifremer.fr/geonetwork/srv/fre/catalog.search#/map',
    );
  });

  // TODO: signin
  // TODO: configure
});
