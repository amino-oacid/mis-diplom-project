import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  AfterLoad,
} from 'typeorm';
import { MedicalRecord } from '../../medical-records/entities/medical-record.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';

export enum GenderType {
  MALE = 'male',     
  FEMALE = 'female', 
}

// Patient - сущность пациента
@Entity('patients') // В бд таблица patients
export class Patient {

  @PrimaryGeneratedColumn()
  id: number; // идентификатор пациента, автоинкрементный первичный ключ

  @Column({ type: 'varchar', length: 100, name: 'last_name' })
  lastName: string; // фамилия пациента

  @Column({ type: 'varchar', length: 100, name: 'first_name' })
  firstName: string; // имя пациента

  @Column({ type: 'varchar', length: 100, name: 'middle_name', nullable: true })
  middleName: string | null; // отчество пациента

  @Column({ type: 'date', name: 'birth_date' })
  birthDate: Date; // дата рождения

  @Column({ type: 'enum', enum: GenderType })
  gender: GenderType; // пол

  @Column({ type: 'varchar', length: 20 })
  phone: string; // номер телефона

  @Column({ type: 'varchar', length: 20, name: 'phone_additional', nullable: true })
  phoneAdditional: string | null; // дополнительный телефон

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null; // электронная почта

  @Column({ type: 'text', nullable: true })
  address: string | null; // адрес проживания

  @Column({ type: 'varchar', length: 10, name: 'passport_series', nullable: true })
  passportSeries: string | null; // серия паспорта

  @Column({ type: 'varchar', length: 20, name: 'passport_number', nullable: true })
  passportNumber: string | null; // номер паспорта

  @Column({ type: 'text', name: 'passport_issued_by', nullable: true })
  passportIssuedBy: string | null; // кем выдан паспорт

  @Column({ type: 'date', name: 'passport_issued_date', nullable: true })
  passportIssuedDate: Date | null; // дата выдачи паспорта

  @Column({ type: 'varchar', length: 14, nullable: true })
  snils: string | null; // СНИЛС

  @Column({ type: 'varchar', length: 50, name: 'insurance_policy', nullable: true })
  insurancePolicy: string | null; // номер полиса ОМС

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date; // дата/время создания записи

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date; // дата/время последнего обновления записи

  @OneToOne(() => MedicalRecord, (record) => record.patient)
  medicalRecord: MedicalRecord; // связь с таблицей medical_records (1:1)

  @OneToMany(() => Appointment, (appointment) => appointment.patient)
  appointments: Appointment[]; // связь с таблицей appointments (1:N)

  fullName: string; // полное ФИО пользователя, вычисляется автоматически после загрузки сущности из БД (@AfterLoad)

  @AfterLoad()
  computeFullName() {
    const parts = [this.lastName, this.firstName];
    if (this.middleName) {
      parts.push(this.middleName);
    }
    this.fullName = parts.join(' ');
  }
}
