import { formatNumber, SURVAL_UUID } from '../support/utils';

describe('Record page', () => {
  beforeEach(() => {
    cy.initApp();
    cy.intercept('GET', `**/records/${SURVAL_UUID}/permalink`).as('getPermalink');
  });

  it('should display the record menu with share and download options', () => {
    cy.visit(`/record/${SURVAL_UUID}`);
    cy.wait('@apiMainSearchGetRecord');

    cy.get('app-record-menu p-button[title="Quick actions"]').click();

    cy.wait('@getPermalink');

    cy.get('app-record-menu .p-menu-item-link')
      .first()
      .find('.p-menu-item-label')
      .should('have.text', 'Share')
      .should('be.visible')
      .closest('a')
      .should('have.attr', 'href')
      .and('include', `https://doi.org/10.12770/cf5048f6-5bbf-4e44-ba74-e6f429af51ea`);

    cy.get('app-record-menu .p-menu-item-link')
      .last()
      .find('.p-menu-item-label')
      .should('have.text', 'Metadata (XML)')
      .should('be.visible')
      .closest('a')
      .should('have.attr', 'href')
      .and('include', `/srv/api/records/${SURVAL_UUID}/formatters/xml`);
  });
});
