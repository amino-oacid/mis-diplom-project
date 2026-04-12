import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Doctor } from './doctor.entity';

export enum DayOfWeek {
  MONDAY = 'monday',       
  TUESDAY = 'tuesday',    
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',   
  FRIDAY = 'friday',      
  SATURDAY = 'saturday',   
  SUNDAY = 'sunday',      
}

// Schedule - сущность расписания врача
@Entity('schedule') // В бд таблица 'schedule'
@Unique(['doctorId', 'dayOfWeek'])
export class Schedule {

  @PrimaryGeneratedColumn()
  id: number; // идентификатор записи в расписании, автоинкрементный первичный ключ

  @Column({ name: 'doctor_id' })
  doctorId: number; // внешний ключ на таблицу doctors

  @ManyToOne(() => Doctor, (doctor) => doctor.schedules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor; // связь с таблицей doctors (N:1)

  @Column({ type: 'enum', enum: DayOfWeek, name: 'day_of_week' })
  dayOfWeek: DayOfWeek; // день недели

  @Column({ type: 'time', name: 'start_time' })
  startTime: string; // время начала работы

  @Column({ type: 'time', name: 'end_time' })
  endTime: string; // время окончания работы

  @Column({ type: 'varchar', length: 20, name: 'office_number', nullable: true })
  officeNumber: string | null; // номер кабинета

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date; // дата/время создания записи

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date; // дата/время последнего обновления записи
}
