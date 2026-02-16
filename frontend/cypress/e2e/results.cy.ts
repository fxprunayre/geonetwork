import { SURVAL_UUID } from '../support/utils';

const checkResultItem = (hit: any, layout: 'grid' | 'list') => {
  cy.get('a')
    .should('have.attr', 'href', `/record/${hit._id}`)
    .should('have.attr', 'title', hit._source.resourceAbstractObject.default);

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
    resourceTypeTranslations[hit._source.resourceType as keyof typeof resourceTypeTranslations],
  );

  cy.get('app-record-distribution-badges').as('distributionBadges').should('exist');
  cy.get('@distributionBadges').find('p-button').as('distributionButtons').should('have.length', 2);
  cy.get('@distributionButtons').first().should('contain.text', 'View');
  cy.get('@distributionButtons').last().should('contain.text', 'Download');

  if (layout === 'list') {
    cy.get('app-record-field-credit span').should(
      'contain.text',
      hit._source.resourceCreditObject[0].default,
    );
  }

  cy.get(`a[href="/record/${hit._id}"]`).first().click();
  cy.url().should('include', `/record/${hit._id}`);
};

describe('Results', () => {
  beforeEach(() => {
    cy.initApp();
  });

  it('should display result items in list view', () => {
    cy.visit(`/search?q=${SURVAL_UUID}`);
    cy.wait('@apiMainSearchByUuid').then((search) => {
      const hits = search.response?.body.hits.hits;

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
    cy.visit(`/search?q=${SURVAL_UUID}`);
    cy.wait('@apiMainSearchByUuid').then((search) => {
      const hits = search.response?.body.hits.hits;

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
    cy.visit(`/search?q=${SURVAL_UUID}`);
    cy.wait('@apiMainSearchByUuid');

    cy.viewport(1024, 768);
    cy.get('app-results-view app-result-item-list')
      .first()
      .within(() => {
        cy.get('app-record-distribution-badges p-button').each(($btn) => {
          cy.wrap($btn).find('.p-button-label').should('be.hidden');
        });
      });

    cy.viewport(1600, 960); // Tailwind 2xl is 1536px
    cy.get('app-results-view app-result-item-list')
      .first()
      .within(() => {
        cy.get('app-record-distribution-badges p-button').each(($btn) => {
          cy.wrap($btn).find('.p-button-label').should('be.visible');
        });
      });
  });
});
