import { SURVAL_UUID } from '../support/utils';

describe('Record spatial coverage', () => {
  const coverageSelector =
    '[data-testid="accordion-panel-coverage"] app-record-field-coverage-spatial';

  const mockUiConfig = (coverageSpatialDisplayType: 'image' | 'dynamicMap') => {
    cy.intercept('GET', '**/srv/api/ui/srv', {
      statusCode: 200,
      body: {
        id: 'srv',
        configuration: JSON.stringify({
          config: {
            apps: {
              record: {
                coverageSpatialDisplayType,
              },
            },
          },
        }),
      },
    }).as('apiUiConfig');
  };

  const mockRecordSpatial = (spatial: {
    shape?: Record<string, unknown> | Record<string, unknown>[];
    geom?: Record<string, unknown>;
  }) => {
    return cy.fixture('search-api-get-record-response.json').then((responseBody) => {
      const response = Cypress._.cloneDeep(responseBody);
      const source = response.hits.hits[0]._source;

      delete source.shape;
      delete source.shapeParsingError;
      delete source.geom;

      if ('shape' in spatial) {
        source.shape = spatial.shape;
      }
      if ('geom' in spatial) {
        source.geom = spatial.geom;
      }

      cy.intercept('POST', '**/search/records/_search*', (req) => {
        const body = Cypress._.isString(req.body) ? JSON.parse(req.body) : req.body;

        if (body?.query?.term?._id === SURVAL_UUID) {
          req.alias = 'apiSpatialRecord';
          req.reply({ body: response });
          return;
        }

        req.continue();
      });
    });
  };

  const visitRecord = () => {
    cy.visitPage(`record/${SURVAL_UUID}`);
    cy.wait('@apiUiConfig');
    cy.wait('@apiSpatialRecord');
    cy.wait('@getPermalink');
    cy.get(coverageSelector).should('exist');
  };

  const assertCoverageRenderer = (
    coverageSpatialDisplayType: 'image' | 'dynamicMap',
    options?: {
      srcIncludes?: string;
      srcNotIncludes?: string;
      expectedVisualCount?: number;
    },
  ) => {
    const expectedCount = options?.expectedVisualCount ?? 1;

    if (coverageSpatialDisplayType === 'dynamicMap') {
      cy.get(coverageSelector)
        .find('div.w-full.h-75.bg-slate-100')
        .should('have.length', expectedCount);
      cy.get(coverageSelector).find('img').should('have.length', 0);
      return;
    }

    cy.get(coverageSelector).find('img').should('have.length', expectedCount);
    if (options?.srcIncludes) {
      cy.get(coverageSelector)
        .find('img')
        .first()
        .should('have.attr', 'src')
        .and('include', options.srcIncludes);
    }
    if (options?.srcNotIncludes) {
      cy.get(coverageSelector)
        .find('img')
        .first()
        .should('have.attr', 'src')
        .and('not.include', options.srcNotIncludes);
    }
  };

  (['image', 'dynamicMap'] as const).forEach((coverageSpatialDisplayType) => {
    describe(`with coverageSpatialDisplayType=${coverageSpatialDisplayType}`, () => {
      beforeEach(() => {
        cy.initApp();
        mockUiConfig(coverageSpatialDisplayType);
        cy.intercept('GET', `**/records/${SURVAL_UUID}/permalink`).as('getPermalink');
      });

      it('uses shape when provided as a single GeoJSON object', () => {
        mockRecordSpatial({
          shape: {
            type: 'Polygon',
            coordinates: [
              [
                [1, 2],
                [3, 2],
                [3, 4],
                [1, 4],
                [1, 2],
              ],
            ],
          },
        });

        visitRecord();

        cy.get(coverageSelector)
          .find('[label="record.field.coverage.north"] input')
          .should('have.value', '4.00°');
        cy.get(coverageSelector)
          .find('[label="record.field.coverage.south"] input')
          .should('have.value', '2.00°');
        cy.get(coverageSelector)
          .find('[label="record.field.coverage.east"] input')
          .should('have.value', '3.00°');
        cy.get(coverageSelector)
          .find('[label="record.field.coverage.west"] input')
          .should('have.value', '1.00°');
        assertCoverageRenderer(coverageSpatialDisplayType, { expectedVisualCount: 1 });
      });

      it('uses shape in priority over geom', () => {
        mockRecordSpatial({
          shape: {
            type: 'Polygon',
            coordinates: [
              [
                [10, 20],
                [12, 20],
                [12, 21],
                [10, 21],
                [10, 20],
              ],
            ],
          },
          geom: {
            type: 'Point',
            coordinates: [-32.27, 37.28],
          },
        });

        visitRecord();

        cy.get(coverageSelector)
          .find('[label="record.field.coverage.north"] input')
          .should('have.value', '21.00°');
        cy.get(coverageSelector)
          .find('[label="record.field.coverage.west"] input')
          .should('have.value', '10.00°');
        assertCoverageRenderer(coverageSpatialDisplayType, {
          srcIncludes: 'POLYGON((',
          srcNotIncludes: 'POINT(-32.27 37.28)',
          expectedVisualCount: 1,
        });
      });

      it('supports shape as an array and displays a single combined map by default', () => {
        mockRecordSpatial({
          shape: [
            {
              type: 'Polygon',
              coordinates: [
                [
                  [0, 0],
                  [1, 0],
                  [1, 1],
                  [0, 1],
                  [0, 0],
                ],
              ],
            },
            {
              type: 'Polygon',
              coordinates: [
                [
                  [5, -3],
                  [7, -3],
                  [7, 2],
                  [5, 2],
                  [5, -3],
                ],
              ],
            },
          ],
        });

        visitRecord();

        cy.get(`${coverageSelector} .relative`).should('have.length', 1);
        cy.get(coverageSelector)
          .find('[label="record.field.coverage.north"] input')
          .should('have.value', '2.00°');
        cy.get(coverageSelector)
          .find('[label="record.field.coverage.south"] input')
          .should('have.value', '-3.00°');
        cy.get(coverageSelector)
          .find('[label="record.field.coverage.east"] input')
          .should('have.value', '7.00°');
        cy.get(coverageSelector)
          .find('[label="record.field.coverage.west"] input')
          .should('have.value', '0.00°');
        assertCoverageRenderer(coverageSpatialDisplayType, {
          srcIncludes: 'GEOMETRYCOLLECTION(',
          expectedVisualCount: 1,
        });
      });

      it('falls back to geom point when shape is not provided', () => {
        mockRecordSpatial({
          geom: {
            type: 'Point',
            coordinates: [-32.27, 37.28],
          },
        });

        visitRecord();

        cy.get(coverageSelector)
          .find('[label="record.field.coverage.north"] input')
          .should('have.value', '37.28°');
        cy.get(coverageSelector)
          .find('[label="record.field.coverage.south"] input')
          .should('have.value', '37.28°');
        cy.get(coverageSelector)
          .find('[label="record.field.coverage.east"] input')
          .should('have.value', '-32.27°');
        cy.get(coverageSelector)
          .find('[label="record.field.coverage.west"] input')
          .should('have.value', '-32.27°');
        assertCoverageRenderer(coverageSpatialDisplayType, {
          srcIncludes: 'POINT(-32.27 37.28)',
          expectedVisualCount: 1,
        });
      });
    });
  });
});
