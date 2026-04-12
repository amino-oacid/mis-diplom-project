import React from 'react';
import { Input, Button, Alert } from '../components/common';
import { useProfilePresenter } from '../presenters/useProfilePresenter';
import { UserIcon } from '../components/icons';
import '../styles/profile.css';

/**
 * Страница профиля
 */
export const ProfilePage: React.FC = () => {
  const {
    user,
    isLoading,
    isEditMode,
    setIsEditMode,
    isSaving,
    isChangingPassword,
    formData,
    doctorFormData,
    passwordData,
    errors,
    passwordErrors,
    successMessage,
    handleChange,
    handleDoctorChange,
    handlePasswordChange,
    handleSaveProfile,
    handleChangePassword,
    handleCancelEdit,
  } = useProfilePresenter();

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner-large" />
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="page profile-page">
      <header className="page-header">
        <div>
          <h1>Профиль</h1>
          <p className="page-subtitle">Управление данными учётной записи</p>
        </div>
      </header>

      {successMessage && <Alert type="success" message={successMessage} />}

      <div className="profile-layout">
        {/* Карточка профиля */}
        <section className="card profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              <UserIcon size={48} />
            </div>
            <div className="profile-info">
              <h2>{user?.fullName}</h2>
              <span className="profile-role">
                {user?.role === 'admin' ? 'Администратор' : 'Врач'}
              </span>
              {user?.position && (
                <span className="profile-position">{user.position}</span>
              )}
            </div>
          </div>

          {errors.general && <Alert type="error" message={errors.general} />}

          <div className="profile-form">
            <h3>Личные данные</h3>

            {isEditMode ? (
              <>
                <div className="form-row">
                  <Input
                    type="text"
                    name="lastName"
                    label="Фамилия *"
                    value={formData.lastName}
                    onChange={handleChange('lastName')}
                    error={errors.lastName}
                  />
                  <Input
                    type="text"
                    name="firstName"
                    label="Имя *"
                    value={formData.firstName}
                    onChange={handleChange('firstName')}
                    error={errors.firstName}
                  />
                  <Input
                    type="text"
                    name="middleName"
                    label="Отчество"
                    value={formData.middleName}
                    onChange={handleChange('middleName')}
                  />
                </div>

                <div className="form-row">
                  <Input
                    type="email"
                    name="email"
                    label="Email"
                    value={formData.email}
                    onChange={handleChange('email')}
                    error={errors.email}
                  />
                  <Input
                    type="tel"
                    name="phone"
                    label="Телефон"
                    value={formData.phone}
                    onChange={handleChange('phone')}
                  />
                </div>

                <Input
                  type="text"
                  name="position"
                  label="Должность"
                  value={formData.position}
                  onChange={handleChange('position')}
                />

                {user?.role === 'doctor' && user?.doctor && (
                  <>
                    <h3 style={{ marginTop: '24px' }}>Данные врача</h3>
                    <div className="form-row">
                      <Input
                        type="text"
                        name="specialization"
                        label="Специализация"
                        value={doctorFormData.specialization}
                        onChange={handleDoctorChange('specialization')}
                      />
                      <Input
                        type="number"
                        name="experienceYears"
                        label="Стаж (лет)"
                        value={doctorFormData.experienceYears}
                        onChange={handleDoctorChange('experienceYears')}
                        min={0}
                      />
                    </div>
                    <Input
                      type="text"
                      name="officeNumber"
                      label="Номер кабинета"
                      value={doctorFormData.officeNumber}
                      onChange={handleDoctorChange('officeNumber')}
                    />
                  </>
                )}

                <div className="form-actions">
                  <Button variant="secondary" onClick={handleCancelEdit}>
                    Отмена
                  </Button>
                  <Button onClick={handleSaveProfile} loading={isSaving}>
                    Сохранить
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="profile-fields">
                  <div className="profile-field">
                    <span className="field-label">ФИО</span>
                    <span className="field-value">{user?.fullName || '—'}</span>
                  </div>
                  <div className="profile-field">
                    <span className="field-label">Email</span>
                    <span className="field-value">{user?.email || '—'}</span>
                  </div>
                  <div className="profile-field">
                    <span className="field-label">Телефон</span>
                    <span className="field-value">{user?.phone || '—'}</span>
                  </div>
                  <div className="profile-field">
                    <span className="field-label">Должность</span>
                    <span className="field-value">{user?.position || '—'}</span>
                  </div>
                  <div className="profile-field">
                    <span className="field-label">Логин</span>
                    <span className="field-value">{user?.login}</span>
                  </div>

                  {user?.role === 'doctor' && user?.doctor && (
                    <>
                      <div className="profile-field" style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--color-border, #e5e7eb)' }}>
                        <span className="field-label">Специализация</span>
                        <span className="field-value">{user.doctor.specialization || '—'}</span>
                      </div>
                      <div className="profile-field">
                        <span className="field-label">Стаж</span>
                        <span className="field-value">
                          {user.doctor.experienceYears ? `${user.doctor.experienceYears} лет` : '—'}
                        </span>
                      </div>
                      <div className="profile-field">
                        <span className="field-label">Кабинет</span>
                        <span className="field-value">{user.doctor.officeNumber || '—'}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="form-actions">
                  <Button onClick={() => setIsEditMode(true)}>
                    Редактировать
                  </Button>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Смена пароля */}
        <section className="card password-card">
          <h3>Смена пароля</h3>

          {passwordErrors.general && (
            <Alert type="error" message={passwordErrors.general} />
          )}

          <div className="password-form">
            <Input
              type="password"
              name="currentPassword"
              label="Текущий пароль"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange('currentPassword')}
              error={passwordErrors.currentPassword}
            />
            <Input
              type="password"
              name="newPassword"
              label="Новый пароль"
              value={passwordData.newPassword}
              onChange={handlePasswordChange('newPassword')}
              error={passwordErrors.newPassword}
            />
            <Input
              type="password"
              name="confirmPassword"
              label="Подтвердите пароль"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange('confirmPassword')}
              error={passwordErrors.confirmPassword}
            />

            <div className="form-actions">
              <Button onClick={handleChangePassword} loading={isChangingPassword}>
                Изменить пароль
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;
