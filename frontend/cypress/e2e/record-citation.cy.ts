import { SURVAL_UUID } from '../support/utils';

describe('Record page - Citation', () => {
  beforeEach(() => {
    cy.initApp();
  });

  it('should display the citation tab content', () => {
    cy.visitPage(`record/${SURVAL_UUID}`);
    cy.wait('@apiMainSearchGetRecord');

    cy.get('p-tablist p-tab[value="citation"]').contains('Citation').click();

    cy.wait('@apiCitationFormats');
    cy.get('app-record-citation p-togglebutton').should('have.length', 4);
    cy.wait('@apiCitationFormatHtml');
    cy.get('app-record-citation p-togglebutton.p-togglebutton-checked').should('contain', 'HTML');
    cy.get('app-record-citation p-panel div blockquote span').should('contain', 'Quadrige');

    cy.get('app-record-citation p-togglebutton').contains('TEXT').click();
    cy.wait('@apiCitationFormatTxt');
    cy.get('app-record-citation p-panel div').should(
      'contain',
      'Quadrige (2026). Données par paramètre. Quadrige. https://doi.org/10.12770/cf5048f6-5bbf-4e44-ba74-e6f429af51ea',
    );

    const citationText =
      'Quadrige (2026). Données par paramètre. Quadrige. https://doi.org/10.12770/cf5048f6-5bbf-4e44-ba74-e6f429af51ea';
    cy.mockClipboard(citationText);

    cy.get('app-record-citation app-copy-input p-button')
      .should('have.attr', 'title', 'Copy')
      .find('button')
      .click();

    cy.window().then((win) => {
      win.navigator.clipboard.readText().then((clipText) => {
        expect(clipText, 'Citation must be in the clipboard').to.eq(citationText);
      });
    });

    cy.get('app-record-citation a[download]')
      .should('have.attr', 'title', 'Download')
      .should(
        'have.attr',
        'href',
        'data:text/plain;charset=utf-8,Quadrige%20(2026).%20Donn%C3%A9es%20par%20param%C3%A8tre.%20Quadrige.%20https%3A%2F%2Fdoi.org%2F10.12770%2Fcf5048f6-5bbf-4e44-ba74-e6f429af51ea',
      );

    cy.get('app-record-citation p-togglebutton').contains('RIS').click();
    cy.wait('@apiCitationFormatRis');
    cy.get('app-record-citation p-panel pre').should('contain', 'TI  - Données par paramètre');
  });
});
