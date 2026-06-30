import { SURVAL_UUID } from '../support/utils';

function generateSharingSettings(groupCount: number) {
  const privileges: Record<string, unknown>[] = [];

  if (groupCount >= 1) {
    privileges.push({
      group: 1,
      operations: {
        view: true,
        dynamic: true,
        download: true,
        notify: false,
        featured: false,
        editing: false,
        process: false,
      },
      reserved: true,
      recordPrivilege: false,
    });
  }

  if (groupCount >= 2) {
    privileges.push({
      group: 2,
      operations: {
        view: true,
        dynamic: true,
        download: true,
        notify: true,
        featured: false,
        editing: true,
        process: false,
      },
      reserved: false,
      recordPrivilege: true,
      userGroup: true,
      userProfiles: ['Editor', 'Reviewer'],
    });
  }

  for (let i = 3; i <= groupCount; i++) {
    privileges.push({
      group: i,
      operations: {
        view: i % 2 === 0,
        dynamic: i % 3 === 0,
        download: false,
        notify: false,
        featured: false,
        editing: i % 2 === 0,
        process: i % 5 === 0,
      },
      reserved: false,
      recordPrivilege: false,
      userGroup: i % 2 === 0,
      userProfiles: i % 2 === 0 ? ['Editor'] : [],
    });
  }

  return { groupOwner: '1', owner: '2', privileges };
}

describe('Record sharing by group panel', () => {
  beforeEach(() => {
    cy.initApp('editor');

    cy.intercept('PUT', `**/srv/api/records/${SURVAL_UUID}/sharing`, {
      statusCode: 204,
    }).as('saveSharingSettings');
  });

  function openSharingDialog() {
    cy.visitPage(`record/${SURVAL_UUID}`);
    cy.wait('@apiMainSearchGetRecord');
    cy.get('app-record-menu p-button button').click();
    cy.contains('.p-tieredmenu a', 'Share').click();
    cy.wait('@getSharingSettings');
    cy.get('@getSharingSettings.all').should('have.length', 1);
  }

  function setupSharingSettings(groupCount: number) {
    const settings = generateSharingSettings(groupCount);
    cy.intercept('GET', `**/srv/api/records/${SURVAL_UUID}/sharing`, (req) => {
      req.reply(settings);
    }).as('getSharingSettings');
  }
  describe('Modal', () => {
    it('should open the sharing dialog and display the sharing table', () => {
      setupSharingSettings(4);

      openSharingDialog();

      cy.get('app-record-sharing-by-group-panel').should('exist');
      cy.get('app-record-sharing-by-group-panel p-dialog').should('be.visible');

      cy.contains('p-dialog .p-dialog-header', 'Share').should('be.visible');

      cy.contains('p-dialog .p-dialog-content p', 'Share this record with specific groups.').should(
        'be.visible',
      );

      cy.get('app-record-sharing-by-group-panel p-dialog p-table').should('exist');

      const expectedThOrder = ['Group', 'Metadata', 'View', 'Download', 'Process', 'Edit'];
      cy.get('app-record-sharing-by-group-panel p-table th').each(($th, index) => {
        cy.wrap($th).should('contain', expectedThOrder[index]);
      });
    });
  });

  describe('Table', () => {
    it('should display group rows from sharing settings', () => {
      setupSharingSettings(4);

      openSharingDialog();

      cy.get('app-record-sharing-by-group-panel p-table tbody tr').should('have.length', 4);

      cy.contains('tr', 'Public access').should(
        'have.attr',
        'style',
        'background-color: var(--p-primary-200);',
      );
      cy.contains('td', 'Public access').should('exist');
      cy.contains('tr', 'group-2').should(
        'have.attr',
        'style',
        'background-color: var(--p-primary-100);',
      );
      cy.contains('td', 'group-2').should('exist');
      cy.contains('td', 'group-3').should('exist');
    });

    it('should show operation checkboxes for each group row', () => {
      const numberOfGroups = 4;
      const numberOfOperations = 5;
      setupSharingSettings(numberOfGroups);

      openSharingDialog();

      // Reserved and recordPrivilege group does not allow edit
      cy.get('app-record-sharing-by-group-panel p-table p-checkbox').should(
        'have.length',
        numberOfGroups * numberOfOperations - 2,
      );
    });

    it('should show filter input only when more than 10 groups (not reserved)', () => {
      setupSharingSettings(14);

      openSharingDialog();

      cy.get('app-record-sharing-by-group-panel p-table th')
        .eq(1)
        .find('input[placeholder="Type to search"]')
        .should('exist');
    });

    it('should hide filter input when 10 or fewer groups', () => {
      setupSharingSettings(10);

      openSharingDialog();

      cy.get('app-record-sharing-by-group-panel p-table th')
        .eq(1)
        .find('input[placeholder="Type to search"]')
        .should('not.exist');
    });
  });

  describe('Actions', () => {
    it('should check all checkboxes on double click on row label', () => {
      setupSharingSettings(4);

      openSharingDialog();

      cy.contains('tr', 'group-3').dblclick();
      cy.contains('tr', 'group-3')
        .parent('tr')
        .find('p-checkbox')
        .should('have.class', 'p-highlight');
    });

    it('should save sharing settings on confirm and close the dialog', () => {
      setupSharingSettings(4);

      openSharingDialog();

      cy.contains('p-dialog p-button button', 'Save').should('be.disabled');

      cy.get('app-record-sharing-by-group-panel p-table tbody tr')
        .contains('td', 'group-3')
        .parent('tr')
        .find('p-checkbox .p-checkbox-input')
        .click({ multiple: true, force: true });

      cy.contains('p-dialog p-button button', 'Save').should('not.be.disabled');

      cy.contains('p-dialog p-button', 'Save')
        .click()
        .then(() => {
          cy.wait('@saveSharingSettings');
          cy.get('@saveSharingSettings.all').should('have.length', 1);
          cy.get('app-record-sharing-by-group-panel p-dialog').should('not.exist');
        });
    });

    it('should close the dialog on cancel without saving', () => {
      setupSharingSettings(4);

      openSharingDialog();

      cy.contains('p-dialog p-button', 'Cancel')
        .click()
        .then(() => {
          cy.get('@saveSharingSettings.all').should('have.length', 0);
          cy.get('app-record-sharing-by-group-panel p-dialog').should('not.exist');
        });
    });

    it('should display an error message when loading sharing settings fails', () => {
      cy.intercept('GET', `**/srv/api/records/${SURVAL_UUID}/sharing`, {
        statusCode: 500,
        body: { error: 'Internal server error' },
      }).as('getSharingSettingsError');

      cy.visitPage(`record/${SURVAL_UUID}`);
      cy.wait('@apiMainSearchGetRecord');
      cy.get('app-record-menu p-button button').click();
      cy.contains('.p-tieredmenu a', 'Share').click();
      cy.wait('@getSharingSettingsError');

      cy.get('app-record-sharing-by-group-panel p-message[severity="error"]').should('be.visible');
    });
  });
});
