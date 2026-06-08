import { SURVAL_UUID } from '../support/utils';

const NEWER_VERSION_UUID = '00000000-0000-0000-0000-000000000002';
const OLDER_VERSION_UUID = '00000000-0000-0000-0000-000000000001';

describe('Record page - Versions', () => {
  beforeEach(() => {
    cy.initApp();
    cy.intercept('GET', `**/records/${SURVAL_UUID}/permalink`).as('getPermalink');
  });

  const mockRecordVersions = (currentIsLatest: boolean) => {
    cy.fixture('search-api-get-record-request.json').then((getRecordRequest) => {
      cy.fixture('search-api-get-record-response.json').then((getRecordResponse) => {
        const responseWithVersions = Cypress._.cloneDeep(getRecordResponse);
        const currentRecord = responseWithVersions.hits.hits[0];

        currentRecord.related = currentRecord.related || {};

        const currentVersion = {
          uuid: SURVAL_UUID,
          info: { _id: SURVAL_UUID },
          resourceTitleObject: {
            default: 'Données par paramètre',
            langfre: 'Données par paramètre',
          },
          resourceDate: [
            {
              type: 'revision',
              date: '2026-01-01T00:00:00.000Z',
            },
          ],
          overview: currentRecord.overview || [],
        };

        const olderVersion = {
          uuid: OLDER_VERSION_UUID,
          info: { _id: OLDER_VERSION_UUID },
          resourceTitleObject: {
            default: 'Données par paramètre (older version)',
            langfre: 'Données par paramètre (older version)',
          },
          resourceDate: [
            {
              type: 'revision',
              date: '2024-01-01T00:00:00.000Z',
            },
          ],
          overview: currentRecord.overview || [],
        };

        const newerVersion = {
          uuid: NEWER_VERSION_UUID,
          info: { _id: NEWER_VERSION_UUID },
          resourceTitleObject: {
            default: 'Données par paramètre (newer version)',
            langfre: 'Données par paramètre (newer version)',
          },
          resourceDate: [
            {
              type: 'revision',
              date: '2027-01-01T00:00:00.000Z',
            },
          ],
          overview: currentRecord.overview || [],
        };

        currentRecord.related.versions = currentIsLatest
          ? [currentVersion, olderVersion]
          : [newerVersion, currentVersion, olderVersion];

        cy.intercept('POST', '**/search/records/_search*', (req) => {
          const body = Cypress._.isString(req.body) ? JSON.parse(req.body) : req.body;

          if (Cypress._.isEqual(body, getRecordRequest)) {
            req.alias = 'apiMainSearchGetRecordWithVersions';
            req.reply({ body: responseWithVersions });
          }
        });
      });
    });
  };

  it('should display record versions and open the version history popover', () => {
    mockRecordVersions(true);

    cy.visitPage(`record/${SURVAL_UUID}`);
    cy.wait('@apiMainSearchGetRecordWithVersions');
    cy.wait('@getPermalink');

    cy.get('app-record-versions').should('be.visible').and('contain.text', 'Past versions');

    cy.contains('app-record-versions span', 'Past versions').click();

    cy.get('.p-popover').should('be.visible').and('contain.text', 'Version history');
    cy.get('.p-popover app-result-item-list').should('have.length', 2);

    cy.get('.p-popover p-overlaybadge')
      .should('have.length', 1)
      .and('contain.text', 'Current')
      .within(() => {
        cy.get('app-result-item-list').should('have.length', 1);
        cy.get('app-result-item-list').should('contain.text', 'Données par paramètre');
      });

    cy.get('.p-popover p-overlaybadge')
      .parent()
      .next()
      .should('contain.text', 'Données par paramètre (older version)');
  });

  it('should display newer version available when current record is not latest', () => {
    mockRecordVersions(false);

    cy.visitPage(`record/${SURVAL_UUID}`);
    cy.wait('@apiMainSearchGetRecordWithVersions');
    cy.wait('@getPermalink');

    cy.get('app-record-versions').should('contain.text', 'Newer version available');
    cy.get('app-record-versions a')
      .contains('Newer version available')
      .should('have.attr', 'href')
      .and('include', `/record/${NEWER_VERSION_UUID}`);
    cy.get('app-record-versions').should('contain.text', 'All versions');
  });
});
