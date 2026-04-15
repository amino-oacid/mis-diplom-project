/// <reference types="cypress" />

describe('Склад - Список материалов', () => {
  beforeEach(() => {
    cy.fixture('auth').then((auth) => {
      cy.intercept('GET', '**/api/auth/me', {
        statusCode: 200,
        body: { success: true, data: auth.currentUser }
      }).as('getCurrentUser');
    });

    cy.fixture('inventory').then((inventory) => {
      cy.intercept('GET', '**/api/inventory/stats', {
        statusCode: 200,
        body: { success: true, data: inventory.stats }
      }).as('getInventoryStats');

      cy.intercept('GET', '**/api/inventory/log*', {
        statusCode: 200,
        body: { success: true, data: [] }
      }).as('getInventoryLog');

      cy.intercept({
        method: 'GET',
        pathname: '**/api/inventory'
      }, {
        statusCode: 200,
        body: {
          success: true,
          data: inventory.list.data,
          pagination: { page: 1, limit: 10, total: 4, pages: 1 }
        }
      }).as('getInventory');

      cy.intercept('POST', '**/api/inventory/*/income', {
        statusCode: 200,
        body: { success: true, data: { ...inventory.list.data[0], quantity: 160 } }
      }).as('incomeInventory');

      cy.intercept('POST', '**/api/inventory/*/expense', {
        statusCode: 200,
        body: { success: true, data: { ...inventory.list.data[0], quantity: 145 } }
      }).as('expenseInventory');
    });

    cy.visitWithAuth('/inventory');
  });

  it('Проверка отображения заголовка страницы', () => {
    cy.get('h1').should('contain', 'Склад');
  });

  it('Проверка отображения списка материалов в таблице', () => {
    cy.wait('@getInventory');
    cy.get('table').should('be.visible');
    cy.get('table tbody tr').should('have.length.at.least', 1);
  });

  it('Проверка отображения кнопки добавления позиции', () => {
    cy.contains('Добавить позицию').should('be.visible');
  });

  it('Проверка открытия модального окна прихода', () => {
    cy.wait('@getInventory');
    cy.contains('+ Приход').first().click();
    cy.get('.modal').should('be.visible');
  });

  it('Проверка выполнения приход материала', () => {
    cy.wait('@getInventory');
    cy.contains('+ Приход').first().click();
    cy.get('.modal input[type="number"]').clear().type('{selectall}10');
    cy.contains('Оприходовать').click();

    cy.wait('@incomeInventory').then((interception) => {
      expect(interception.request.body).to.have.property('quantity', 10);
    });

    cy.get('.modal').should('not.exist');
  });

  it('Проверка выполнения списания материала', () => {
    cy.wait('@getInventory');
    cy.contains('Списать').first().click();
    cy.get('.modal input[type="number"]').clear().type('{selectall}5');
    cy.get('.modal').contains('Списать').click();

    cy.wait('@expenseInventory').then((interception) => {
      expect(interception.request.body).to.have.property('quantity', 5);
    });

    cy.get('.modal').should('not.exist');
  });
});
