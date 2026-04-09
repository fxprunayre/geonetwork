describe('Navigation menu', () => {
  const MENU_ITEMS_COUNT = 6;
  const ROLE_ADMIN_MENU_ITEMS_COUNT = 3;
  const ROLE_EDITOR_MENU_ITEMS_COUNT = 2;

  beforeEach(() => {
    cy.initApp();
    cy.visit('/');

    // Wait for the app to load and alias the menu items for all tests
    cy.wait('@apiI18nGnui');
    cy.get('app-menu').should('exist');
    cy.get('app-menu [role="menuitem"]').as('menuItems');
  });

  it('should expand and collapse the menu', () => {
    cy.get('@menuItems').its('length').should('eq', MENU_ITEMS_COUNT);

    // The first item is the toggle/logo
    cy.get('@menuItems').first().as('toggleBtn');

    // Expand
    cy.get('@toggleBtn').trigger('mouseover');
    // TODO: To be improve for mobile?
    // cy.get('@toggleBtn').parent().find('img[alt="Logo"]').should('be.visible');
    // cy.get('@toggleBtn').parent().find('a[href="/"]').should('exist');

    // Collapse
    cy.get('@toggleBtn').trigger('mouseout');
    cy.get('@toggleBtn').parent().find('img[alt="Logo"]').should('not.be.visible');
  });

  it('should navigate to the Home', () => {
    cy.get('@menuItems').eq(1).click();
    cy.url().should('match', new RegExp(Cypress.config().baseUrl + '(/|/#/)$'));
  });

  it('should navigate to the Search', () => {
    cy.get('@menuItems').eq(2).click();
    cy.url().should('include', '/search');
  });

  it('should navigate to the Map', () => {
    cy.get('@menuItems').eq(3).click();
    cy.url().should('include', '/map');
  });

  // it('should open the Map in a new window', () => {
  //   cy.window().then((win) => {
  //     cy.stub(win, 'open').as('windowOpen');
  //   });

  //   cy.get('@menuItems').eq(3).click();

  //   cy.get('@windowOpen').should(
  //     'be.calledWith',
  //     'https://sextant.ifremer.fr/geonetwork/srv/fre/catalog.search#/map',
  //   );
  // });

  it('when authenticated as administrator, should add menu (add record, admin, configure, sign out)', () => {
    cy.signin();
    cy.visit('/');
    cy.get('@menuItems')
      .its('length')
      .should('eq', MENU_ITEMS_COUNT + ROLE_ADMIN_MENU_ITEMS_COUNT);
    cy.window().then((win) => {
      cy.stub(win, 'open').as('windowOpen');
    });

    cy.get('@menuItems').eq(4).as('addRecordMenu').should('contain.text', 'Add record');
    cy.get('@addRecordMenu').click();
    cy.get('@windowOpen').should(
      'be.calledWithMatch',
      /\/geonetwork\/srv\/.*\/catalog.edit#\/create/,
    );

    cy.get('@menuItems').eq(5).as('adminMenu').should('contain.text', 'Manage');
    cy.get('@adminMenu').click();
    cy.get('@windowOpen').should('be.calledWithMatch', /\/geonetwork\/srv\/.*\/admin.console/);

    cy.get('@menuItems').eq(6).should('contain.text', 'Configure');
    cy.get('@menuItems').eq(7).as('signOutMenu').should('contain.text', 'Sign out');

    cy.intercept('GET', '**/signout?redirectUrl=*', (req) => {
      req.reply('OK');
    }).as('signout');
    cy.get('@signOutMenu').click();
    cy.wait('@signout');
  });

  it('when authenticated as editor, should add menu (add record, configure, sign out)', () => {
    cy.signin('editor');
    cy.visit('/');
    cy.get('@menuItems')
      .its('length')
      .should('eq', MENU_ITEMS_COUNT + ROLE_EDITOR_MENU_ITEMS_COUNT);

    cy.get('@menuItems').eq(4).should('contain.text', 'Add record');
    cy.get('@menuItems').eq(5).should('contain.text', 'Configure');
    cy.get('@menuItems').eq(6).should('contain.text', 'Sign out');
  });
});
