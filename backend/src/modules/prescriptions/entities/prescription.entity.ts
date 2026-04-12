import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { Patient } from '../../patients/entities/patient.entity';
import { Doctor } from '../../doctors/entities/doctor.entity';
import { Inventory } from '../../inventory/entities/inventory.entity';

// Prescription - сущность назначения
@Entity('prescriptions') // В бд таблица prescriptions
export class Prescription {

  @PrimaryGeneratedColumn()
  id: number; // идентификатор назначения, автоинкрементный первичный ключ

  @Column({ name: 'appointment_id' })
  appointmentId: number; // внешний ключ на таблицу appointments

  @ManyToOne(() => Appointment, (appointment) => appointment.prescriptions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'appointment_id' })
  appointment: Appointment; // связь с таблицей appointments (N:1)

  @Column({ name: 'patient_id' })
  patientId: number; // внешний ключ на таблицу patients

  @ManyToOne(() => Patient, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient; // связь с таблицей patients (N:1)

  @Column({ type: 'varchar', length: 255, name: 'medication_name' })
  medicationName: string; // название препарата

  @Column({ type: 'varchar', length: 100, nullable: true })
  dosage: string | null; // дозировка препарата

  @Column({ type: 'varchar', length: 100, nullable: true })
  form: string | null; // форма выпуска

  @Column({ type: 'varchar', length: 150, nullable: true })
  frequency: string | null; // частота приёма

  @Column({ type: 'varchar', length: 100, name: 'administration_route', nullable: true })
  administrationRoute: string | null; // способ применения

  @Column({ type: 'varchar', length: 100, nullable: true })
  duration: string | null; // длительность курса

  @Column({ type: 'date', name: 'start_date', nullable: true })
  startDate: Date | null; // дата начала приёма

  @Column({ type: 'date', name: 'end_date', nullable: true })
  endDate: Date | null; // дата окончания приёма

  @Column({ type: 'text', nullable: true })
  instructions: string | null; // особые указания

  @Column({ name: 'prescribed_by', nullable: true })
  prescribedBy: number | null; // внешний ключ на таблицу doctors

  @ManyToOne(() => Doctor)
  @JoinColumn({ name: 'prescribed_by' })
  prescriber: Doctor; // связь с таблицей doctors (N:1)

  @Column({ name: 'inventory_id', nullable: true })
  inventoryId: number | null; // внешний ключ на таблицу inventory (для списания со склада)

  @Column({ type: 'int', nullable: true })
  quantity: number | null; // количество материала со склада

  @ManyToOne(() => Inventory, { nullable: true })
  @JoinColumn({ name: 'inventory_id' })
  inventory: Inventory; // связь с таблицей inventory (N:1)

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date; // дата/время создания записи

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date; // дата/время последнего обновления записи
}
