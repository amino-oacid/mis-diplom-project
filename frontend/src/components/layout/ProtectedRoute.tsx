import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

/**
 * Компонент защиты маршрутов
 * Перенаправляет на страницу входа, если пользователь не авторизован
 * Проверяет роль пользователя, если указаны allowedRoles
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Показываем загрузку, пока проверяем авторизацию
  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner-large" />
        <p>Загрузка...</p>
      </div>
    );
  }

  // Если не авторизован — на страницу входа
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Проверка роли, если указаны allowedRoles
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="access-denied">
        <h2>Доступ запрещён</h2>
        <p>У вас нет прав для просмотра этой страницы.</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
