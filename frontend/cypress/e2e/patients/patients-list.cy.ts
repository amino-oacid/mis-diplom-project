/// <reference types="cypress" />

describe('Пациенты - Список пациентов', () => {
  beforeEach(() => {
    cy.fixture('auth').then((auth) => {
      cy.intercept('GET', '**/api/auth/me', {
        statusCode: 200,
        body: { success: true, data: auth.currentUser }
      }).as('getCurrentUser');
    });

    cy.fixture('patients').then((patients) => {
      cy.intercept('GET', '**/api/patients*', {
        statusCode: 200,
        body: {
          success: true,
          data: patients.list.data,
          pagination: { page: 1, limit: 10, total: 3, pages: 1 }
        }
      }).as('getPatients');
    });

    cy.visitWithAuth('/patients');
  });

  it('Проверка отображения заголовка страницы', () => {
    cy.get('h1').should('contain', 'Пациенты');
  });

  it('Проверка отображения списка пациентов в таблице', () => {
    cy.wait('@getPatients');
    cy.get('table').should('be.visible');
    cy.get('table tbody tr').should('have.length.at.least', 1);
  });

  it('Проверка отображения кнопки добавления пациента', () => {
    cy.contains('Добавить пациента').should('be.visible');
  });

  it('Проверка перехода на страницу создания пациента', () => {
    cy.contains('Добавить пациента').click();
    cy.url().should('include', '/patients/new');
  });

  it('Проверка открытия медкарты пациента', () => {
    cy.fixture('patients').then((patients) => {
      cy.intercept('GET', '**/api/patients/1', {
        statusCode: 200,
        body: { success: true, data: patients.list.data[0] }
      }).as('getPatient');

      cy.intercept('GET', '**/api/patients/1/appointments*', {
        statusCode: 200,
        body: { success: true, data: [] }
      }).as('getPatientAppointments');

      cy.intercept('GET', '**/api/prescriptions/patient/1*', {
        statusCode: 200,
        body: { success: true, data: [] }
      }).as('getPatientPrescriptions');

      cy.intercept('GET', '**/api/medical-records/patient/1', {
        statusCode: 200,
        body: { success: true, data: null }
      }).as('getMedicalRecord');

      cy.intercept('GET', '**/api/medical-records/patient/1/history*', {
        statusCode: 200,
        body: { success: true, data: [] }
      }).as('getMedicalHistory');

      cy.intercept('GET', '**/api/medical-records/patient/1/prescriptions*', {
        statusCode: 200,
        body: { success: true, data: [] }
      }).as('getMedicalPrescriptions');
    });

    cy.intercept('POST', '**/api/auth/refresh', {
      statusCode: 200,
      body: { success: true, data: { accessToken: 'test-token', refreshToken: 'test-token' } }
    }).as('refreshToken');

    cy.wait('@getPatients');
    cy.contains('Карта').first().click();
    cy.url().should('include', '/patients/1/card');
  });
});
