import { SURVAL_UUID } from '../support/utils';

describe('Record page editing', () => {
  beforeEach(() => {
    cy.initApp('administrator');

    cy.window().then((win) => {
      cy.stub(win, 'open').as('windowOpen');
    });
  });

  it('should display the edit button linking to GN4 and delete action', () => {
    cy.visitPage(`record/${SURVAL_UUID}`);
    cy.wait(['@apiMainSearchGetRecord', '@apiMe']);
    cy.get('a[title="Edit this record"]').should('be.visible').as('editButton');
    // cy.get('@editButton').click();
    // cy.get('@windowOpen').should(
    //   'be.calledWithMatch',
    //   new RegExp(`\/srv\/eng\/catalog.edit#\/metadata\/${SURVAL_UUID}`)
    // );

    cy.get('a[title="Delete this record"]').should('be.visible');
  });
});
