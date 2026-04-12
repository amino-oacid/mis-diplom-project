import { Appointment } from './appointment.types';
import { Patient } from './patient.types';

export interface MedicalRecord {
  id: number;
  patientId: number;
  cardNumber?: string;
  bloodType?: string;
  allergies?: string;
  chronicDiseases?: string;
  lifeAnamnesis?: string;
  surgeries?: string;
  familyAnamnesis?: string;
  badHabits?: string;
  createdAt: string;
  updatedAt: string;
  patient?: Patient;
}

export interface UpdateMedicalRecordRequest {
  bloodType?: string;
  allergies?: string;
  chronicDiseases?: string;
  lifeAnamnesis?: string;
  surgeries?: string;
  familyAnamnesis?: string;
  badHabits?: string;
}

export interface MedicalHistory {
  appointmentId: number;
  date: string;
  doctor: {
    id: number;
    fullName: string;
    specialization: string;
  };
  service: {
    id: number;
    name: string;
  } | null;
  complaints?: string;
  diagnosis?: string;
  conclusion?: string;
  recommendations?: string;
  prescriptions: {
    id: number;
    medicationName: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
  }[];
  appointment?: Appointment;
}

export interface MedicalRecordFormErrors {
  bloodType?: string;
  allergies?: string;
  chronicDiseases?: string;
  general?: string;
}

export const bloodTypes = [
  'O(I) Rh+',
  'O(I) Rh-',
  'A(II) Rh+',
  'A(II) Rh-',
  'B(III) Rh+',
  'B(III) Rh-',
  'AB(IV) Rh+',
  'AB(IV) Rh-',
];
