import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Inventory } from './inventory.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { User } from '../../users/entities/user.entity';

export enum OperationType {
  INCOME = 'income', // Приход - увеличение остатка
  EXPENSE = 'expense', // Расход - уменьшение остатка
}

// InventoryLog - сущность для записей о движении товара: приход или расход.
@Entity('inventory_log')
export class InventoryLog {

  @PrimaryGeneratedColumn()
  id: number; // идентификатор записи, автоинкрементный первичный ключ

  @Column({ name: 'inventory_id' })
  inventoryId: number; // внешний ключ на таблицу inventory

  @ManyToOne(() => Inventory, (inventory) => inventory.logs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inventory_id' })
  inventory: Inventory; // связь с таблицей inventory (N:1)

  @Column({ type: 'varchar', length: 20, enum: OperationType, name: 'operation_type' })
  operationType: OperationType; // тип операции: приход или расход

  @Column({ type: 'int' })
  quantity: number; // количество товара в операции

  @Column({ type: 'int', name: 'quantity_after' })
  quantityAfter: number; // остаток после операции

  @Column({ name: 'appointment_id', nullable: true })
  appointmentId: number | null; // внешний ключ на таблицу appointments

  @ManyToOne(() => Appointment, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'appointment_id' })
  appointment: Appointment | null; // связь с таблицей appointments (N:1)

  @Column({ type: 'text', nullable: true })
  reason: string | null; // причина операции

  @Column({ name: 'performed_by' })
  performedBy: number; // внешний ключ на таблицу users

  @ManyToOne(() => User)
  @JoinColumn({ name: 'performed_by' })
  performer: User; // связь с таблицей users (N:1)

  @Column({ type: 'timestamptz', name: 'performed_at', default: () => 'CURRENT_TIMESTAMP' })
  performedAt: Date; // дата/время выполнения операции

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date; // дата/время создания записи
}
