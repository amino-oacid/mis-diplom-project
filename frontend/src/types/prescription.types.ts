import { Appointment } from './appointment.types';
import { Patient } from './patient.types';
import { PaginationParams } from './common.types';
import { InventoryItem } from './inventory.types';

export interface Prescription {
  id: number;
  appointmentId: number;
  patientId: number;
  doctorId: number;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  isActive: boolean;
  inventoryId?: number;
  quantity?: number;
  inventory?: InventoryItem;
  createdAt: string;
  updatedAt: string;
  appointment?: Appointment;
  patient?: Patient;
}

export interface CreatePrescriptionRequest {
  appointmentId: number;
  patientId: number;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  inventoryId?: number;
  quantity?: number;
}

export interface UpdatePrescriptionRequest {
  medicationName?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
  isActive?: boolean;
}

export interface BatchPrescriptionRequest {
  appointmentId: number;
  patientId: number;
  prescriptions: Omit<CreatePrescriptionRequest, 'appointmentId' | 'patientId'>[];
}

export interface PrescriptionSearchParams extends PaginationParams {
  patientId?: number;
  appointmentId?: number;
  isActive?: boolean;
}

export interface PrescriptionFormErrors {
  medicationName?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  inventoryId?: string;
  quantity?: string;
  general?: string;
}
