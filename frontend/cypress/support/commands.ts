Cypress.Commands.add('initApp', () => {
  cy.intercept('GET', '**/srv/api/ui/srv', { fixture: 'home-api-ui-srv.json' }).as('apiUiConfig');
  cy.intercept('GET', '**/srv/api/i18n/packages/gnui*', { fixture: 'home-api-i18n-gnui.json' }).as(
    'apiI18nGnui',
  );

  cy.fixture('home-api-search-request.json').then((homeRequestBody) => {
    cy.fixture('search-api-search-request.json').then((searchRequestBody) => {
      cy.intercept('POST', '**/search/records/_search*', (req) => {
        // Ensure body is an object to ignore JSON formatting differences (whitespace, etc.)
        const body = Cypress._.isString(req.body) ? JSON.parse(req.body) : req.body;

        // Check if the request body matches the home search fixture
        if (Cypress._.isEqual(body, homeRequestBody)) {
          req.alias = 'apiSearchRecords';
          req.reply({ fixture: 'home-api-search-response.json' });
        }
        // Check if the request body matches the search page search fixture
        else if (Cypress._.isEqual(body, searchRequestBody)) {
          req.alias = 'apiSearchPageRecords';
          req.reply({ fixture: 'search-api-search-response.json' });
        }
      }).as('apiSearchRecords');
    });
  });

  cy.visit('/');
});
