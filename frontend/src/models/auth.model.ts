import api, { setTokens, clearTokens, getRefreshToken } from '../services/api';
import { LoginRequest, LoginResponse, RegisterRequest } from '../types/auth.types';
import { User } from '../types';

/**
 * Модель авторизации
 * Содержит все API-вызовы, связанные с аутентификацией
 */
export const authModel = {

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<{ success: boolean; data: LoginResponse }>('/auth/login', credentials);
    const { accessToken, refreshToken } = response.data.data;

    setTokens(accessToken, refreshToken);

    return response.data.data;
  },

  async logout(): Promise<void> {
    try {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } finally {
      clearTokens();
    }
  },

  async getMe(): Promise<User> {
    const response = await api.get<{ success: boolean; data: User }>('/auth/me');
    return response.data.data;
  },

  async refresh(): Promise<LoginResponse> {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new Error('Refresh token не найден');
    }

    const response = await api.post<{ success: boolean; data: LoginResponse }>('/auth/refresh', { refreshToken });
    const { accessToken, refreshToken: newRefreshToken } = response.data.data;

    setTokens(accessToken, newRefreshToken);

    return response.data.data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.post('/auth/change-password', { currentPassword, newPassword });
  },

  async updateProfile(data: {
    lastName?: string;
    firstName?: string;
    middleName?: string;
    email?: string;
    phone?: string;
    position?: string;
  }): Promise<User> {
    const response = await api.put<{ success: boolean; data: User }>('/auth/profile', data);
    return response.data.data;
  },

  async register(data: RegisterRequest): Promise<User> {
    const response = await api.post<{ data: User }>('/auth/register', data);
    return response.data.data;
  },
};

export default authModel;
