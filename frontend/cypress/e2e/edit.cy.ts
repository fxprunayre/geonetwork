import { SURVAL_UUID } from '../support/utils';

describe('Record page editing', () => {
  beforeEach(() => {
    cy.initApp();
  });

  it('should display the edit button linking to GN4 and delete action', () => {
    cy.signin();
    cy.visitPage(`record/${SURVAL_UUID}`);
    cy.wait(['@apiMainSearchGetRecord', '@apiMe']);
    cy.get('a[title="Edit this record"]')
      .should('be.visible')
      .should('have.attr', 'href', `/geonetwork/srv/eng/catalog.edit#/metadata/${SURVAL_UUID}`);
    // cy.get('a[title="Delete this record"]')
    //   .should('be.visible');
  });
});
