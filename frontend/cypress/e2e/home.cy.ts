import { formatNumber } from '../support/utils';

describe('Home Page', () => {
  beforeEach(() => {
    cy.initApp();
    cy.visit('/');
  });

  it('should initilialize the app by loading the configuration, the translations and run a global search', () => {
    cy.wait('@apiI18nGnui');
    cy.get('@apiI18nGnui.all').should('have.length', 1);
    cy.wait('@apiUiConfig');
    cy.get('@apiUiConfig.all').should('have.length', 1);
    cy.wait('@apiHomeSearch');
    cy.get('@apiHomeSearch.all').should('have.length', 1);
  });

  it('should load the catalogue general info', () => {
    cy.wait('@apiHomeSearch').then((interception) => {
      const total = interception.response?.body.hits.total.value;

      cy.get('app-aggregation').as('homeAggregation');
      const attr = cy
        .get('@homeAggregation')
        .invoke('attr', 'keyname')
        .then((keyname) => {
          if (keyname) {
            const buckets = interception.response?.body.aggregations[keyname].buckets;
            const decorator = interception.response?.body.aggregations[keyname].meta.decorator.map;

            cy.get('@homeAggregation')
              .find('app-aggregation-bucket')
              .as('buckets')
              .its('length')
              .should('eq', buckets.length);
            cy.get('@buckets').each((bucketEl, index) => {
              // FIXME: Text should be the translations
              cy.wrap(bucketEl)
                .find('[data-pc-section="content"] > p')
                .should('contain.text', buckets[index].key);
              cy.wrap(bucketEl)
                .find('[data-pc-section="content"] > div')
                .should('contain.text', buckets[index].doc_count);
              cy.wrap(bucketEl)
                .find('app-aggregation-bucket-decorator > div')
                .should(
                  'have.attr',
                  'style',
                  `background-image: url("${decorator[buckets[index].key]}");`,
                );
            });
          }
        });

      cy.get('app-search-input input')
        .should('have.attr', 'placeholder')
        .and('contain', `Search over ${formatNumber(total)}`);
    });
  });

  it('should navigate to Search page when clicking on Search button', () => {
    cy.wait('@apiHomeSearch');
    cy.get('app-search-input').find('[data-testid="search-button"]').as('searchButton');
    cy.get('@searchButton').should('have.attr', 'title', 'Search');
    cy.get('@searchButton').click();
    cy.url().should('include', '/search');
  });
});
