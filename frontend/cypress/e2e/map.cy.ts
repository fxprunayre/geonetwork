describe('Map Page', () => {
  beforeEach(() => {
    cy.initApp();
    cy.visitPage('map');
  });

  it('should initilialize the map with no layers', () => {
    cy.get('sxt-viewer').should('exist').as('mapViewer');
    cy.get('@mapViewer').within(() => {
      cy.get('span').contains('Couches').should('exist');
    });
  });
});
