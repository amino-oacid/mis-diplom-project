import api from '../services/api';
import {
  Patient,
  CreatePatientRequest,
  UpdatePatientRequest,
  PatientSearchParams,
  Appointment,
  PaginatedResponse,
} from '../types';

/**
 * Модель пациента
 * Содержит все API-вызовы, связанные с пациентами
 */
export const patientModel = {
  async getAll(params?: PatientSearchParams): Promise<PaginatedResponse<Patient>> {
    const response = await api.get<{
      success: boolean;
      data: Patient[];
      pagination: { page: number; limit: number; total: number; pages: number };
    }>('/patients', { params });
    return {
      items: response.data.data || [],
      total: response.data.pagination?.total || 0,
      page: response.data.pagination?.page || 1,
      limit: response.data.pagination?.limit || 10,
      totalPages: response.data.pagination?.pages || 0,
    };
  },

  async getById(id: number): Promise<Patient> {
    const response = await api.get<{ success: boolean; data: Patient }>(`/patients/${id}`);
    return response.data.data;
  },

  async create(data: CreatePatientRequest): Promise<Patient> {
    const response = await api.post<{ success: boolean; data: Patient }>('/patients', data);
    return response.data.data;
  },

  async update(id: number, data: UpdatePatientRequest): Promise<Patient> {
    const response = await api.put<{ success: boolean; data: Patient }>(`/patients/${id}`, data);
    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/patients/${id}`);
  },

  async getAppointments(id: number): Promise<Appointment[]> {
    const response = await api.get<{ success: boolean; data: Appointment[] }>(`/patients/${id}/appointments`);
    return response.data.data || [];
  },

  async search(query: string, limit = 10): Promise<Patient[]> {
    const response = await api.get<{
      success: boolean;
      data: Patient[];
      pagination: { page: number; limit: number; total: number; pages: number };
    }>('/patients', {
      params: { search: query, limit },
    });
    return response.data.data || [];
  },
};
