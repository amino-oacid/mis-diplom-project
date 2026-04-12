import api from '../services/api';
import {
  Prescription,
  UpdatePrescriptionRequest,
  BatchPrescriptionRequest,
  PrescriptionSearchParams,
  PaginatedResponse,
} from '../types';

/**
 * Модель назначений
 * API-вызовы для работы с назначениями
 */
export const prescriptionModel = {

  async getAll(params?: PrescriptionSearchParams): Promise<PaginatedResponse<Prescription>> {
    const response = await api.get<{
      success: boolean;
      data: Prescription[];
      pagination: { page: number; limit: number; total: number; pages: number };
    }>('/prescriptions', { params });
    return {
      items: response.data.data || [],
      total: response.data.pagination?.total || 0,
      page: response.data.pagination?.page || 1,
      limit: response.data.pagination?.limit || 10,
      totalPages: response.data.pagination?.pages || 0,
    };
  },

  async getById(id: number): Promise<Prescription> {
    const response = await api.get<{ success: boolean; data: Prescription }>(`/prescriptions/${id}`);
    return response.data.data;
  },

  async createBatch(data: BatchPrescriptionRequest): Promise<Prescription[]> {
    const response = await api.post<{ success: boolean; data: Prescription[] }>('/prescriptions/batch', data);
    return response.data.data || [];
  },

  async update(id: number, data: UpdatePrescriptionRequest): Promise<Prescription> {
    const response = await api.put<{ success: boolean; data: Prescription }>(`/prescriptions/${id}`, data);
    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/prescriptions/${id}`);
  },

  async getByAppointment(appointmentId: number): Promise<Prescription[]> {
    const response = await api.get<{ success: boolean; data: Prescription[] }>(`/prescriptions/appointment/${appointmentId}`);
    return response.data.data || [];
  },

  async getByPatient(patientId: number): Promise<Prescription[]> {
    const response = await api.get<{ success: boolean; data: Prescription[] }>(`/prescriptions/patient/${patientId}`);
    return response.data.data || [];
  },
};

export default prescriptionModel;
