import api from '../services/api';
import { DoctorInfo } from '../types';

export interface UpdateDoctorRequest {
  specialization?: string;
  experienceYears?: number;
  officeNumber?: string;
}

/**
 * Модель врача
 * Содержит все API-вызовы, связанные с врачами
 */
export const doctorModel = {
  async getAll(): Promise<DoctorInfo[]> {
    const response = await api.get<{ success: boolean; data: DoctorInfo[] }>('/doctors');
    return response.data.data || [];
  },

  async getById(id: number): Promise<DoctorInfo> {
    const response = await api.get<{ success: boolean; data: DoctorInfo }>(`/doctors/${id}`);
    return response.data.data;
  },

  async update(id: number, data: UpdateDoctorRequest): Promise<DoctorInfo> {
    const response = await api.put<{ success: boolean; data: DoctorInfo }>(`/doctors/${id}`, data);
    return response.data.data;
  },
};
