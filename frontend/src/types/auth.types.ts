import { User } from './index';

export interface LoginRequest {
  login: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

export interface LoginFormErrors {
  login?: string;
  password?: string;
  general?: string;
}

export interface RegisterRequest {
  login: string;
  password: string;
  lastName: string;
  firstName: string;
  middleName?: string;
  email?: string;
  phone?: string;
  position?: string;
  role?: 'admin' | 'doctor';
}

export interface RegisterFormErrors {
  login?: string;
  password?: string;
  confirmPassword?: string;
  lastName?: string;
  firstName?: string;
  middleName?: string;
  email?: string;
  phone?: string;
  general?: string;
}
