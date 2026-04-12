import React from 'react';
import { RegisterForm } from '../components/auth';

/**
 * Страница регистрации
 */
export const RegisterPage: React.FC = () => {
  return (
    <div className="login-page">
      <div className="login-container register-container">
        <RegisterForm />
      </div>
    </div>
  );
};

export default RegisterPage;
