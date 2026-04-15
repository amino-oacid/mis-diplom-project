import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThan, EntityManager } from 'typeorm';
import { Inventory, InventoryType } from './entities/inventory.entity';
import { InventoryLog, OperationType } from './entities/inventory-log.entity';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { InventoryFiltersDto } from './dto/inventory-filters.dto';
import { InventoryLogFiltersDto } from './dto/inventory-log-filters.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
    @InjectRepository(InventoryLog)
    private logRepository: Repository<InventoryLog>,
  ) {}

  async findAll(filters?: InventoryFiltersDto) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.inventoryRepository.createQueryBuilder('inventory');

    if (filters?.search) {
      queryBuilder.andWhere(
        '(inventory.name ILIKE :search OR inventory.sku ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    if (filters?.type) {
      queryBuilder.andWhere('inventory.type = :type', { type: filters.type });
    }

    if (filters?.lowStock === 'true') {
      queryBuilder.andWhere('inventory.quantity <= inventory.minQuantity');
    }

    queryBuilder.orderBy('inventory.name', 'ASC');

    const total = await queryBuilder.getCount();
    const items = await queryBuilder.skip(skip).take(limit).getMany();

    return {
      data: items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number): Promise<Inventory> {
    const item = await this.inventoryRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException('Позиция не найдена');
    }
    return item;
  }

  async create(dto: CreateInventoryDto, userId: number): Promise<Inventory> {
    const item = this.inventoryRepository.create(dto);
    const savedItem = await this.inventoryRepository.save(item);

    // Логируем начальный приход
    if (dto.quantity && dto.quantity > 0) {
      const log = this.logRepository.create({
        inventoryId: savedItem.id,
        operationType: OperationType.INCOME,
        quantity: dto.quantity,
        quantityAfter: dto.quantity,
        performedBy: userId,
        reason: 'Начальный остаток',
      });
      await this.logRepository.save(log);
    }

    return savedItem;
  }

  async update(id: number, dto: UpdateInventoryDto): Promise<Inventory> {
    const item = await this.findOne(id);
    Object.assign(item, dto);
    await this.inventoryRepository.save(item);
    return item;
  }

  async remove(id: number): Promise<void> {
    const item = await this.findOne(id);
    await this.inventoryRepository.remove(item);
  }

  async income(id: number, quantity: number, userId: number, reason?: string, purchasePrice?: number): Promise<Inventory> {
    const item = await this.findOne(id);

    item.quantity += quantity;
    if (purchasePrice) {
      item.purchasePrice = purchasePrice;
    }

    await this.inventoryRepository.save(item);

    const log = this.logRepository.create({
      inventoryId: id,
      operationType: OperationType.INCOME,
      quantity,
      quantityAfter: item.quantity,
      performedBy: userId,
      reason: reason || 'Приход',
    });
    await this.logRepository.save(log);

    return item;
  }

  async expense(id: number, quantity: number, userId: number, appointmentId?: number, reason?: string): Promise<Inventory> {
    const item = await this.findOne(id);

    if (item.quantity < quantity) {
      throw new BadRequestException('Недостаточно товара на складе');
    }

    item.quantity -= quantity;
    await this.inventoryRepository.save(item);

    const log = this.logRepository.create({
      inventoryId: id,
      operationType: OperationType.EXPENSE,
      quantity,
      quantityAfter: item.quantity,
      performedBy: userId,
      appointmentId: appointmentId || null,
      reason: reason || 'Списание',
    });
    await this.logRepository.save(log);

    return item;
  }

  /**
   * Списание со склада в рамках транзакции (для batch-операций)
   */
  async expenseWithManager(
    manager: EntityManager,
    id: number,
    quantity: number,
    userId: number,
    appointmentId?: number,
    reason?: string,
  ): Promise<Inventory> {
    const item = await manager.findOne(Inventory, { where: { id } });

    if (!item) {
      throw new NotFoundException(`Позиция склада #${id} не найдена`);
    }

    if (item.quantity < quantity) {
      throw new BadRequestException(`Недостаточно товара "${item.name}" на складе`);
    }

    item.quantity -= quantity;
    await manager.save(Inventory, item);

    const log = manager.create(InventoryLog, {
      inventoryId: id,
      operationType: OperationType.EXPENSE,
      quantity,
      quantityAfter: item.quantity,
      performedBy: userId,
      appointmentId: appointmentId || null,
      reason: reason || 'Списание',
    });
    await manager.save(InventoryLog, log);

    return item;
  }

  async getStats() {
    const [all, lowStock, expiring] = await Promise.all([
      this.inventoryRepository.find(),
      this.getLowStock(),
      this.getExpiring(),
    ]);

    const totalItems = all.length;
    const totalValue = all.reduce((sum, item) => sum + item.quantity * (item.purchasePrice || 0), 0);
    const lowStockCount = lowStock.length;
    const expiringCount = expiring.length;

    const byType = {
      medication: all.filter((i) => i.type === InventoryType.MEDICATION).length,
      consumable: all.filter((i) => i.type === InventoryType.CONSUMABLE).length,
      equipment: all.filter((i) => i.type === InventoryType.EQUIPMENT).length,
    };

    return { totalItems, totalValue, lowStockCount, expiringCount, byType };
  }

  async getLowStock() {
    return this.inventoryRepository
      .createQueryBuilder('inventory')
      .where('inventory.quantity <= inventory.minQuantity')
      .getMany();
  }

  async getExpiring() {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    return this.inventoryRepository.find({
      where: {
        expiryDate: LessThanOrEqual(thirtyDaysFromNow),
        quantity: MoreThan(0),
      },
      order: { expiryDate: 'ASC' },
    });
  }

  async getLog(filters?: InventoryLogFiltersDto) {
    const queryBuilder = this.logRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.inventory', 'inventory')
      .leftJoinAndSelect('log.performer', 'performer')
      .orderBy('log.createdAt', 'DESC');

    if (filters?.inventoryId) {
      queryBuilder.andWhere('log.inventoryId = :inventoryId', { inventoryId: filters.inventoryId });
    }

    if (filters?.operationType) {
      queryBuilder.andWhere('log.operationType = :operationType', { operationType: filters.operationType });
    }

    return queryBuilder.getMany();
  }
}
