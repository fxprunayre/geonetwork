import { SURVAL_UUID } from '../support/utils';

describe('User board panel', () => {
  function visitDashboard() {
    cy.visitPage('dashboard');
    cy.wait('@apiMe');
  }

  beforeEach(() => {
    cy.initApp('editor');

    cy.intercept('GET', '**/userselections/0/2', {
      body: [SURVAL_UUID],
    }).as('getUserBookmarks');

    cy.intercept('POST', '**/search/records/_search*', (req) => {
      const body = Cypress._.isString(req.body) ? JSON.parse(req.body) : req.body;
      const filters = body?.query?.bool?.filter ?? [];

      const isBookmarksSearch = filters.some(
        (clause: { terms?: { uuid?: string[] }; query_string?: { query?: string } }) =>
          Array.isArray(clause?.terms?.uuid) && clause.terms.uuid.includes(SURVAL_UUID),
      );
      const isUserRecordsSearch = filters.some(
        (clause: { terms?: { uuid?: string[] }; query_string?: { query?: string } }) =>
          clause?.query_string?.query?.includes('+owner:2'),
      );

      if (isBookmarksSearch) {
        req.alias = 'apiUserBookmarksSearch';
        req.reply({ fixture: 'search-api-search-by-uuid-response.json' });
        return;
      }

      if (isUserRecordsSearch) {
        req.alias = 'apiUserRecordsSearch';
        req.reply({ fixture: 'search-api-search-response.json' });
        return;
      }

      req.alias = 'apiUserBoardSearchFallback';
      req.reply({ fixture: 'search-api-search-response.json' });
    });
  });

  describe('default dashboard', () => {
    beforeEach(() => {
      visitDashboard();

      cy.wait('@getUserBookmarks');
      cy.wait('@apiUserRecordsSearch');
      cy.wait('@apiUserBookmarksSearch').then((interception) => {
        const body = Cypress._.isString(interception.request.body)
          ? JSON.parse(interception.request.body)
          : interception.request.body;
        const hasUuidFilter = (body?.query?.bool?.filter ?? []).some(
          (clause: { terms?: { uuid?: string[] }; query_string?: { query?: string } }) =>
            Array.isArray(clause?.terms?.uuid) && clause.terms.uuid.includes(SURVAL_UUID),
        );
        expect(hasUuidFilter).to.eq(true);
      });
    });

    it('should display bookmarks panel with bookmarked results', () => {
      cy.get('p-tablist p-tab[value="1"]').contains('Your bookmarks').click();

      cy.get('div[appsearchcontext="user-bookmarks"]').should('exist');
      cy.get('div[appsearchcontext="user-bookmarks"] app-results-view').should('exist');
      cy.contains('No bookmarks yet.').should('not.exist');
    });

    it('should display user contributions results as table with resource type as icon, title and updated column', () => {
      cy.get('div[appsearchcontext="user-records"] app-results-view').should('exist');
      cy.get('div[appsearchcontext="user-records"] p-table').should('exist');

      cy.get('div[appsearchcontext="user-records"] p-table th')
        .eq(0)
        .should('contain', 'Resource type');
      cy.get('div[appsearchcontext="user-records"] p-table th').eq(1).should('contain', 'Title');
      cy.get('div[appsearchcontext="user-records"] p-table th').eq(2).should('contain', 'Updated');

      cy.get('div[appsearchcontext="user-records"] p-table tbody tr')
        .first()
        .within(() => {
          cy.get('td').eq(0).find('app-record-field-type ng-icon').should('exist');

          cy.get('td').eq(1).find('app-record-field-title').should('exist');

          cy.get('td').eq(2).find('span.text-sm').should('exist');
        });
    });
  });

  describe('without templates', () => {
    beforeEach(() => {
      cy.intercept('POST', '**/search/records/_search*', (req) => {
        const body = Cypress._.isString(req.body) ? JSON.parse(req.body) : req.body;
        const serialized = JSON.stringify(body || {});
        const isTemplateCountRequest = body?.size === 0 && serialized.includes('isTemplate');

        if (isTemplateCountRequest) {
          req.alias = 'apiTemplateCountNoTemplates';
          req.reply({
            took: 1,
            timed_out: false,
            _shards: { total: 1, successful: 1, skipped: 0, failed: 0 },
            hits: { total: { value: 0, relation: 'eq' }, max_score: null, hits: [] },
            aggregations: {},
          });
          return;
        }

        req.continue();
      });

      visitDashboard();

      cy.wait('@apiTemplateCountNoTemplates');
    });

    it('should disable add record buttons when there are no templates', () => {
      cy.contains('app-user-board-menu a, app-user-board-menu button', 'Add record')
        .should('exist')
        .closest('li')
        .invoke('attr', 'class')
        .should('match', /disabled/i);
    });
  });
});
