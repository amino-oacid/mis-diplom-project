export type UserRole = 'admin' | 'doctor';

export interface User {
  id: number;
  login: string;
  role: UserRole;
  lastName: string;
  firstName: string;
  middleName?: string;
  fullName: string;
  email?: string;
  phone?: string;
  position?: string;
  createdAt?: string;
  updatedAt?: string;
  doctor?: {
    id: number;
    specialization: string;
    experienceYears?: number;
    officeNumber?: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}
