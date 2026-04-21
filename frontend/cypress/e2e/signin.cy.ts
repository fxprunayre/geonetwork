describe('Sign In Page', () => {
  beforeEach(() => {
    cy.initApp();
    cy.intercept('GET', '**/me', { body: false }).as('userInfo');
    cy.intercept('GET', '**/site/info/isCasEnabled', { body: true }).as('isCasEnabled');
  });

  it('should display the CAS action', () => {
    cy.visitPage('signin');
    cy.wait('@isCasEnabled');
    cy.get('a[title="Sign in with cas"]')
      .should('be.visible')
      .should('have.attr', 'href')
      .and('include', '/geonetwork/casRedirect?service=');
  });

  it.skip('should display the sign in form', () => {
    cy.visitPage('signin');

    cy.wait('@isCasEnabled');

    cy.wait('@userInfo');
    cy.get('@userInfo.all').should('have.length', 1);

    cy.get('app-sign-in-form').should('be.visible');

    cy.get('form').should('be.visible');

    cy.get('input[id="username"]').should('be.visible');
    cy.get('input[id="password"]').should('be.visible');

    cy.get('button[type="submit"]').should('be.visible').should('be.disabled');
  });

  it.skip('should allow user to sign in', () => {
    cy.intercept('POST', '**/signin', {
      statusCode: 200,
      body: {
        id: 1,
        name: 'admin',
        surname: 'admin',
        username: 'admin',
        profile: 'Administrator',
      },
    }).as('signIn');

    cy.visitPage('signin');
    cy.wait('@isCasEnabled');

    cy.get('input[id="username"]').type('admin');
    cy.get('input[id="password"]').type('admin');

    cy.get('button[type="submit"]').should('not.be.disabled').click();

    cy.wait('@signIn')
      .its('request.body')
      .should('include', 'username=admin')
      .and('include', 'password=admin');

    cy.location('pathname').should('eq', '/');
  });

  it.skip('should display error on sign in failure', () => {
    cy.intercept('POST', '**/signin', {
      statusCode: 401,
      body: 'Authentication failed',
    }).as('signInFailed');

    cy.visitPage('signin');
    cy.wait('@isCasEnabled');

    cy.get('input[id="username"]').type('wrong');
    cy.get('input[id="password"]').type('wrong');

    cy.get('button[type="submit"]').click();

    cy.wait('@signInFailed');

    cy.get('p-message[severity="error"]').should('be.visible');
  });
});
