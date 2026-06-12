import { SURVAL_UUID } from '../support/utils';

describe('Record page - Explore', () => {
  beforeEach(() => {
    cy.initApp();
  });

  it('should set the route corresponding to the current tab', () => {
    cy.visitPage(`record/${SURVAL_UUID}`);
    cy.wait('@apiMainSearchGetRecord');

    ['data-access', 'explore'].forEach((tab) => {
      cy.get(`p-tablist p-tab[value="${tab}"]`)
        .click()
        .then(() => {
          cy.url().should('include', `/record/${SURVAL_UUID}/${tab}`);
        });
    });
  });

  it('should display the explore tab content', () => {
    cy.visitPage(`record/${SURVAL_UUID}`);
    cy.wait('@apiMainSearchGetRecord');
  });
});
