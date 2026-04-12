import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { InventoryLog } from './inventory-log.entity';

export enum InventoryType {
  MEDICATION = 'medication', // Медикаменты - лекарственные препараты
  CONSUMABLE = 'consumable', // Расходные материалы - бинты, перчатки и т.д.
  EQUIPMENT = 'equipment', // Оборудование - инструменты, приборы
}

// Inventory - сущность для позиции на складе
@Entity('inventory')
export class Inventory {

  @PrimaryGeneratedColumn()
  id: number; // идентификатор материала, автоинкрементный первичный ключ

  @Column({ type: 'varchar', length: 255 })
  name: string; // название материала

  @Column({
    type: 'enum',
    enum: InventoryType,
    default: InventoryType.CONSUMABLE,
  })
  type: InventoryType; // тип материала (медикаменты, расходные материалы, оборудование)

  @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
  sku: string | null; // уникальный артикул

  @Column({ type: 'text', nullable: true })
  description: string | null; // описание позиции

  @Column({ type: 'varchar', length: 50, default: 'шт' })
  unit: string; // единица измерения

  @Column({ type: 'int', default: 0 })
  quantity: number; // текущее количество

  @Column({ type: 'int', name: 'min_quantity', default: 0 })
  minQuantity: number; // минимальный остаток

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'purchase_price', nullable: true })
  purchasePrice: number | null; // цена закупки

  @Column({ type: 'date', name: 'expiry_date', nullable: true })
  expiryDate: Date | null; // срок годности

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date; // дата/время создания записи

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date; // дата/время последнего обновления записи

  @OneToMany(() => InventoryLog, (log) => log.inventory)
  logs: InventoryLog[]; // связь с таблицей InventoryLog (1:N)

  get isLowStock(): boolean { // проверка на низкий остаток
    return this.quantity <= this.minQuantity; 
  }
}
