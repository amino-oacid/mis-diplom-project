import api from '../services/api';
import { Prescription, BatchPrescriptionRequest } from '../types';

/**
 * Модель назначений
 * API-вызовы для работы с назначениями
 */
export const prescriptionModel = {
  async getByAppointment(appointmentId: number): Promise<Prescription[]> {
    const response = await api.get<{ success: boolean; data: Prescription[] }>(`/prescriptions/appointment/${appointmentId}`);
    return response.data.data || [];
  },

  async createBatch(data: BatchPrescriptionRequest): Promise<Prescription[]> {
    const response = await api.post<{ success: boolean; data: Prescription[] }>('/prescriptions/batch', data);
    return response.data.data || [];
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/prescriptions/${id}`);
  },
};

export default prescriptionModel;
