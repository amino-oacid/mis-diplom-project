import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { Schedule } from './schedule.entity';

// Doctor - сущность врача
@Entity('doctors') // В бд таблица doctors
export class Doctor {

  @PrimaryGeneratedColumn()
  id: number; // идентификатор врача, автоинкрементный первичный ключ

  @Column({ name: 'user_id' })
  userId: number; // внешний ключ на пользователя из таблицы users

  @OneToOne(() => User, (user) => user.doctor, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User; // связь с таблицей users (1:1)

  @Column({ type: 'varchar', length: 150 })
  specialization: string; // специализация врача

  @Column({ type: 'varchar', length: 100, nullable: true })
  qualification: string | null; // квалификационная категория

  @Column({ type: 'int', name: 'experience_years', default: 0 })
  experienceYears: number; // стаж работы в годах

  @Column({ type: 'varchar', length: 20, name: 'office_number', nullable: true })
  officeNumber: string | null; // номер кабинета

  @Column({ type: 'text', nullable: true })
  education: string | null; // информация об образовании

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date; // дата/время создания записи

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date; // дата/время последнего обновления записи

  @OneToMany(() => Appointment, (appointment) => appointment.doctor)
  appointments: Appointment[]; // связь с таблицей appointments (1:N)

  @OneToMany(() => Schedule, (schedule) => schedule.doctor)
  schedules: Schedule[]; // связь с таблицей schedules (1:N)
}
