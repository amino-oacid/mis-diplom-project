/// <reference types="cypress" />

describe('Приёмы - Создание нового приёма', () => {
  beforeEach(() => {
    cy.fixture('auth').then((auth) => {
      cy.intercept('GET', '**/api/auth/me', {
        statusCode: 200,
        body: { success: true, data: auth.doctorLoginResponse.user }
      }).as('getCurrentUser');
    });

    cy.fixture('doctors').then((doctors) => {
      cy.intercept('GET', '**/api/doctors', {
        statusCode: 200,
        body: { success: true, data: doctors.list }
      }).as('getDoctors');
    });

    cy.fixture('services').then((services) => {
      cy.intercept('GET', '**/api/services', {
        statusCode: 200,
        body: { success: true, data: services.list }
      }).as('getServices');
    });

    cy.fixture('patients').then((patients) => {
      cy.intercept('GET', '**/api/patients*', {
        statusCode: 200,
        body: {
          success: true,
          data: patients.list.data,
          pagination: { page: 1, limit: 10, total: 3, pages: 1 }
        }
      }).as('searchPatients');
    });

    cy.fixture('appointments').then((appointments) => {
      cy.intercept('GET', '**/api/appointments/slots*', {
        statusCode: 200,
        body: { success: true, data: appointments.timeSlots }
      }).as('getTimeSlots');
    });

    cy.visitWithAuth('/appointments/new');

    cy.wait(['@getDoctors', '@getServices']);
  });

  it('Проверка отображения формы создания приёма', () => {
    cy.get('h1').should('contain', 'Запись на приём');
    cy.get('form').should('be.visible');
  });

  it('Проверка отображения списка врачей', () => {
    cy.get('.doctors-grid').should('be.visible');
    cy.get('.doctor-card').should('have.length.at.least', 1);
  });

  it('Проверка успешного создания нового приёма', () => {
    cy.fixture('appointments').then((appointments) => {
      cy.intercept('POST', '**/api/appointments', {
        statusCode: 201,
        body: { success: true, data: appointments.list.data[0] }
      }).as('createAppointment');

      cy.intercept('GET', '**/api/appointments*', {
        statusCode: 200,
        body: { success: true, data: appointments.list.data, pagination: { page: 1, limit: 10, total: 3, pages: 1 } }
      }).as('getAppointments');
    });

    // 1. Поиск и выбор пациента
    cy.get('input[placeholder*="Поиск"]').type('Петров');
    cy.wait('@searchPatients');
    cy.get('.patient-result-item').first().click();

    // 2. Выбор врача (radio button)
    cy.get('.doctor-card').first().click();

    // 3. Выбор услуги
    cy.get('select[name="serviceId"]').select('1');

    // 4. Выбор даты
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    cy.get('input[name="appointmentDate"]').type(dateStr);

    // 5. Ожидаем загрузки слотов и выбираем время
    cy.wait('@getTimeSlots');
    cy.get('.time-slot').first().click();

    // 6. Отправка формы
    cy.get('button[type="submit"]').click();

    // Проверка тела запроса
    cy.wait('@createAppointment').then((interception) => {
      expect(interception.request.body).to.have.property('patientId', 1);
      expect(interception.request.body).to.have.property('doctorId');
      expect(interception.request.body).to.have.property('serviceId', 1);
      expect(interception.request.body).to.have.property('appointmentDate');
      expect(interception.request.body).to.have.property('startTime', '09:00:00');
    });

    // Проверка редиректа и отображения приёма в списке
    cy.url().should('include', '/appointments');
    cy.wait('@getAppointments');
    cy.contains('Петров Петр Петрович').should('be.visible');
  });

  it('Проверка отмены создания приема', () => {
    cy.fixture('appointments').then((appointments) => {
      cy.intercept('GET', '**/api/appointments*', {
        statusCode: 200,
        body: { success: true, data: appointments.list.data, pagination: { page: 1, limit: 10, total: 3, pages: 1 } }
      }).as('getAppointments');
    });

    cy.contains('Отмена').click();
    cy.url().should('include', '/appointments');
  });
});
