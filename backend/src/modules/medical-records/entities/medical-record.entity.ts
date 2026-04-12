import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';

// MedicalRecord - сущность электронной медицинской карты пациента
@Entity('medical_records')
export class MedicalRecord {

  @PrimaryGeneratedColumn()
  id: number; // идентификатор карты, автоинкрементный первичный ключ

  @Column({ name: 'patient_id', unique: true })
  patientId: number; // внешний ключ на таблицу patients

  @OneToOne(() => Patient, (patient) => patient.medicalRecord, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient; // связь с таблицей patients (1:1)

  @Column({ type: 'varchar', length: 50, name: 'card_number', unique: true, nullable: true })
  cardNumber: string | null; // номер карты

  @Column({ type: 'varchar', length: 10, name: 'blood_type', nullable: true })
  bloodType: string | null; // группа крови

  @Column({ type: 'text', nullable: true })
  allergies: string | null; // аллергии

  @Column({ type: 'text', name: 'chronic_diseases', nullable: true })
  chronicDiseases: string | null; // хронические заболевания

  @Column({ type: 'text', name: 'life_anamnesis', nullable: true })
  lifeAnamnesis: string | null; // анамнез жизни

  @Column({ type: 'text', nullable: true })
  surgeries: string | null; // хирургический анамнез

  @Column({ type: 'text', name: 'family_anamnesis', nullable: true })
  familyAnamnesis: string | null; // семейный анамнез

  @Column({ type: 'text', name: 'bad_habits', nullable: true })
  badHabits: string | null; // вредные привычки

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date; // дата/время создания записи

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date; // дата/время последнего обновления записи
}
