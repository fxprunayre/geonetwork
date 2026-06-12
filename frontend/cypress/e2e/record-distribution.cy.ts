import { SURVAL_UUID } from '../support/utils';

describe('Record page - Distribution', () => {
  beforeEach(() => {
    cy.initApp();
  });

  it('should display the data access tab content', () => {
    cy.visitPage(`record/${SURVAL_UUID}`);
    cy.wait('@apiMainSearchGetRecord');

    cy.get('p-tablist p-tab[value="data-access"]')
      .should('have.attr', 'aria-selected', 'false')
      .contains('Data access')
      .click();

    cy.get('[data-testid="distribution-panel-api"] .p-accordionheader').contains('View');
    cy.get('[data-testid="distribution-panel-api"]').find('p-card').should('have.length', 1);

    cy.get('[data-testid="distribution-panel-download"] .p-accordionheader').contains('Download');
    cy.get('[data-testid="distribution-panel-download"]').find('p-card').should('have.length', 2);
    cy.get('[data-testid="distribution-panel-download"]')
      .contains('p-card', 'surval_parametre_point,surval_parametre_ligne,surval_parametre_polygone')
      .find('ng-icon')
      .should('have.attr', 'title', 'OGC:WFS');

    cy.get('[data-testid="distribution-panel-download"]')
      .contains('p-card', 'surval_parametre_point,surval_parametre_ligne,surval_parametre_polygone')
      .find('span')
      .should('contain', 'WFS');

    cy.get('[data-testid="distribution-panel-download"]')
      .contains('a', 'surval_parametre_point,surval_parametre_ligne,surval_parametre_polygone')
      .should('have.attr', 'href', 'https://sextant.ifremer.fr/services/wfs/environnement_marin')
      .next('p')
      .should('contain', 'Surval données par paramètre');
    cy.get('[data-testid="distribution-panel-download"]')
      .contains('p-card', 'surval_parametre_point,surval_parametre_ligne,surval_parametre_polygone')
      .find('p-button')
      .should('contain', 'Explore data');

    cy.get('[data-testid="distribution-panel-links"] .p-accordionheader').contains('Links');
    cy.get('[data-testid="distribution-panel-links"]').find('p-card').should('have.length', 5);
    cy.get('[data-testid="distribution-panel-links"]')
      .contains('p-card', ' La base de données Quadrige ')
      .find('ng-icon')
      .should('have.attr', 'title', 'WWW:LINK');
    cy.get('[data-testid="distribution-panel-links"]')
      .contains('a', ' La base de données Quadrige ')
      .should('have.attr', 'href', 'https://envlit.ifremer.fr/Quadrige-la-base-de-donnees');
  });

  it('should, for WMS distribution, allow it to be added to the map', () => {
    cy.clearBrowserCache();
    cy.visitPage(`record/${SURVAL_UUID}`);
    cy.wait('@apiMainSearchGetRecord');

    cy.get('p-tablist p-tab[value="data-access"]')
      .should('have.attr', 'aria-selected', 'false')
      .contains('Data access')
      .click();

    cy.get('[data-testid="distribution-panel-api"]')
      .contains('p-card', 'surval_parametre_point,surval_parametre_ligne,surval_parametre_polygone')
      .find('ng-icon')
      .should('have.attr', 'title', 'OGC:WMS');
    cy.get('[data-testid="distribution-panel-api"]')
      .contains('a', 'surval_parametre_point,surval_parametre_ligne,surval_parametre_polygone')
      .should('have.attr', 'href', 'https://sextant.ifremer.fr/services/wms/environnement_marin')
      .next('p')
      .should('contain', 'Surval données par paramètre');
    cy.get('[data-testid="distribution-panel-api"]')
      .contains('p-card', 'surval_parametre_point,surval_parametre_ligne,surval_parametre_polygone')
      .find('p-button')
      .should('contain', 'Add to map')
      .as('addToMapButton');

    cy.get('@addToMapButton').click();
    cy.url().should(
      'include',
      '/map?add=%5B%7B%22type%22:%22wms%22,%22url%22:%22https%253A%252F%252Fsextant.ifremer.fr%252Fservices%252Fwms%252Fenvironnement_marin%22,%22uuid%22:%22cf5048f6-5bbf-4e44-ba74-e6f429af51ea%22,%22name%22:%22surval_parametre_point%252Csurval_parametre_ligne%252Csurval_parametre_polygone%22,%22label%22:%22Surval%2520donn%25C3%25A9es%2520par%2520param%25C3%25A8tre%2520(point)%252C%2520Surval%2520donn%25C3%25A9es%2520par%2520param%25C3%25A8tre%2520(polygone)%252C%2520Surval%2520donn%25C3%25A9es%2520par%2520param%25C3%25A8tre%2520(ligne)%22%7D%5D',
    );

    cy.get('sxt-viewer').should('exist').as('mapViewer');
    cy.get('@mapViewer').within(() => {
      cy.get('.layer-list > button').should('have.length', 1);
    });
  });

  it('should, for WMS distribution, indicate service is down', () => {
    cy.clearBrowserCache();
    cy.intercept(
      'GET',
      'https://sextant.ifremer.fr/services/wms/environnement_marin?SERVICE=WMS&REQUEST=GetCapabilities',
      {
        statusCode: 500,
        body: 'Service Unavailable',
      },
    ).as('wmsServiceDown');

    cy.visitPage(`record/${SURVAL_UUID}`);
    cy.wait('@apiMainSearchGetRecord');

    cy.get('p-tablist p-tab[value="data-access"]')
      .should('have.attr', 'aria-selected', 'false')
      .contains('Data access')
      .click();

    cy.get('[data-testid="distribution-panel-api"]')
      .contains('p-card', 'surval_parametre_point,surval_parametre_ligne,surval_parametre_polygone')
      .find('ng-icon')
      .should('have.attr', 'title', 'OGC:WMS');
    cy.get('[data-testid="distribution-panel-api"]')
      .contains('a', 'surval_parametre_point,surval_parametre_ligne,surval_parametre_polygone')
      .should('have.attr', 'href', 'https://sextant.ifremer.fr/services/wms/environnement_marin')
      .next('p')
      .should('contain', 'Surval données par paramètre');
    cy.get('[data-testid="distribution-panel-api"]')
      .contains('p-card', 'surval_parametre_point,surval_parametre_ligne,surval_parametre_polygone')
      .find('p-button')
      .should('have.attr', 'severity', 'warn');
  });

  it('should, for WMS distribution, propose list of layers if layer name is not found', () => {
    cy.clearBrowserCache();
    cy.intercept(
      'GET',
      'https://sextant.ifremer.fr/services/wms/environnement_marin?SERVICE=WMS&REQUEST=GetCapabilities',
      {
        fixture: 'ogc-wms-surval-capabilities-withoutexpecetedlayers.xml',
      },
    ).as('wmsServiceCapabilitiesWithoutExpectedLayers');

    cy.visitPage(`record/${SURVAL_UUID}`);
    cy.wait('@apiMainSearchGetRecord');

    cy.get('p-tablist p-tab[value="data-access"]')
      .should('have.attr', 'aria-selected', 'false')
      .contains('Data access')
      .click();

    cy.get('[data-testid="distribution-panel-api"]')
      .contains('p-card', 'surval_parametre_point,surval_parametre_ligne,surval_parametre_polygone')
      .find('ng-icon')
      .should('have.attr', 'title', 'OGC:WMS');
    cy.get('[data-testid="distribution-panel-api"]')
      .contains('a', 'surval_parametre_point,surval_parametre_ligne,surval_parametre_polygone')
      .should('have.attr', 'href', 'https://sextant.ifremer.fr/services/wms/environnement_marin')
      .next('p')
      .should('contain', 'Surval données par paramètre');
    cy.get('[data-testid="distribution-panel-api"]')
      .contains('p-card', 'surval_parametre_point,surval_parametre_ligne,surval_parametre_polygone')
      .find('p-splitbutton')
      .should(
        'have.attr',
        'title',
        "Layer 'surval_parametre_point,surval_parametre_ligne,surval_parametre_polygone' not found in the WMS service. Choose another layer from the service.",
      );
  });
});
