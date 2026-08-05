/// <reference types="cypress" />

import { SURVAL_UUID } from '../support/utils';

describe('Record page - Bookmarks', () => {
  function visitRecord() {
    cy.visitPage(`record/${SURVAL_UUID}`);
    cy.wait('@apiMainSearchGetRecord');
  }

  beforeEach(() => {
    cy.initApp('editor');
  });

  describe('when the bookmark selection exists', () => {
    beforeEach(() => {
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

      visitRecord();
      cy.wait('@getSelectionList');
      cy.wait('@getSelectionRecords');
    });

    it('should toggle bookmark status in record header', () => {
      cy.get('app-record-view-title app-bookmark button').should('be.visible');

      cy.get('app-record-view-title app-bookmark button').click();
      cy.wait('@addBookmark');

      cy.get('app-record-view-title app-bookmark button').click();
      cy.wait('@removeBookmark');
    });
  });

  describe('when the bookmark selection does not exist', () => {
    beforeEach(() => {
      cy.intercept('GET', '**/userselections', {
        body: [{ id: 1, name: 'Other selection' }],
      }).as('getSelectionListMissingPreferred');
      cy.intercept('GET', '**/userselections/0/2', {
        body: [],
      }).as('getSelectionRecordsWhenMissingPreferred');

      visitRecord();
      cy.wait('@getSelectionListMissingPreferred');
    });

    it('should hide bookmark action when preferred selection list does not exist', () => {
      cy.get('app-record-view-title app-bookmark button').should('not.exist');
    });
  });
});
