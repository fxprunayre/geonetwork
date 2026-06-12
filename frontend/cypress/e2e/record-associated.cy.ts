import { SURVAL_UUID } from '../support/utils';

describe('Record page - Associated resources', () => {
  beforeEach(() => {
    cy.initApp();
  });

  it('should display the associated resources in the about tab', () => {
    cy.visitPage(`record/${SURVAL_UUID}`);
    cy.wait('@apiMainSearchGetRecord');

    cy.get('p-tablist p-tab[value="associated-resources"]')
      .contains('Associated resources')
      .click();

    // Associated resources (Children)
    cy.get('[data-testid="associated-records-children"]').contains(
      'div',
      'Composed of 8 resource(s)',
    );

    cy.get('[data-testid="associated-records-hassources"]').contains(
      'div',
      'Used for 34 resource(s)',
    );

    cy.get('[data-testid="associated-records-hassources"] app-full-screen-panel p-button').should(
      'have.length',
      1,
    );
  });
});
