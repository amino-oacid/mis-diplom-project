/// <reference types="cypress" />

describe('Склад - Форма создания/просмотра', () => {
  beforeEach(() => {
    cy.fixture('auth').then((auth) => {
      cy.intercept('GET', '**/api/auth/me', {
        statusCode: 200,
        body: { success: true, data: auth.currentUser }
      }).as('getCurrentUser');
    });
  });

  describe('Создание новой позиции', () => {
    beforeEach(() => {
      cy.visitWithAuth('/inventory/new');
    });

    it('Проверка отображения формы создания позиции', () => {
      cy.get('h1').should('contain', 'Новая позиция');
      cy.get('form').should('be.visible');
      cy.get('input[name="name"]').should('be.visible');
    });

    it('Проверка успешного создания новой позиции', () => {
      cy.fixture('inventory').then((inventory) => {
        cy.intercept('POST', '**/api/inventory', {
          statusCode: 201,
          body: { success: true, data: inventory.createdItem }
        }).as('createInventory');

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
          body: { success: true, data: inventory.list.data, pagination: { page: 1, limit: 10, total: 4, pages: 1 } }
        }).as('getInventory');

        cy.get('input[name="name"]').type(inventory.newItem.name);
        cy.get('select[name="type"]').select('medication');
        cy.get('select[name="unit"]').select('шт');
        cy.get('input[name="quantity"]').clear().type('{selectall}' + String(inventory.newItem.quantity));
        cy.get('input[name="minQuantity"]').clear().type('{selectall}' + String(inventory.newItem.minQuantity));
        cy.get('input[name="purchasePrice"]').clear().type('{selectall}' + String(inventory.newItem.purchasePrice));

        cy.get('button[type="submit"]').click();

        // Проверка тела запроса
        cy.wait('@createInventory').then((interception) => {
          expect(interception.request.body).to.have.property('name', inventory.newItem.name);
          expect(interception.request.body).to.have.property('type', 'medication');
          expect(interception.request.body).to.have.property('unit', 'шт');
          expect(interception.request.body).to.have.property('quantity', inventory.newItem.quantity);
          expect(interception.request.body).to.have.property('minQuantity', inventory.newItem.minQuantity);
          expect(interception.request.body).to.have.property('purchasePrice', inventory.newItem.purchasePrice);
        });

        // Проверка редиректа
        cy.url().should('include', '/inventory');
      });
    });
  });

  describe('Просмотр позиции', () => {
    beforeEach(() => {
      cy.fixture('inventory').then((inventory) => {
        cy.intercept('GET', '**/api/inventory/1', {
          statusCode: 200,
          body: { success: true, data: inventory.list.data[0] }
        }).as('getInventoryItem');
      });

      cy.visitWithAuth('/inventory/1');
    });

    it('Проверка отображения данных позиции', () => {
      cy.wait('@getInventoryItem');
      cy.get('h1').should('contain', 'Просмотр позиции');
      cy.contains('Парацетамол 500мг').should('be.visible');
    });
  });
});
