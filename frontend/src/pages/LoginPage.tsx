import React from 'react';
import { LoginForm } from '../components/auth';

/**
 * Страница входа
 */
export const LoginPage: React.FC = () => {
  return (
    <div className="login-page">
      <div className="login-container">
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
