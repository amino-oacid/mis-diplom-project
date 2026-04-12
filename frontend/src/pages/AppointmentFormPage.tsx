import React from 'react';
import { Input, Button, Select, Alert } from '../components/common';
import { useAppointmentFormPresenter } from '../presenters/useAppointmentFormPresenter';
import { SearchIcon, UserIcon, CalendarIcon, CheckIcon } from '../components/icons';
import '../styles/appointments.css';

/**
 * Страница формы приема (при записи)
 */
export const AppointmentFormPage: React.FC = () => {
  const {
    formData,
    errors,
    isSubmitting,
    doctors,
    services,
    slots,
    isLoadingSlots,
    patientSearch,
    setPatientSearch,
    patientResults,
    selectedPatient,
    isSearchingPatients,
    handleChange,
    handleSelectPatient,
    handleClearPatient,
    handleSubmit,
    handleCancel,
  } = useAppointmentFormPresenter();

  const today = new Date().toISOString().split('T')[0];

  const serviceOptions = services.map((s) => ({
    value: s.id,
    label: `${s.name} — ${s.price} ₽`,
  }));

  return (
    <div className="page appointment-form-page">
      <header className="page-header">
        <div>
          <h1>Запись на приём</h1>
          <p className="page-subtitle">Создание новой записи пациента</p>
        </div>
      </header>

      {errors.general && <Alert type="error" message={errors.general} />}

      <form className="appointment-form-layout" onSubmit={handleSubmit} noValidate>
        <div className="form-left-column">
          <section className="card form-step">
            <div className="step-header">
              <span className="step-number">1</span>
              <h3>Выбор пациента</h3>
            </div>

            <div className="patient-search-section">
              <div className="search-bar">
                <SearchIcon size={20} />
                <input
                  type="text"
                  placeholder="Поиск по ФИО или телефону..."
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                />
              </div>
              {errors.patientId && <span className="error-text">{errors.patientId}</span>}

              {isSearchingPatients && (
                <div className="search-loading">
                  <div className="spinner"></div>
                  Поиск...
                </div>
              )}

              {patientResults.length > 0 && !selectedPatient && (
                <div className="patient-results">
                  {patientResults.map((p) => (
                    <div
                      key={p.id}
                      className="patient-result-item"
                      onClick={() => handleSelectPatient(p)}
                    >
                      <div className="patient-avatar">
                        <UserIcon size={20} />
                      </div>
                      <div className="patient-result-info">
                        <span className="patient-name">{p.fullName}</span>
                        <span className="patient-phone">{p.phone}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedPatient && (
                <div className="selected-patient-card">
                  <div className="patient-avatar">
                    <UserIcon size={24} />
                  </div>
                  <div className="selected-patient-info">
                    <span className="patient-name">{selectedPatient.fullName}</span>
                    <span className="patient-phone">{selectedPatient.phone}</span>
                  </div>
                  <button
                    type="button"
                    className="clear-patient-btn"
                    onClick={handleClearPatient}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </section>

          <section className="card form-step">
            <div className="step-header">
              <span className="step-number">2</span>
              <h3>Выбор врача</h3>
            </div>

            <div className="doctors-grid">
              {doctors.map((doctor) => (
                <label
                  key={doctor.id}
                  className={`doctor-card ${formData.doctorId === doctor.id ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="doctorId"
                    value={doctor.id}
                    checked={formData.doctorId === doctor.id}
                    onChange={handleChange('doctorId')}
                  />
                  <div className="doctor-avatar">
                    <UserIcon size={24} />
                  </div>
                  <div className="doctor-info">
                    <span className="doctor-name">{doctor.user.fullName}</span>
                    <span className="doctor-specialization">{doctor.specialization}</span>
                  </div>
                  {formData.doctorId === doctor.id && (
                    <div className="doctor-check">
                      <CheckIcon size={16} />
                    </div>
                  )}
                </label>
              ))}
            </div>
            {errors.doctorId && <span className="error-text">{errors.doctorId}</span>}

            <div className="service-select">
              <Select
                name="serviceId"
                label="Услуга"
                placeholder="Выберите услугу"
                value={formData.serviceId || ''}
                onChange={handleChange('serviceId')}
                options={serviceOptions}
                error={errors.serviceId}
              />
            </div>
          </section>
        </div>

        <div className="form-right-column">
          <section className="card form-step">
            <div className="step-header">
              <span className="step-number">3</span>
              <h3>Дата и время</h3>
            </div>

            <div className="date-time-section">
              <div className="calendar-input">
                <CalendarIcon size={20} />
                <Input
                  type="date"
                  name="appointmentDate"
                  label="Выберите дату"
                  value={formData.appointmentDate}
                  onChange={handleChange('appointmentDate')}
                  error={errors.appointmentDate}
                  min={today}
                />
              </div>

              {isLoadingSlots ? (
                <div className="slots-loading">
                  <div className="spinner"></div>
                  Загрузка доступного времени...
                </div>
              ) : slots.length > 0 ? (
                <div className="time-slots-section">
                  <label className="input-label">Доступное время</label>
                  <div className="time-slots-grid">
                    {slots.filter(s => s.available).map((slot) => (
                      <label
                        key={slot.startTime}
                        className={`time-slot ${formData.startTime === slot.startTime ? 'selected' : ''}`}
                      >
                        <input
                          type="radio"
                          name="startTime"
                          value={slot.startTime}
                          checked={formData.startTime === slot.startTime}
                          onChange={handleChange('startTime')}
                        />
                        {slot.startTime.slice(0, 5)}
                      </label>
                    ))}
                  </div>
                  {errors.startTime && <span className="error-text">{errors.startTime}</span>}
                </div>
              ) : formData.doctorId && formData.appointmentDate && formData.serviceId ? (
                <div className="no-slots-message">
                  На выбранную дату нет свободных слотов
                </div>
              ) : (
                <div className="slots-hint">
                  Выберите врача, услугу и дату для просмотра свободного времени
                </div>
              )}
            </div>

            <div className="form-actions">
              <Button type="button" variant="secondary" onClick={handleCancel}>
                Отмена
              </Button>
              <Button type="submit" loading={isSubmitting}>
                Создать запись
              </Button>
            </div>
          </section>
        </div>
      </form>
    </div>
  );
};

export default AppointmentFormPage;
