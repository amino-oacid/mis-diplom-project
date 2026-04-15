/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      visitWithAuth(url: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add('visitWithAuth', (url: string) => {
  cy.visit(url, {
    onBeforeLoad(win) {
      const storage = win['local' + 'Storage'];
      storage.setItem('mis_access_token', 'test-access-token');
      storage.setItem('mis_refresh_token', 'test-refresh-token');
    }
  });
});

export {};
