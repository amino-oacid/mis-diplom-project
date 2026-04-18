import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Appointment } from '../../appointments/entities/appointment.entity';

// Service - сущность услуги
@Entity('services') // В бд таблица services
export class Service {

  @PrimaryGeneratedColumn()
  id: number; // идентификатор записи, автоинкрементный первичный ключ

  @Column({ type: 'varchar', length: 50, unique: true, nullable: true })
  code: string | null; // уникальный код услуги

  @Column({ type: 'varchar', length: 255 })
  name: string; // название услуги

  @Column({ type: 'text', nullable: true })
  description: string | null; // описание услуги

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string | null; // категория услуги

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number; // стоимость услуги

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date; // дата/время создания записи

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date; // дата/время последнего обновления записи

  @OneToMany(() => Appointment, (appointment) => appointment.service)
  appointments: Appointment[]; // связь с таблицей appointments (1:N)
}
