/// <reference types="cypress" />

describe('Пациенты - Форма создания/редактирования', () => {
  beforeEach(() => {
    cy.fixture('auth').then((auth) => {
      cy.intercept('GET', '**/api/auth/me', {
        statusCode: 200,
        body: { success: true, data: auth.currentUser }
      }).as('getCurrentUser');
    });
  });

  describe('Создание нового пациента', () => {
    beforeEach(() => {
      cy.visitWithAuth('/patients/new');
    });

    it('Проверка отображения формы создания пациента', () => {
      cy.get('h1').should('contain', 'Новый пациент');
      cy.get('form').should('be.visible');
      cy.get('input[name="lastName"]').should('be.visible');
      cy.get('input[name="firstName"]').should('be.visible');
    });

    it('Проверка успешного создания нового пациента', () => {
      cy.fixture('patients').then((patients) => {
        cy.intercept('POST', '**/api/patients', {
          statusCode: 201,
          body: { success: true, data: patients.createdPatient }
        }).as('createPatient');

        cy.intercept('GET', '**/api/patients*', {
          statusCode: 200,
          body: { success: true, data: patients.list.data, pagination: { page: 1, limit: 10, total: 3, pages: 1 } }
        }).as('getPatients');

        cy.get('input[name="lastName"]').type(patients.newPatient.lastName);
        cy.get('input[name="firstName"]').type(patients.newPatient.firstName);
        cy.get('input[name="middleName"]').type(patients.newPatient.middleName);
        cy.get('input[name="birthDate"]').type(patients.newPatient.birthDate);
        cy.get('select[name="gender"]').select('male');
        cy.get('input[name="phone"]').type(patients.newPatient.phone);

        cy.get('button[type="submit"]').click();

        // Проверка тела запроса
        cy.wait('@createPatient').then((interception) => {
          expect(interception.request.body).to.have.property('lastName', patients.newPatient.lastName);
          expect(interception.request.body).to.have.property('firstName', patients.newPatient.firstName);
          expect(interception.request.body).to.have.property('gender', 'male');
        });

        // Проверка редиректа
        cy.url().should('include', '/patients');
      });
    });
  });

  describe('Редактирование пациента', () => {
    beforeEach(() => {
      cy.fixture('patients').then((patients) => {
        cy.intercept('GET', '**/api/patients/1', {
          statusCode: 200,
          body: { success: true, data: patients.list.data[0] }
        }).as('getPatient');
      });

      cy.visitWithAuth('/patients/1');
    });

    it('Проверка отображения формы с данными пациента', () => {
      cy.wait('@getPatient');
      cy.get('h1').should('contain', 'Редактирование');
      cy.get('input[name="lastName"]').should('have.value', 'Петров');
    });

    it('Проверка успешного обновления данных пациента', () => {
      cy.wait('@getPatient');

      cy.fixture('patients').then((patients) => {
        cy.intercept('PUT', '**/api/patients/1', {
          statusCode: 200,
          body: { success: true, data: patients.list.data[0] }
        }).as('updatePatient');

        cy.intercept('GET', '**/api/patients*', {
          statusCode: 200,
          body: { success: true, data: patients.list.data, pagination: { page: 1, limit: 10, total: 3, pages: 1 } }
        }).as('getPatients');

        const newPhone = '+79001112233';
        cy.get('input[name="phone"]').clear().type(newPhone);
        cy.get('button[type="submit"]').click();

        // Проверка тела запроса
        cy.wait('@updatePatient').then((interception) => {
          expect(interception.request.body).to.have.property('phone', newPhone);
        });

        // Проверка редиректа
        cy.url().should('include', '/patients');
        cy.wait('@getPatients');
      });
    });
  });
});
