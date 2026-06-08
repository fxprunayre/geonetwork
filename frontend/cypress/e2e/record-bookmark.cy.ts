import { SURVAL_UUID } from '../support/utils';

describe('Record page - Bookmarks', () => {
  beforeEach(() => {
    cy.initApp('editor');
  });

  it('should toggle bookmark status in record header', () => {
    cy.intercept('GET', '**/userselections', {
      body: [{ id: 0, name: 'Bookmarks' }],
    }).as('getSelectionList');
    cy.intercept('GET', '**/userselections/0/2', {
      body: [],
    }).as('getSelectionRecords');
    cy.intercept('PUT', '**/userselections/0/2*', (req) => {
      expect(req.query.uuid).to.equal(SURVAL_UUID);
      req.reply({ statusCode: 200, body: {} });
    }).as('addBookmark');
    cy.intercept('DELETE', '**/userselections/0/2*', (req) => {
      expect(req.query.uuid).to.equal(SURVAL_UUID);
      req.reply({ statusCode: 200, body: {} });
    }).as('removeBookmark');

    cy.visitPage(`record/${SURVAL_UUID}`);
    cy.wait('@apiMainSearchGetRecord');
    cy.wait('@getSelectionList');
    cy.wait('@getSelectionRecords');

    cy.get('app-record-view-title app-bookmark button').should('be.visible');

    cy.get('app-record-view-title app-bookmark button').click();
    cy.wait('@addBookmark');

    cy.get('app-record-view-title app-bookmark button').click();
    cy.wait('@removeBookmark');
  });

  it('should hide bookmark action when preferred selection list does not exist', () => {
    cy.intercept('GET', '**/userselections', {
      body: [{ id: 1, name: 'Other selection' }],
    }).as('getSelectionListMissingPreferred');
    cy.intercept('GET', '**/userselections/0/2', {
      body: [],
    }).as('getSelectionRecordsWhenMissingPreferred');

    cy.visitPage(`record/${SURVAL_UUID}`);
    cy.wait('@apiMainSearchGetRecord');
    cy.wait('@getSelectionListMissingPreferred');

    cy.get('app-record-view-title app-bookmark button').should('not.exist');
  });
});
