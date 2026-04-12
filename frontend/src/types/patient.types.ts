import { PaginationParams } from './index';

export type GenderType = 'male' | 'female';

export interface Patient {
  id: number;
  lastName: string;
  firstName: string;
  middleName?: string;
  fullName: string;
  birthDate: string;
  gender: GenderType;
  phone: string;
  email?: string;
  address?: string;
  passportSeries?: string;
  passportNumber?: string;
  insurancePolicy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePatientRequest {
  lastName: string;
  firstName: string;
  middleName?: string;
  birthDate: string;
  gender: GenderType;
  phone: string;
  email?: string;
  address?: string;
  passportSeries?: string;
  passportNumber?: string;
  insurancePolicy?: string;
}

export interface UpdatePatientRequest extends Partial<CreatePatientRequest> {}

export interface PatientSearchParams extends PaginationParams {
  search?: string;      
}

export interface PatientFormErrors {
  lastName?: string;
  firstName?: string;
  middleName?: string;
  birthDate?: string;
  gender?: string;
  phone?: string;
  email?: string;
  general?: string;
}
