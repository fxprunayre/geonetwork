import { formatNumber, SURVAL_UUID } from '../support/utils';

describe('Search', () => {
  beforeEach(() => {
    cy.initApp();
  });

  it('should run a global search about the catalogue and one to get the results', () => {
    cy.visit('/search');
    cy.wait('@apiMainSearch');
    cy.get('@apiMainSearch.all').should('have.length', 1);
  });

  it('should run a search with query when route contains query parameter', () => {
    cy.visit(`/search?q=${SURVAL_UUID}`);
    cy.wait('@apiMainSearchByUuid');
    cy.get('@apiMainSearchByUuid.all').should('have.length', 1);
  });

  it('should display main aggregations correctly', () => {
    cy.visit('/search');
    cy.wait('@apiMainSearch').then((search) => {
      const keyname = 'resourceType';
      const buckets = search.response?.body.aggregations[keyname].buckets;

      cy.get('app-results app-aggregation').as('searchAggregation');
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
    cy.visit(`/search?q=${SURVAL_UUID}`);
    cy.wait('@apiMainSearchByUuid').then((search) => {
      const total = search.response?.body.hits.total.value;
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

  it('should have the sort by with default sort option', () => {
    cy.visit(`/search?q=${SURVAL_UUID}`);
    cy.wait('@apiMainSearchByUuid').then((search) => {
      cy.get('app-results-sorter').as('sortBy').should('exist');
      cy.get('@sortBy').find('p-select > span').should('contain.text', 'Popularity');
      cy.get('@sortBy')
        .click()
        .find('p-selectitem [aria-label="search.sort.options.resourceTitleObject.default.sort"]')
        .click();
      cy.get('@sortBy').find('p-select > span').should('contain.text', 'Title');
      cy.wait('@apiMainSearchByUuidSortTitle');
      cy.get('@apiMainSearchByUuidSortTitle.all').should('have.length', 1);
    });
  });
});
