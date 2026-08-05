import { SURVAL_UUID } from '../support/utils';

describe('Record page', () => {
  beforeEach(() => {
    cy.initApp();
    cy.intercept('GET', `**/records/${SURVAL_UUID}/permalink`).as('getPermalink');
  });

  function visitRecord(path = SURVAL_UUID) {
    cy.visitPage(`record/${path}`);
    cy.wait('@apiMainSearchGetRecord');
  }

  describe('Header', () => {
    describe('when viewing the record page directly', () => {
      beforeEach(() => {
        visitRecord();
      });

      it('should display the record menu with share and download options', () => {
        cy.wait('@getPermalink');
        cy.get('app-record-menu button')
          .click()
          .then(() => {
            cy.get('a[title="Permalink to the record"]')
              .should('have.text', 'Permalink')
              .should('be.visible')
              .should('have.attr', 'href')
              .and('include', `https://doi.org/10.12770/cf5048f6-5bbf-4e44-ba74-e6f429af51ea`);

            cy.get('a[title="Download the record in XML format"]')
              .should('have.text', 'Metadata (XML)')
              .should('be.visible')
              .should('have.attr', 'href')
              .and('include', `/srv/api/records/${SURVAL_UUID}/formatters/xml`);
          });
      });

      it('should display the record header information', () => {
        cy.get('app-record-view-title h1').should('contain', 'Données par paramètre');

        cy.get('app-record-view-title app-record-field-type')
          .find('.p-chip span')
          .first()
          .should('contain', 'Dataset');

        cy.get('app-show-more-toggle p').should(
          'contain',
          'Le produit Surval "Données par paramètre" met à disposition',
        );

        cy.get('app-record-field-dates').as('datesField');
        cy.get('@datesField')
          .find('div:has(> span)')
          .last()
          .then((dateDiv) => {
            const lastUpdateText = dateDiv.text().replace(dateDiv.find('span').text(), '').trim();

            cy.get('app-record-field-resource-last-update').should('contain', lastUpdateText);
          });

        cy.get('app-record-field-doi a').should(
          'contain',
          '10.12770/cf5048f6-5bbf-4e44-ba74-e6f429af51ea',
        );

        cy.get('app-record-harvester-logo img')
          .should('have.attr', 'alt', 'Catalogue logo')
          .should(
            'have.attr',
            'src',
            '/geonetwork/srv/api/sources/b08fe709-1ced-4a07-8edf-06aa6ccdf2e3/logo',
          );
      });
    });

    it('should navigate back to search results', () => {
      cy.visitPage('search');
      cy.wait('@apiMainSearch');

      cy.get('app-result-item-list a').first().click();

      cy.wait('@apiMainSearchGetRecord');
      cy.url().should('include', `/record/${SURVAL_UUID}`);

      cy.get('p-button[title="Back to results"] button').click();

      cy.url().should('include', '/search');
      cy.get('app-result-item-list').should('have.length.at.least', 1);
    });
  });

  describe('Invalid Record', () => {
    it('should display an alert panel when the record UUID is not found', () => {
      const invalidUuid = 'invalid-uuid-1234';
      cy.intercept('POST', `**/records/_search*`, (req) => {
        if (
          req.body &&
          req.body.query &&
          req.body.query.term &&
          req.body.query.term.uuid === invalidUuid
        ) {
          req.reply({
            statusCode: 404,
            body: { error: 'Not found' },
          });
        }
      }).as('getInvalidRecord');

      cy.visitPage(`record/${invalidUuid}`);
      cy.wait('@getInvalidRecord');

      cy.get('app-alert-panel').should('exist');
      cy.get('app-alert-panel span.p-message-text div.text-xl').should(
        'contain',
        `Record with identifier ${invalidUuid} was not found or is not shared with you.`,
      );
      cy.get('app-alert-panel span.p-message-text div.text-base').should(
        'contain',
        'Try to sign in or do another search',
      );
    });
  });

  describe('Content', () => {
    it('should set the route to default tab if tab value is invalid', () => {
      visitRecord(`${SURVAL_UUID}/invalid-tab`);
      cy.url().should('include', `/record/${SURVAL_UUID}`);
    });

    it('should display the about tab content', () => {
      visitRecord();

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

      // Lineage
      cy.get('[data-testid="accordion-panel-about"]')
        .contains('div', 'Lineage')
        .should('contain', 'Les données sont bancarisées dans la base de données Quadrige.');

      // Check we have 2 dates
      cy.get('app-record-field-dates div:has(> span)').should('have.length', 2);

      // Find specific dates by label text instead of position (first/last)
      cy.get('app-record-field-dates')
        .contains('div', 'Creation')
        .should('contain', 'January 1, 2012');
      cy.get('app-record-field-dates')
        .contains('div', 'Publication')
        .should('contain', 'January 1, 2026');

      cy.get('[data-testid="accordion-panel-dates"]')
        .contains('div', 'Temporal coverage')
        .should('contain', '1973')
        .should('contain', 'On going');

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

      cy.get('[data-testid="accordion-panel-contact-pointOfContact"] .p-accordionheader').contains(
        'Point of contact',
      );
      cy.get('[data-testid="accordion-panel-contact-pointOfContact"]')
        .contains('a', "Cellule d'Administration Quadrige")
        .should('have.attr', 'href')
        .and('match', /\/#?\/?search\?q=%22Cellule%20d'Administration%20Quadrige%22/);

      cy.get('[data-testid="accordion-panel-contact-author"] .p-accordionheader').contains(
        'Author',
      );
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
  });
});
