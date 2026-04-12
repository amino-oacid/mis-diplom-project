import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User } from '../types';
import { AuthContextType, LoginRequest } from '../types/auth.types';
import authModel from '../models/auth.model';
import { getAccessToken, clearTokens } from '../services/api';

/**
 * Начальное состояние контекста
 * isLoading = true — пока не проверим токен
 */
const initialState: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  refreshAuth: async () => {},
};

// Создание контекста
export const AuthContext = createContext<AuthContextType>(initialState);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Провайдер авторизации
 * Оборачивает приложение и предоставляет доступ к состоянию авторизации
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  /**
   * Инициализация — проверка токена при загрузке
   */
  const initAuth = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const currentUser = await authModel.getMe();
      setUser(currentUser);
    } catch {
      clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  /**
   * Вход в систему
   */
  const login = useCallback(async (credentials: LoginRequest) => {
    const response = await authModel.login(credentials);
    setUser(response.user);
  }, []);

  /**
   * Выход из системы
   */
  const logout = useCallback(async () => {
    try {
      await authModel.logout();
    } finally {
      setUser(null);
    }
  }, []);

  /**
   * Обновление авторизации
   */
  const refreshAuth = useCallback(async () => {
    try {
      const response = await authModel.refresh();
      setUser(response.user);
    } catch {
      setUser(null);
      clearTokens();
    }
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
