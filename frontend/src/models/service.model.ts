import api from '../services/api';
import { Service } from '../types';

/**
 * Модель услуг
 * Содержит все API-вызовы, связанные с услугами
 */
export const serviceModel = {
  async getAll(): Promise<Service[]> {
    const response = await api.get<{ success: boolean; data: Service[] }>('/services');
    return response.data.data || [];
  },
};
