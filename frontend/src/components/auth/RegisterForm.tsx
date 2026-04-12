import React from 'react';
import { Link } from 'react-router-dom';
import { Input, Button, Alert, Select } from '../common';
import { useRegisterPresenter } from '../../presenters/useRegisterPresenter';
import '../../styles/login.css';

/**
 * Форма регистрации
 */
export const RegisterForm: React.FC = () => {
  const {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
  } = useRegisterPresenter();

  return (
    <form className="login-form register-form" onSubmit={handleSubmit} noValidate>
      <h1 className="login-title">МИС Клиники</h1>
      <p className="login-subtitle">Регистрация</p>

      {errors.general && <Alert type="error" message={errors.general} />}

      <div className="form-row">
        <Input
          type="text"
          name="lastName"
          label="Фамилия"
          placeholder="Иванов"
          value={formData.lastName}
          onChange={handleChange('lastName')}
          error={errors.lastName}
          autoFocus
        />

        <Input
          type="text"
          name="firstName"
          label="Имя"
          placeholder="Иван"
          value={formData.firstName}
          onChange={handleChange('firstName')}
          error={errors.firstName}
        />
      </div>

      <Input
        type="text"
        name="middleName"
        label="Отчество"
        placeholder="Иванович (необязательно)"
        value={formData.middleName}
        onChange={handleChange('middleName')}
        error={errors.middleName}
      />

      <Input
        type="text"
        name="login"
        label="Логин"
        placeholder="Введите логин"
        value={formData.login}
        onChange={handleChange('login')}
        error={errors.login}
        autoComplete="username"
      />

      <Input
        type="password"
        name="password"
        label="Пароль"
        placeholder="Минимум 6 символов"
        value={formData.password}
        onChange={handleChange('password')}
        error={errors.password}
        autoComplete="new-password"
      />

      <Input
        type="password"
        name="confirmPassword"
        label="Подтверждение пароля"
        placeholder="Повторите пароль"
        value={formData.confirmPassword}
        onChange={handleChange('confirmPassword')}
        error={errors.confirmPassword}
        autoComplete="new-password"
      />

      <Input
        type="email"
        name="email"
        label="Email"
        placeholder="email@example.com (необязательно)"
        value={formData.email}
        onChange={handleChange('email')}
        error={errors.email}
        autoComplete="email"
      />

      <Input
        type="tel"
        name="phone"
        label="Телефон"
        placeholder="+7 (999) 123-45-67 (необязательно)"
        value={formData.phone}
        onChange={handleChange('phone')}
        error={errors.phone}
        autoComplete="tel"
      />

      <Select
        name="role"
        label="Роль"
        value={formData.role}
        onChange={handleChange('role')}
        options={[
          { value: 'doctor', label: 'Врач' },
          { value: 'admin', label: 'Администратор' },
        ]}

      />

      <Button type="submit" fullWidth loading={isSubmitting}>
        Зарегистрироваться
      </Button>

      <p className="auth-link-text">
        Уже есть аккаунт? <Link to="/login" className="auth-link">Войти</Link>
      </p>
    </form>
  );
};

export default RegisterForm;
