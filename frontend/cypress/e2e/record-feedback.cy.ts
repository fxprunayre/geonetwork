import { SURVAL_UUID } from '../support/utils';

describe('Record page - Feedback panel', () => {
  beforeEach(() => {
    cy.initApp('editor');

    cy.intercept('GET', `**/userfeedback/ratingcriteria*`, {
      statusCode: 200,
      body: [
        {
          id: 1,
          name: 'Quality',
          label: {
            en: 'Quality#How useful is this resource?',
          },
        },
        {
          id: 2,
          name: 'Average',
          label: {
            en: 'Average#Auto-computed average',
          },
        },
      ],
    }).as('apiFeedbackRatingCriteria');
  });

  const visitDiscussionsTab = () => {
    cy.visitPage(`record/${SURVAL_UUID}`);
    cy.wait('@apiMainSearchGetRecord');
    cy.get('p-tablist p-tab[value="discussions"]').contains('Discussions').click();
  };

  const mockEmptyFeedback = () => {
    cy.intercept('GET', `**/records/${SURVAL_UUID}/userfeedback*`, {
      statusCode: 200,
      body: [],
    }).as('apiRecordFeedbackList');

    cy.intercept('GET', `**/records/${SURVAL_UUID}/userfeedbackrating*`, {
      statusCode: 200,
      body: {
        ratingAverages: {},
        userfeedbackCount: 0,
      },
    }).as('apiRecordFeedbackRating');
  };

  describe('with no feedback yet', () => {
    beforeEach(() => {
      mockEmptyFeedback();
      visitDiscussionsTab();

      cy.wait('@apiFeedbackRatingCriteria');
      cy.wait('@apiRecordFeedbackList');
      cy.wait('@apiRecordFeedbackRating');
    });

    it('should show the no reviews yet message when the panel is empty', () => {
      cy.get('app-feedback-panel').should('contain', 'No reviews yet');
    });

    it('should open and close the feedback dialog from discussions tab', () => {
      cy.get('app-feedback-panel p-button').contains('Write a review').click();

      cy.get('p-dialog').should('contain', 'Add your review');
      cy.get('app-feedback-new-form textarea[name="commentText"]').should('be.visible');
      cy.get('app-feedback-new-form').should(
        'contain',
        'Your review will be publicly visible after moderation.',
      );

      cy.contains('button', 'Cancel').click();
      cy.get('p-dialog').should('not.be.visible');
    });
  });

  describe('with existing feedback', () => {
    beforeEach(() => {
      cy.intercept('GET', `**/records/${SURVAL_UUID}/userfeedback*`, {
        statusCode: 200,
        body: [
          {
            uuid: 'review-1',
            metadataUUID: SURVAL_UUID,
            authorName: 'Alice Doe',
            authorOrganization: 'Ifremer',
            comment: 'Very useful dataset for monitoring.',
            date: '2026-07-28T10:00:00Z',
            ratingAVG: 4,
          },
        ],
      }).as('apiRecordFeedbackListWithReview');

      cy.intercept('GET', `**/records/${SURVAL_UUID}/userfeedbackrating*`, {
        statusCode: 200,
        body: {
          ratingAverages: {
            '1': 4,
          },
          userfeedbackCount: 1,
        },
      }).as('apiRecordFeedbackRatingWithReview');

      visitDiscussionsTab();

      cy.wait('@apiFeedbackRatingCriteria');
      cy.wait('@apiRecordFeedbackListWithReview');
      cy.wait('@apiRecordFeedbackRatingWithReview');
    });

    it('should render review author, date, rating, organization and comment', () => {
      cy.get('app-feedback-thread-item')
        .first()
        .within(() => {
          cy.contains('Alice Doe').should('be.visible');
          cy.contains('Ifremer').should('be.visible');
          cy.contains('Very useful dataset for monitoring.').should('be.visible');
          cy.get('p-rating').should('exist');
          cy.get('.text-xs.text-slate-500').should('not.be.empty');
        });
    });
  });

  describe('when submitting a review', () => {
    beforeEach(() => {
      mockEmptyFeedback();

      const createdFeedback = {
        uuid: 'review-1',
        metadataUUID: SURVAL_UUID,
        authorName: 'Editor User',
        authorOrganization: 'GeoNetwork',
        comment: 'This record is well documented and easy to reuse.',
        date: '2026-07-29T09:00:00Z',
        ratingAVG: 4,
        rating: {
          '1': 4,
        },
      };

      cy.intercept('POST', '**/userfeedback*', (req) => {
        expect(req.body.metadataUUID).to.equal(SURVAL_UUID);
        expect(req.body.comment).to.be.a('string');
        expect(req.body.comment.trim()).to.not.equal('');
        req.reply({
          statusCode: 200,
          body: '"review-1"',
        });
      }).as('apiCreateFeedback');

      cy.intercept('GET', '**/userfeedback/review-1', {
        statusCode: 200,
        body: createdFeedback,
      }).as('apiGetCreatedFeedback');

      visitDiscussionsTab();

      cy.wait('@apiFeedbackRatingCriteria');
      cy.wait('@apiRecordFeedbackList');
      cy.wait('@apiRecordFeedbackRating');
      cy.get('app-feedback-panel p-button').contains('Write a review').click();
      cy.get('p-dialog').should('contain', 'Add your review');
    });

    it('should submit a review and show the moderation success toast', () => {
      cy.get('app-feedback-new-form textarea[name="commentText"]').then(($textarea) => {
        const text = 'This record is well documented and easy to reuse.';
        cy.wrap($textarea).invoke('val', text).trigger('input').trigger('change');
      });

      cy.contains('button', 'Save review').click();

      cy.wait('@apiCreateFeedback');
      cy.wait('@apiGetCreatedFeedback');

      cy.get('p-toast').should('contain', 'Review submitted');
      cy.get('p-toast').should('contain', 'Your review was submitted and will be moderated soon.');

      cy.get('app-feedback-thread-item')
        .first()
        .within(() => {
          cy.contains('Editor User').should('be.visible');
          cy.contains('GeoNetwork').should('be.visible');
          cy.contains('This record is well documented and easy to reuse.').should('be.visible');
          cy.get('p-rating').should('exist');
          cy.get('.text-xs.text-slate-500').should('not.be.empty');
        });
    });
  });
});
