import { SURVAL_UUID } from '../support/utils';

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

  it('should display the record header information', () => {
    cy.visit(`/record/${SURVAL_UUID}`);
    cy.wait('@apiMainSearchGetRecord');

    cy.get('app-record-view-header h1').should('contain', 'Données par paramètre');

    cy.get('app-record-view-header app-record-field-type')
      .find('.p-chip .p-chip-label')
      .first()
      .should('contain', 'Dataset');

    cy.get('app-record-view-header app-record-field-type')
      .find('.p-chip .p-chip-label')
      .last()
      .should('contain', 'Vecteur');

    cy.get('app-show-more-toggle p').should(
      'contain',
      'Le produit Surval "Données par paramètre" met à disposition',
    );

    // last date should be the value of app-record-field-resource-last-update
    cy.get('app-record-field-dates').as('datesField');
    cy.get('@datesField')
      .find('div:has(> span)')
      .last()
      .then((dateDiv) => {
        // Only get the date part
        const lastUpdateText = dateDiv.text().replace(dateDiv.find('span').text(), '').trim();

        cy.get('app-record-field-resource-last-update').should('contain', lastUpdateText);
      });

    cy.get('app-record-field-doi a').should(
      'contain',
      '10.12770/cf5048f6-5bbf-4e44-ba74-e6f429af51ea',
    );
  });

  it('should display the about tab content', () => {
    cy.visit(`/record/${SURVAL_UUID}`);
    cy.wait('@apiMainSearchGetRecord');

    // Check tab description is active
    cy.get('p-tablist p-tab[value="about"]').should('have.attr', 'aria-selected', 'true');
    cy.get('p-tablist p-tab[value="about"]').contains('Description');

    // Check about content
    // The "About" accordion panel
    cy.get('[data-testid="accordion-panel-about"] .p-accordionheader').contains('About');

    // Credits
    cy.get('app-record-field-credit').should('contain', 'Ifremer (Quadrige)');

    // Check keyword search link in credit
    cy.get('app-record-field-credit app-search-link a').should(
      'have.attr',
      'title',
      'Search for Ifremer (Quadrige)',
    );

    // Associated resources (Children)
    cy.get('[data-testid="associated-records-children"]').contains(
      'div',
      'Composed of 8 resource(s)',
    );
    cy.get('[data-testid="associated-records-children"]').contains('p-button', 'See all');

    // Check we have 2 dates
    cy.get('app-record-field-dates div:has(> span)').should('have.length', 2);

    // Find specific dates by label text instead of position (first/last)
    cy.get('app-record-field-dates')
      .contains('div', 'Creation')
      .should('contain', 'January 1, 2012');
    cy.get('app-record-field-dates')
      .contains('div', 'Publication')
      .should('contain', 'January 1, 2026');

    // Usage and Access
    cy.get('[data-testid="accordion-panel-usageAndAccess"] .p-accordionheader').contains(
      'Usage and access',
    );
    cy.get('[data-testid="accordion-panel-usageAndAccess"]')
      .contains('div', 'Use limitation')
      .should(
        'contain',
        'Données sous Licence ouverte / Open licence : http://www.etalab.gouv.fr/pages/licence-ouverte-open-licence-5899923.html',
      );
    cy.get('[data-testid="accordion-panel-usageAndAccess"]')
      .contains('div', 'Access constraints')
      .should('contain', 'Autres restrictions');
    cy.get('[data-testid="accordion-panel-usageAndAccess"]')
      .contains('div', 'Other constraints')
      .should('contain', "La Licence ouverte d'Etalab");

    // Coverage
    cy.get('[data-testid="accordion-panel-coverage"] .p-accordionheader').contains('Coverage');
    cy.get('[data-testid="accordion-panel-coverage"] app-record-field-coverage-spatial').should(
      'exist',
    );
    cy.get('[data-testid="accordion-panel-coverage"]')
      .contains('div', 'Geospatial coverage')
      .find('[label="record.field.coverage.north"] input')
      .should('have.value', '70.00°');
    cy.get('[data-testid="accordion-panel-coverage"]')
      .contains('div', 'Geospatial coverage')
      .find('[label="record.field.coverage.south"] input')
      .should('have.value', '-70.00°');
    cy.get('[data-testid="accordion-panel-coverage"]')
      .contains('div', 'Geospatial coverage')
      .find('[label="record.field.coverage.east"] input')
      .should('have.value', '180.00°');
    cy.get('[data-testid="accordion-panel-coverage"]')
      .contains('div', 'Geospatial coverage')
      .find('[label="record.field.coverage.west"] input')
      .should('have.value', '-180.00°');
    cy.get('[data-testid="accordion-panel-coverage"]')
      .contains('div', 'Geospatial coverage')
      .find('img')
      .should(
        'have.attr',
        'src',
        '/geonetwork/srv/api/regions/geom.png?geomsrs=EPSG:4326&geom=POLYGON((-180 -70, 180 -70, 180 70, -180 70, -180 -70))',
      );

    cy.get('[data-testid="accordion-panel-coverage"]')
      .contains('div', 'Temporal coverage')
      .should('contain', '1973')
      .should('contain', 'On going');

    // Spatial Information
    cy.get('[data-testid="accordion-panel-spatialInfo"] .p-accordionheader').contains(
      'Spatial information',
    );
    // Dataset
    cy.get('[data-testid="accordion-panel-spatialInfo"]')
      .contains('div', 'Resource type')
      .should('contain', 'Dataset');

    cy.get('[data-testid="accordion-panel-spatialInfo"]')
      .contains('div', 'Resolution')
      .get('p-chip')
      .should('contain', '1:5000');
    cy.get('[data-testid="accordion-panel-spatialInfo"]')
      .contains('div', 'Coordinate system')
      .get('p-chip')
      .should('contain', 'WGS 84 (EPSG:4326)');

    // Lineage
    cy.get('[data-testid="accordion-panel-lineage"] .p-accordionheader').contains('Lineage');
    cy.get('[data-testid="accordion-panel-lineage"]')
      .contains('div', 'Lineage')
      .should('contain', 'Les données sont bancarisées dans la base de données Quadrige.');

    cy.get('[data-testid="associated-records-hassources"]').contains(
      'div',
      'Used for 34 resource(s)',
    );

    cy.get('[data-testid="accordion-panel-contact-pointOfContact"] .p-accordionheader').contains(
      'Point of contact',
    );
    cy.get('[data-testid="accordion-panel-contact-pointOfContact"]')
      .contains('a', "Cellule d'Administration Quadrige")
      .should('have.attr', 'href', "/search?q=%22Cellule%20d'Administration%20Quadrige%22");

    cy.get('[data-testid="accordion-panel-contact-author"] .p-accordionheader').contains('Author');
    cy.get('[data-testid="accordion-panel-contact-publisher"] .p-accordionheader').contains(
      'Publisher',
    );

    // Classification
    cy.get('[data-testid="accordion-panel-classification"] .p-accordionheader').contains(
      'Classification',
    );
    cy.get('[data-testid="accordion-panel-classification"] app-keyword-list').should(
      'have.length',
      12,
    );
    cy.get('[data-testid="accordion-panel-classification"]')
      .contains('app-keyword-list', 'Cadre Réglementaire - SIMM')
      .find('p-chip')
      .should('have.length', 2)
      .should('contain', 'Directive Cadre Stratégie pour le Milieu Marin (DCSMM)')
      .should('contain', "Directive Cadre sur l'Eau (DCE)");
  });

  it('should display the data access tab content', () => {
    cy.visit(`/record/${SURVAL_UUID}`);
    cy.wait('@apiMainSearchGetRecord');

    cy.get('p-tablist p-tab[value="data-access"]')
      .should('have.attr', 'aria-selected', 'false')
      .contains('Data access')
      .click();

    cy.get('[data-testid="distribution-panel-api"] .p-accordionheader').contains('API');
    cy.get('[data-testid="distribution-panel-api"]').find('p-card').should('have.length', 1);

    cy.get('[data-testid="distribution-panel-download"] .p-accordionheader').contains('Download');
    cy.get('[data-testid="distribution-panel-download"]').find('p-card').should('have.length', 2);
    cy.get('[data-testid="distribution-panel-download"]')
      .contains('p-card', 'surval_parametre_point,surval_parametre_ligne,surval_parametre_polygone')
      .find('ng-icon')
      .should('have.attr', 'title', 'OGC:WFS');
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

  it('should display the explore tab content', () => {
    cy.visit(`/record/${SURVAL_UUID}`);
    cy.wait('@apiMainSearchGetRecord');
  });

  it('should, for WMS distribution, allow it to be added to the map', () => {
    cy.clearBrowserCache();
    cy.visit(`/record/${SURVAL_UUID}`);
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
    cy.url().should('include', '/map');
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

    cy.visit(`/record/${SURVAL_UUID}`);
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

    cy.visit(`/record/${SURVAL_UUID}`);
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

  it('should display the citation tab content', () => {
    cy.visit(`/record/${SURVAL_UUID}`);
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

    cy.get('app-record-harvester-logo img')
      .should('have.attr', 'alt', 'Catalogue logo')
      .should(
        'have.attr',
        'src',
        '/geonetwork/images/logos/b08fe709-1ced-4a07-8edf-06aa6ccdf2e3.png',
      );
  });

  it('should navigate back to search results', () => {
    cy.visit('/search');
    cy.wait('@apiMainSearch');

    cy.get('app-result-item-list a').first().click();

    cy.wait('@apiMainSearchGetRecord');
    cy.url().should('include', `/record/${SURVAL_UUID}`);

    cy.contains('button', 'Back to results').click();

    cy.url().should('include', '/search');
    cy.get('app-result-item-list').should('have.length.at.least', 1);
  });
});
