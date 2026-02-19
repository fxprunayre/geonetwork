import { SURVAL_UUID } from '../support/utils';

describe('Record page editing', () => {
  beforeEach(() => {
    cy.initApp();
  });

  it('should display the edit button', () => {
    cy.signin();
    cy.visit(`/record/${SURVAL_UUID}`);
    cy.wait(['@apiMainSearchGetRecord', '@apiMe']);
    cy.get('a[title="Edit record"]')
      .should('be.visible')
      .should('have.attr', 'href', `/geonetwork/srv/eng/catalog.edit#/metadata/${SURVAL_UUID}`);
  });
});
