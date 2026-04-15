/// <reference types="cypress" />

describe('Дашборд - Главная панель', () => {
  beforeEach(() => {
    cy.fixture('auth').then((auth) => {
      cy.intercept('GET', '**/api/auth/me', {
        statusCode: 200,
        body: { success: true, data: auth.currentUser }
      }).as('getCurrentUser');
    });

    cy.fixture('dashboard').then((dashboard) => {
      cy.intercept('GET', '**/api/reports/summary', {
        statusCode: 200,
        body: { success: true, data: dashboard.summary }
      }).as('getDashboardSummary');

      cy.intercept('GET', '**/api/appointments/today', {
        statusCode: 200,
        body: { success: true, data: dashboard.recentAppointments }
      }).as('getTodayAppointments');
    });

    cy.visitWithAuth('/dashboard');
  });

  it('Проверка отображения заголовка панели управления', () => {
    cy.get('h1').should('contain', 'Панель управления');
  });

  it('Проверка отображения карточки статистики', () => {
    cy.wait('@getDashboardSummary');
    cy.get('.stats-grid').should('be.visible');
  });

  it('Проверка отображения быстрых действий', () => {
    cy.get('.quick-actions').should('be.visible');
    cy.contains('Записать пациента').should('be.visible');
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

    cy.contains('Записать пациента').click();
    cy.url().should('include', '/appointments/new');
  });

  it('Проверка перехода на страницу списка пациентов', () => {
    cy.fixture('patients').then((patients) => {
      cy.intercept('GET', '**/api/patients*', {
        statusCode: 200,
        body: { success: true, data: patients.list.data, pagination: { page: 1, limit: 10, total: 3, pages: 1 } }
      }).as('getPatients');
    });

    cy.contains('Найти пациента').click();
    cy.url().should('include', '/patients');
  });

  it('Проверка перехода на страницу расписания', () => {
    cy.fixture('doctors').then((doctors) => {
      cy.intercept('GET', '**/api/doctors', {
        statusCode: 200,
        body: { success: true, data: doctors.list }
      }).as('getDoctors');
    });

    cy.fixture('appointments').then((appointments) => {
      cy.intercept('GET', '**/api/appointments*', {
        statusCode: 200,
        body: { success: true, data: appointments.list.data, pagination: { page: 1, limit: 10, total: 3, pages: 1 } }
      }).as('getAppointments');
    });

    cy.contains('Посмотреть расписание').click();
    cy.url().should('include', '/schedule');
  });
});
