import React from 'react';
import { Input, Button, Select, Alert } from '../components/common';
import { usePatientFormPresenter } from '../presenters/usePatientFormPresenter';
import '../styles/patients.css';

/**
 * Страница формы медкарты пациента (для редактирования или создания)
 */
export const PatientFormPage: React.FC = () => {
  const {
    formData,
    errors,
    isLoading,
    isSubmitting,
    isEditMode,
    handleChange,
    handleSubmit,
    handleCancel,
  } = usePatientFormPresenter();

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner-large" />
        <p>Загрузка...</p>
      </div>
    );
  }

  const genderOptions = [
    { value: 'male', label: 'Мужской' },
    { value: 'female', label: 'Женский' },
  ];

  return (
    <div className="page patient-form-page">
      <div className="page-header">
        <h1>{isEditMode ? 'Редактирование пациента' : 'Новый пациент'}</h1>
      </div>

      <form className="form-card" onSubmit={handleSubmit} noValidate>
        {errors.general && <Alert type="error" message={errors.general} />}

        <div className="form-section">
          <h3>Основная информация</h3>

          <div className="form-row">
            <Input
              type="text"
              name="lastName"
              label="Фамилия *"
              placeholder="Иванов"
              value={formData.lastName}
              onChange={handleChange('lastName')}
              error={errors.lastName}
            />

            <Input
              type="text"
              name="firstName"
              label="Имя *"
              placeholder="Иван"
              value={formData.firstName}
              onChange={handleChange('firstName')}
              error={errors.firstName}
            />

            <Input
              type="text"
              name="middleName"
              label="Отчество"
              placeholder="Иванович"
              value={formData.middleName || ''}
              onChange={handleChange('middleName')}
              error={errors.middleName}
            />
          </div>

          <div className="form-row">
            <Input
              type="date"
              name="birthDate"
              label="Дата рождения *"
              value={formData.birthDate}
              onChange={handleChange('birthDate')}
              error={errors.birthDate}
            />

            <Select
              name="gender"
              label="Пол *"
              value={formData.gender}
              onChange={handleChange('gender')}
              options={genderOptions}
              error={errors.gender}
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Контактные данные</h3>

          <div className="form-row">
            <Input
              type="tel"
              name="phone"
              label="Телефон *"
              placeholder="+7 (999) 123-45-67"
              value={formData.phone}
              onChange={handleChange('phone')}
              error={errors.phone}
            />

            <Input
              type="email"
              name="email"
              label="Email"
              placeholder="email@example.com"
              value={formData.email}
              onChange={handleChange('email')}
              error={errors.email}
            />
          </div>

          <Input
            type="text"
            name="address"
            label="Адрес"
            placeholder="г. Москва, ул. Примерная, д. 1"
            value={formData.address}
            onChange={handleChange('address')}
          />
        </div>

        <div className="form-section">
          <h3>Документы</h3>

          <div className="form-row">
            <Input
              type="text"
              name="passportSeries"
              label="Серия паспорта"
              placeholder="1234"
              value={formData.passportSeries}
              onChange={handleChange('passportSeries')}
            />

            <Input
              type="text"
              name="passportNumber"
              label="Номер паспорта"
              placeholder="567890"
              value={formData.passportNumber}
              onChange={handleChange('passportNumber')}
            />
          </div>

          <Input
            type="text"
            name="insurancePolicy"
            label="Номер полиса ОМС"
            placeholder="1234567890123456"
            value={formData.insurancePolicy || ''}
            onChange={handleChange('insurancePolicy')}
          />
        </div>

        <div className="form-actions">
          <Button type="button" variant="secondary" onClick={handleCancel}>
            Отмена
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {isEditMode ? 'Сохранить' : 'Создать'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PatientFormPage;
