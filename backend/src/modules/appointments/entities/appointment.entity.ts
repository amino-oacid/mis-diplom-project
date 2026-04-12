import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';
import { Doctor } from '../../doctors/entities/doctor.entity';
import { Service } from '../../services/entities/service.entity';
import { Prescription } from '../../prescriptions/entities/prescription.entity';

export enum AppointmentStatus {
  SCHEDULED = 'scheduled', // Записан - пациент записан, ожидает приёма
  IN_PROGRESS = 'in_progress', // В процессе - врач принимает пациента
  COMPLETED = 'completed', // Завершён - приём проведён, данные заполнены
  CANCELLED = 'cancelled', // Отменён - приём не состоялся
}

// Appointment - сущность приема/записи в клинику
@Entity('appointments') // В бд таблица appointments
export class Appointment {

  @PrimaryGeneratedColumn()
  id: number; // идентификатор записи, автоинкрементный первичный ключ

  @Column({ name: 'patient_id' })
  patientId: number; // внешний ключ на пациента из таблицы patients

  @ManyToOne(() => Patient, (patient) => patient.appointments, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient; // связь с таблицей patients (1:N)

  @Column({ name: 'doctor_id' })
  doctorId: number; // внешний ключ на врача из таблицы doctors

  @ManyToOne(() => Doctor, (doctor) => doctor.appointments, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor; // связь с таблицей doctors (1:N)

  @Column({ name: 'service_id', nullable: true })
  serviceId: number | null; // внешний ключ на услугу из таблицы services

  @ManyToOne(() => Service, (service) => service.appointments, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'service_id' })
  service: Service | null; // связь с таблицей services (1:N)

  @Column({ type: 'date', name: 'appointment_date' })
  appointmentDate: Date; // дата приёма

  @Column({ type: 'time', name: 'start_time' })
  startTime: string; // время начала приёма

  @Column({ type: 'time', name: 'end_time' })
  endTime: string; // время окончания приёма

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.SCHEDULED,
  })
  status: AppointmentStatus; // статус приёма

  @Column({ type: 'text', nullable: true })
  complaints: string | null; // жалобы пациента

  @Column({ type: 'text', nullable: true })
  diagnosis: string | null; // диагноз

  @Column({ type: 'text', nullable: true })
  conclusion: string | null; // заключение врача

  @Column({ type: 'text', nullable: true })
  recommendations: string | null; // рекомендации пациенту

  @Column({ type: 'text', name: 'cancellation_reason', nullable: true })
  cancellationReason: string | null; // причина отмены приёма

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date; // дата/время создания записи

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date; // дата/время последнего обновления записи

  @OneToMany(() => Prescription, (prescription) => prescription.appointment)
  prescriptions: Prescription[]; // связь с таблицей prescriptions (1:N)
}
