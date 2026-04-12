import api from '../services/api';
import {
  Appointment,
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
  CompleteAppointmentRequest,
  AppointmentSearchParams,
  TimeSlot,
} from '../types/appointment.types';
import { PaginatedResponse } from '../types';

/**
 * Модель приёмов
 * API-вызовы для работы с приёмами
 */
export const appointmentModel = {

  async getAll(params?: AppointmentSearchParams): Promise<PaginatedResponse<Appointment>> {
    const response = await api.get<{
      success: boolean;
      data: Appointment[];
      pagination: { page: number; limit: number; total: number; pages: number };
    }>('/appointments', { params });
    return {
      items: response.data.data || [],
      total: response.data.pagination?.total || 0,
      page: response.data.pagination?.page || 1,
      limit: response.data.pagination?.limit || 10,
      totalPages: response.data.pagination?.pages || 0,
    };
  },

  async getById(id: number): Promise<Appointment> {
    const response = await api.get<{ success: boolean; data: Appointment }>(`/appointments/${id}`);
    return response.data.data;
  },

  async create(data: CreateAppointmentRequest): Promise<Appointment> {
    const response = await api.post<{ success: boolean; data: Appointment }>('/appointments', data);
    return response.data.data;
  },

  async update(id: number, data: UpdateAppointmentRequest): Promise<Appointment> {
    const response = await api.put<{ success: boolean; data: Appointment }>(`/appointments/${id}`, data);
    return response.data.data;
  },

  async cancel(id: number, reason: string = 'Отменено пользователем'): Promise<Appointment> {
    const response = await api.post<{ success: boolean; data: Appointment }>(`/appointments/${id}/cancel`, {
      cancellationReason: reason,
    });
    return response.data.data;
  },

  async start(id: number): Promise<Appointment> {
    const response = await api.post<{ success: boolean; data: Appointment }>(`/appointments/${id}/start`);
    return response.data.data;
  },

  async complete(id: number, data: CompleteAppointmentRequest): Promise<Appointment> {
    const response = await api.post<{ success: boolean; data: Appointment }>(`/appointments/${id}/complete`, data);
    return response.data.data;
  },

  async getSlots(doctorId: number, date: string, serviceId: number): Promise<TimeSlot[]> {
    const response = await api.get<{ success: boolean; data: TimeSlot[] }>('/appointments/slots', {
      params: { doctorId, date, serviceId },
    });
    return response.data.data || [];
  },

  async getToday(): Promise<Appointment[]> {
    const response = await api.get<{ success: boolean; data: Appointment[] }>('/appointments/today');
    return response.data.data || [];
  },
};

export default appointmentModel;
