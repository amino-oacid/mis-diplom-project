import React from 'react';
import { Link } from 'react-router-dom';
import { Input, Button, Alert } from '../common';
import { useLoginPresenter } from '../../presenters/useLoginPresenter';
import '../../styles/login.css';

/**
 * Форма входа
 * Отображает UI, делегирует логику презентеру
 */
export const LoginForm: React.FC = () => {
  const { formData, errors, isSubmitting, handleChange, handleSubmit } = useLoginPresenter();

  return (
    <form className="login-form" onSubmit={handleSubmit} noValidate>
      <h1 className="login-title">МИС Клиники</h1>
      <p className="login-subtitle">Вход в систему</p>

      {errors.general && <Alert type="error" message={errors.general} />}

      <Input
        type="text"
        name="login"
        label="Логин"
        placeholder="Введите логин"
        value={formData.login}
        onChange={handleChange('login')}
        error={errors.login}
        autoComplete="username"
        autoFocus
      />

      <Input
        type="password"
        name="password"
        label="Пароль"
        placeholder="Введите пароль"
        value={formData.password}
        onChange={handleChange('password')}
        error={errors.password}
        autoComplete="current-password"
      />

      <Button type="submit" fullWidth loading={isSubmitting}>
        Войти
      </Button>

      <p className="auth-link-text">
        Нет аккаунта? <Link to="/register" className="auth-link">Зарегистрироваться</Link>
      </p>
    </form>
  );
};

export default LoginForm;
