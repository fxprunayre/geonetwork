Cypress.Commands.add('clearBrowserCache', () => {
  cy.window().then(async (window) => {
    window.sessionStorage.clear();
    window.localStorage.clear();
    if ('caches' in window) {
      const keys = await window.caches.keys();
      await Promise.all(keys.map((key) => window.caches.delete(key)));
    }
  });
});

Cypress.Commands.add('mockClipboard', (initialText = '') => {
  cy.window().then((win) => {
    let clipboardText = initialText;

    if (!win.navigator.clipboard) {
      Object.defineProperty(win.navigator, 'clipboard', {
        value: {
          readText: () => Promise.resolve(''),
          writeText: () => Promise.resolve(),
        },
        writable: true,
        enumerable: true,
        configurable: true,
      });
    }

    cy.stub(win.navigator.clipboard, 'readText').callsFake(() => {
      return Promise.resolve(clipboardText);
    });

    cy.stub(win.navigator.clipboard, 'writeText').callsFake((text) => {
      clipboardText = text;
      return Promise.resolve();
    });
  });
});

Cypress.Commands.add('initApp', () => {
  cy.intercept('GET', 'https://tile.openstreetmap.org/**', { fixture: 'tile.png' }).as('osmTile');
  cy.intercept('GET', '**/srv/api/ui/srv', { fixture: 'home-api-ui-srv.json' }).as('apiUiConfig');
  cy.intercept('GET', '**/srv/api/i18n/packages/gnui*', { fixture: 'home-api-i18n-gnui.json' }).as(
    'apiI18nGnui',
  );
  cy.intercept('POST', '**/srv/api/registries/vocabularies/keyword?id=**', { body: {} }).as(
    'apiKeywordById',
  );
  cy.intercept('GET', '**/viewer/sxt-viewer.js').as('apiMapViewerScript');
  cy.intercept(
    'GET',
    '**/srv/api/records/cf5048f6-5bbf-4e44-ba74-e6f429af51ea/formatters/citation?output=json&approved=true&format=%3F',
    { fixture: 'record-api-citation-formats.json' },
  ).as('apiCitationFormats');
  cy.intercept(
    'GET',
    '**/srv/api/records/cf5048f6-5bbf-4e44-ba74-e6f429af51ea/formatters/citation?output=txt&approved=true&format=text',
    { fixture: 'record-api-citation-format.txt' },
  ).as('apiCitationFormatTxt');
  cy.intercept(
    'GET',
    '**/srv/api/records/cf5048f6-5bbf-4e44-ba74-e6f429af51ea/formatters/citation?output=html&approved=true',
    { fixture: 'record-api-citation-format.html' },
  ).as('apiCitationFormatHtml');
  cy.intercept(
    'GET',
    '**/srv/api/records/cf5048f6-5bbf-4e44-ba74-e6f429af51ea/formatters/citation?output=txt&approved=true&format=ris',
    { fixture: 'record-api-citation-format.ris' },
  ).as('apiCitationFormatRis');

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
      req: 'search-api-search-by-resourcetype-request.json',
      res: 'search-api-search-by-resourcetype-response.json',
      alias: 'apiMainSearchByResourceType',
    },
    {
      req: 'search-api-autocomplete-request.json',
      res: 'search-api-autocomplete-response.json',
      alias: 'apiMainSearchAutocomplete',
    },
    {
      req: 'search-api-get-record-request.json',
      res: 'search-api-get-record-response.json',
      alias: 'apiMainSearchGetRecord',
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

Cypress.Commands.add('signin', (profile = 'administrator') => {
  cy.intercept('GET', '**/srv/api/me', { fixture: `me-${profile}.json` }).as('apiMe');
});
