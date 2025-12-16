import { formatNumber } from '../support/utils';

describe('Search Page', () => {
  beforeEach(() => {
    cy.initApp();
    cy.visit('/search');
  });

  it('should run a global search about the catalogue and one to get the results', () => {
    cy.wait('@apiSearchRecords');
    cy.get('@apiSearchRecords.all').should('have.length', 1);
  });

  it('should display aggregations correctly', () => {
    cy.wait('@apiSearchRecords').then((interception) => {
      const keyname = 'resourceType';
      const buckets = interception.response?.body.aggregations[keyname].buckets;

      cy.get('app-result-header app-aggregation').as('searchAggregation');
      cy.get('@searchAggregation')
        .find('app-aggregation-bucket')
        .should('have.length', buckets.length);

      cy.get('@searchAggregation')
        .find('app-aggregation-bucket')
        .each((bucketEl, index) => {
          // FIXME: Text should be the translations
          const formattedCount = formatNumber(buckets[index].doc_count);
          cy.wrap(bucketEl).find('button > div').should('contain.text', `(${formattedCount})`);
          // TODO: Can we check the value of the icon dynamically? It is SVG
          cy.wrap(bucketEl).find('app-aggregation-bucket-decorator ng-icon').should('exist');
        });
    });
  });

  it('should display total results count and placeholder', () => {
    cy.wait('@apiSearchRecords').then((interception) => {
      const total = interception.response?.body.hits.total.value;
      const formattedTotal = formatNumber(total);

      cy.get('[data-testid="search-results-number"]').should(
        'contain.text',
        `${formattedTotal} results`,
      );

      cy.get('app-search-input input')
        .should('have.attr', 'placeholder')
        .and('contain', `Search over ${formattedTotal}`);
    });
  });

  it('should display result items in list view', () => {
    cy.wait('@apiSearchRecords').then((interception) => {
      const hits = interception.response?.body.hits.hits;

      cy.get('app-result-view').find('app-result-item-list').should('have.length', hits.length);

      cy.get('app-result-view')
        .find('app-result-item-list')
        .first()
        .within(() => {
          cy.get('a').should('have.attr', 'href', `/record/${hits[0]._id}`);
          cy.get('app-record-field-title span').should(
            'contain.text',
            hits[0]._source.resourceTitleObject.default,
          );
          cy.get('app-record-field-title span').should(
            'have.attr',
            'title',
            hits[0]._source.resourceTitleObject.default,
          );
          cy.get('app-record-field-type').should('contain.text', hits[0]._source.resourceType);
        });
    });
  });

  it('should switch to grid view', () => {
    cy.wait('@apiSearchRecords').then((interception) => {
      const hits = interception.response?.body.hits.hits;

      cy.get('app-result-layout-switcher [title="Grid view"]').click();
      cy.get('app-result-view').find('app-result-item-grid').should('have.length', hits.length);
    });
  });
});
