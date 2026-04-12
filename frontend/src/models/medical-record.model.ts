import api from '../services/api';
import {
  MedicalRecord,
  UpdateMedicalRecordRequest,
  MedicalHistory,
  Prescription,
} from '../types';

/**
 * Модель медицинских карт
 * API-вызовы для работы с ЭМК
 */
export const medicalRecordModel = {

  async getByPatientId(patientId: number): Promise<MedicalRecord> {
    const response = await api.get<{ success: boolean; data: MedicalRecord }>(`/medical-records/patient/${patientId}`);
    return response.data.data;
  },

  async update(patientId: number, data: UpdateMedicalRecordRequest): Promise<MedicalRecord> {
    const response = await api.put<{ success: boolean; data: MedicalRecord }>(`/medical-records/patient/${patientId}`, data);
    return response.data.data;
  },

  async getHistory(patientId: number): Promise<MedicalHistory[]> {
    const response = await api.get<{ success: boolean; data: MedicalHistory[] }>(`/medical-records/patient/${patientId}/history`);
    return response.data.data || [];
  },

  async getAllPrescriptions(patientId: number): Promise<Prescription[]> {
    const response = await api.get<{ success: boolean; data: Prescription[] }>(
      `/medical-records/patient/${patientId}/prescriptions`
    );
    return response.data.data || [];
  },
};

export default medicalRecordModel;
