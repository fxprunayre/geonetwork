Cypress.Commands.add('initApp', () => {
  cy.intercept('GET', '**/srv/api/ui/srv', { fixture: 'home-api-ui-srv.json' }).as('apiUiConfig');
  cy.intercept('GET', '**/srv/api/i18n/packages/gnui*', { fixture: 'home-api-i18n-gnui.json' }).as(
    'apiI18nGnui',
  );

  const mockMap = [
    {
      req: 'home-api-search-request.json',
      res: 'home-api-search-response.json',
      alias: 'apiHomeSearch',
    },
    {
      req: 'search-api-search-request.json',
      res: 'search-api-search-response.json',
      alias: 'apiMainSearch',
    },
    {
      req: 'search-api-search-by-uuid-request.json',
      res: 'search-api-search-by-uuid-response.json',
      alias: 'apiMainSearchByUuid',
    },
    {
      req: 'search-api-search-by-uuid-sort-title-request.json',
      res: 'search-api-search-by-uuid-sort-title-response.json',
      alias: 'apiMainSearchByUuidSortTitle',
    },
    {
      req: 'search-api-search-by-q-request.json',
      res: 'search-api-search-by-q-response.json',
      alias: 'apiMainSearchByQ',
    },
    {
      req: 'search-api-autocomplete-request.json',
      res: 'search-api-autocomplete-response.json',
      alias: 'apiMainSearchAutocomplete',
    },
  ];

  const loadedMocks: any[] = [];
  cy.wrap(mockMap)
    .each((mock: any) => {
      cy.fixture(mock.req).then((body) => {
        loadedMocks.push({ ...mock, body });
      });
    })
    .then(() => {
      cy.intercept('POST', '**/search/records/_search*', (req) => {
        // Ensure body is an object to ignore JSON formatting differences (whitespace, etc.)
        const body = Cypress._.isString(req.body) ? JSON.parse(req.body) : req.body;

        const match = loadedMocks.find((m) => Cypress._.isEqual(body, m.body));

        if (match) {
          req.alias = match.alias;
          req.reply({ fixture: match.res });
        } else {
          req.alias = 'unmatchedSearchRequest';
          console.warn('No matching fixture for unmatched search request body:', body);
        }
      });
    });
});
