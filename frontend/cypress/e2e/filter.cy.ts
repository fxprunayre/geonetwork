import { AGGREGATION_LABEL_REGEX, formatNumber, SURVAL_UUID } from '../support/utils';

describe('Search', () => {
  beforeEach(() => {
    cy.initApp();
    cy.visit('/search');
  });

  it('should search the value from search box', () => {
    cy.wait('@apiMainSearch');
    cy.get('app-search-input input').type('surval{enter}');
    cy.wait('@apiMainSearchByQ').then((search) => {
      const query = search.request?.body.query.bool.must[0].query_string.query;
      expect(query).to.eq('surval');
      cy.url().should('include', 'q=surval');
    });
  });

  it('should display autocomplete when search box value change', () => {
    cy.wait('@apiMainSearch');
    cy.get('app-search-input input').type('surval');
    cy.wait('@apiMainSearchAutocomplete').then((search) => {
      const total = search.response?.body.hits.hits.length;
      cy.get('p-auto-complete p-overlay').as('autocompleteOverlay').should('exist');
      cy.get('@autocompleteOverlay')
        .get('li[role="option"]')
        .as('autocompleteOptions')
        .should('have.length', total);
      cy.get('@autocompleteOptions')
        .first()
        .then((option) => {
          const firstOptionText = option.text();
          cy.wrap(option).click();
          cy.get('app-search-input input').should('have.value', firstOptionText);
          cy.wait('@unmatchedSearchRequest').then((search) => {
            const query = search.request?.body.query.bool.must[0].query_string.query;
            expect(query).to.eq(firstOptionText);
            cy.url().should('include', `q=${encodeURIComponent(firstOptionText)}`);
          });
        });
    });
  });

  it('should clear filters on reset', () => {
    cy.wait('@apiMainSearch');
    cy.get('app-result-header app-aggregation app-aggregation-bucket button')
      .first()
      .then((button) => {
        cy.wrap(button).click();
        cy.wait('@apiMainSearchByResourceType');
        cy.get('app-search-active-filters-button p-button').should('have.length', 2);
        cy.get('app-search-active-filters-button p-button p-badge').click();
        cy.wait('@apiMainSearch');
        cy.get('app-search-active-filters-button p-button').should('have.length', 1);
      });
  });

  it('should open filter panel when filter button is clicked', () => {
    cy.get('app-search-active-filters-button p-button').first().click();
    cy.get('app-aggregations-panel').should('exist').and('be.visible');
  });

  it('should contains as many section as aggregation', () => {
    cy.get('app-search-active-filters-button p-button').first().click();
    cy.wait('@apiMainSearch').then((search) => {
      const aggregations = search.response?.body.aggregations;
      const aggregationKeys = Object.keys(aggregations);
      // FIXME: resourceType is displayed as top-level aggregation, so it is not in the panel
      // FIXME: filter aggegation is not displayed in the panel
      cy.get('app-aggregations-panel app-aggregation').should(
        'have.length',
        aggregationKeys.length - 1,
      );
    });
  });

  it('should search when button aggregation is clicked', () => {
    cy.wait('@apiMainSearch');
    cy.get('app-result-header app-aggregation app-aggregation-bucket button')
      .first()
      .then((button) => {
        const bucketText = button.text();
        const match = bucketText.match(/\(([\d,]+)\)/);
        const bucketCount = match ? parseInt(match[1].replace(/,/g, ''), 10) : 0;
        cy.wrap(button).click();
        cy.wait('@apiMainSearchByResourceType').then((search) => {
          const count = search.response?.body.hits.total.value;
          expect(count).to.eq(bucketCount);
          cy.get('app-search-active-filters-button p-button p-badge').should('contain.text', '1');
        });
      });
  });

  it('should search when checkbox aggregation is checked', () => {
    cy.get('app-search-active-filters-button p-button').first().click();
    cy.wait('@apiMainSearch');
    cy.get('app-aggregations-panel app-aggregation input[type="checkbox"]')
      .first()
      .then((checkbox) => {
        cy.wrap(checkbox).parent().parent().invoke('text').should('match', AGGREGATION_LABEL_REGEX);
        cy.wrap(checkbox).click({ force: true });
        cy.wait('@unmatchedSearchRequest');

        cy.wrap(checkbox)
          .parents('p-accordion-panel')
          .find('p-accordion-header p-overlaybadge')
          .should('exist');
      });
  });

  it('should search when multiselect aggregation option is selected', () => {
    cy.get('app-search-active-filters-button p-button').first().click();
    cy.wait('@apiMainSearch');
    cy.get('app-aggregations-panel app-aggregation p-multiselect')
      .first()
      .then((multiselect) => {
        cy.wrap(multiselect).click({ force: true });
        cy.get('li[pmultiselectitem]')
          .first()
          .then((option) => {
            cy.wrap(option).invoke('text').should('match', AGGREGATION_LABEL_REGEX);
            cy.wrap(option).click();
            cy.wait('@unmatchedSearchRequest');

            cy.wrap(multiselect)
              .parents('p-accordion-panel')
              .find('p-accordion-header p-overlaybadge')
              .should('exist');
          });
      });
  });
});
