/// <reference types="cypress" />

describe('Приёмы - Список приёмов', () => {
  beforeEach(() => {
    cy.fixture('auth').then((auth) => {
      cy.intercept('GET', '**/api/auth/me', {
        statusCode: 200,
        body: { success: true, data: auth.currentUser }
      }).as('getCurrentUser');
    });

    cy.fixture('appointments').then((appointments) => {
      cy.intercept('GET', '**/api/appointments*', {
        statusCode: 200,
        body: {
          success: true,
          data: appointments.list.data,
          pagination: { page: 1, limit: 10, total: 3, pages: 1 }
        }
      }).as('getAppointments');
    });

    cy.visitWithAuth('/appointments');
  });

  it('Проверка отображения заголовка страницы', () => {
    cy.get('h1').should('contain', 'Приёмы');
  });

  it('Проверка отображения списка приёмов в таблице', () => {
    cy.wait('@getAppointments');
    cy.get('table').should('be.visible');
    cy.get('table tbody tr').should('have.length.at.least', 1);
  });

  it('Проверка отображения кнопки создания нового приёма', () => {
    cy.contains('Новая запись').should('be.visible');
  });

  it('Проверка перехода на страницу создания приёма', () => {
    cy.fixture('patients').then((patients) => {
      cy.intercept('GET', '**/api/patients*', {
        statusCode: 200,
        body: { success: true, data: patients.list.data, pagination: { page: 1, limit: 10, total: 3, pages: 1 } }
      });
    });

    cy.fixture('services').then((services) => {
      cy.intercept('GET', '**/api/services*', {
        statusCode: 200,
        body: { success: true, data: services.list }
      });
    });

    cy.fixture('doctors').then((doctors) => {
      cy.intercept('GET', '**/api/doctors*', {
        statusCode: 200,
        body: { success: true, data: doctors.list }
      });
    });

    cy.contains('Новая запись').click();
    cy.url().should('include', '/appointments/new');
  });

  it('Проверка открытия деталей приёма при клике на строку', () => {
    cy.wait('@getAppointments');

    cy.fixture('appointments').then((appointments) => {
      cy.intercept('GET', '**/api/appointments/1', {
        statusCode: 200,
        body: { success: true, data: appointments.list.data[0] }
      });

      cy.intercept('GET', '**/api/prescriptions/appointment/1*', {
        statusCode: 200,
        body: { success: true, data: [] }
      });
    });

    cy.get('table tbody tr').first().click();
    cy.url().should('include', '/appointments/1');
  });
});
