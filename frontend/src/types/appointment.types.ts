import { PaginationParams } from './common.types';
import { DoctorInfo } from './doctor.types';
import { Service } from './service.types';

export type AppointmentStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  serviceId: number;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  complaints?: string;
  diagnosis?: string;
  conclusion?: string;
  recommendations?: string;
  totalCost: number;
  createdAt: string;
  updatedAt: string;
  patient?: {
    id: number;
    fullName: string;
    phone: string;
  };
  doctor?: DoctorInfo;
  service?: Service;
}

export interface CreateAppointmentRequest {
  patientId: number;
  doctorId: number;
  serviceId: number;
  appointmentDate: string;
  startTime: string;
  endTime?: string;
}

export interface UpdateAppointmentRequest {
  appointmentDate?: string;
  startTime?: string;
  complaints?: string;
  diagnosis?: string;
  conclusion?: string;
  recommendations?: string;
}

export interface CompleteAppointmentRequest {
  complaints?: string;
  diagnosis: string;
  conclusion?: string;
  recommendations?: string;
}

export interface AppointmentSearchParams extends PaginationParams {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  doctorId?: number;
  patientId?: number;
  status?: AppointmentStatus;
  serviceId?: number;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface AppointmentFormErrors {
  patientId?: string;
  doctorId?: string;
  serviceId?: string;
  appointmentDate?: string;
  startTime?: string;
  general?: string;
}

export const appointmentStatusLabels: Record<AppointmentStatus, string> = {
  scheduled: 'Запланирован',
  in_progress: 'В процессе',
  completed: 'Завершён',
  cancelled: 'Отменён',
};

export const appointmentStatusColors: Record<AppointmentStatus, string> = {
  scheduled: '#3b82f6',
  in_progress: '#f59e0b',
  completed: '#22c55e',
  cancelled: '#ef4444',
};
