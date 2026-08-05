import { SURVAL_UUID } from '../support/utils';

type ResultHit = {
  _id: string;
  _source: {
    overview: { url: string }[];
    resourceTitleObject: { default: string };
    resourceType: 'dataset' | 'series' | 'service';
    resourceCreditObject: { default: string }[];
  };
};

const checkResultItem = (hit: ResultHit, layout: 'grid' | 'list') => {
  cy.get('a').first().as('recordLink');

  cy.get('app-record-field-overview img').should('have.attr', 'src', hit._source.overview[0].url);

  cy.get('app-record-field-title span')
    .should('contain.text', hit._source.resourceTitleObject.default)
    .should('have.attr', 'title', hit._source.resourceTitleObject.default);
  const resourceTypeTranslations = {
    dataset: 'Dataset',
    series: 'Series',
    service: 'Service',
  };
  cy.get('app-record-field-type').should(
    'contain.text',
    resourceTypeTranslations[hit._source.resourceType],
  );

  cy.get('app-record-distribution-badges').as('distributionBadges').should('exist');
  cy.get('@distributionBadges').find('a').as('distributionButtons').should('have.length', 2);
  cy.get('@distributionButtons').first().should('contain.text', 'View');
  cy.get('@distributionButtons').last().should('contain.text', 'Download');

  if (layout === 'list') {
    cy.get('app-record-field-credit span').should(
      'contain.text',
      hit._source.resourceCreditObject[0].default,
    );
  }

  cy.get('@recordLink').click();
  cy.url().should('include', `/record/${hit._id}`);
};

describe('Results', () => {
  beforeEach(() => {
    cy.initApp();
  });

  it('should display result items in list view', () => {
    cy.visitPage('search', { q: SURVAL_UUID });
    cy.wait('@apiMainSearchByUuid').then((search) => {
      const hits = search.response?.body.hits.hits as ResultHit[];

      cy.get('app-results-view').find('app-result-item-list').should('have.length', hits.length);

      cy.get('app-results-view')
        .find('app-result-item-list')
        .first()
        .within(() => {
          checkResultItem(hits[0], 'list');
        });
    });
  });

  it('should switch to grid view and display result items', () => {
    cy.visitPage('search', { q: SURVAL_UUID });
    cy.wait('@apiMainSearchByUuid').then((search) => {
      const hits = search.response?.body.hits.hits as ResultHit[];

      cy.get('app-result-layout-switcher [title="Grid view"]').click();
      cy.get('app-results-view').find('app-result-item-grid').should('have.length', hits.length);

      cy.get('app-results-view')
        .find('app-result-item-grid')
        .first()
        .within(() => {
          checkResultItem(hits[0], 'grid');
        });
    });
  });

  it('should display distribution buttons text only on large screens', () => {
    cy.visitPage('search', { q: SURVAL_UUID });
    cy.wait('@apiMainSearchByUuid');

    cy.viewport(1024, 768);
    cy.get('app-results-view app-result-item-list')
      .first()
      .within(() => {
        cy.get('app-record-distribution-badges a').each(($btn) => {
          cy.wrap($btn).find('.p-button-label').should('be.hidden');
        });
      });

    cy.viewport(1600, 960); // Tailwind 2xl is 1536px
    cy.get('app-results-view app-result-item-list')
      .first()
      .within(() => {
        cy.get('app-record-distribution-badges a').each(($btn) => {
          cy.wrap($btn).find('.p-button-label').should('be.visible');
        });
      });
  });

  describe('Distribution buttons', () => {
    it('should open record data access tab when clicking distribution view buttons', () => {
      cy.visitPage('search', { q: SURVAL_UUID });
      cy.wait('@apiMainSearchByUuid');

      cy.get('app-results-view app-result-item-list')
        .first()
        .within(() => {
          cy.get('a[title="Add all to map"]')
            .click()
            .then(() => {
              cy.url().should(
                'include',
                `add=%5B%7B%22type%22:%22wms%22,%22url%22:%22https%253A%252F%252Fsextant.ifremer.fr%252Fservices%252Fwms%252Fenvironnement_marin%22,%22uuid%22:%22cf5048f6-5bbf-4e44-ba74-e6f429af51ea%22,%22name%22:%22surval_parametre_point%252Csurval_parametre_ligne%252Csurval_parametre_polygone%22,%22label%22:%22Surval%2520donn%25C3%25A9es%2520par%2520param%25C3%25A8tre%2520(point)%252C%2520Surval%2520donn%25C3%25A9es%2520par%2520param%25C3%25A8tre%2520(polygone)%252C%2520Surval%2520donn%25C3%25A9es%2520par%2520param%25C3%25A8tre%2520(ligne)%22%7D%5D`,
                // &datasource=https:%2F%2Fsextant.ifremer.fr%2Fservices%2Fwfs%2Fenvironnement_marin
              );
            });
        });
    });

    it('should open record data access tab when clicking distribution download buttons', () => {
      cy.visitPage('search', { q: SURVAL_UUID });
      cy.wait('@apiMainSearchByUuid');

      cy.get('app-results-view app-result-item-list')
        .first()
        .within(() => {
          cy.get('a[title="Download"]')
            .click()
            .then(() => {
              cy.url().should(
                'include',
                `/record/${SURVAL_UUID}/data-access?scrollTo=distribution-section-download`,
              );
            });
        });
    });
  });
});
