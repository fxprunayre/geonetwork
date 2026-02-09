describe('Map Page', () => {
  beforeEach(() => {
    cy.initApp();
    cy.visit('/map');
  });

  it('should initilialize the map with no layers', () => {
    cy.get('sxt-viewer').should('exist').as('mapViewer');
    cy.get('@mapViewer').within(() => {
      cy.get('div[message="No layers added"]').should('exist');
    });
  });
});
