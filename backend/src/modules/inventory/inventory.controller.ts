import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { InventoryFiltersDto } from './dto/inventory-filters.dto';
import { InventoryIncomeDto } from './dto/inventory-income.dto';
import { InventoryExpenseDto } from './dto/inventory-expense.dto';
import { InventoryLogFiltersDto } from './dto/inventory-log-filters.dto';
import { InventoryBatchExpenseDto } from './dto/inventory-batch-expense.dto';
import { AuthenticatedRequest } from '../../common/types/request.types';

@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Get()
  async findAll(@Query() filters: InventoryFiltersDto) {
    const result = await this.inventoryService.findAll(filters);
    return { success: true, data: result.data, pagination: result.pagination };
  }

  @Get('stats')
  async getStats() {
    const stats = await this.inventoryService.getStats();
    return { success: true, data: stats };
  }

  @Get('low-stock')
  async getLowStock() {
    const items = await this.inventoryService.getLowStock();
    return { success: true, data: items };
  }

  @Get('expiring')
  async getExpiring() {
    const items = await this.inventoryService.getExpiring();
    return { success: true, data: items };
  }

  @Get('log')
  async getLog(@Query() filters: InventoryLogFiltersDto) {
    const logs = await this.inventoryService.getLog(filters);
    return { success: true, data: logs };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const item = await this.inventoryService.findOne(id);
    return { success: true, data: item };
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  async create(@Body() dto: CreateInventoryDto, @Req() req: AuthenticatedRequest) {
    const item = await this.inventoryService.create(dto, req.user.userId);
    return { success: true, message: 'Позиция создана', data: item };
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateInventoryDto) {
    const item = await this.inventoryService.update(id, dto);
    return { success: true, message: 'Позиция обновлена', data: item };
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.inventoryService.remove(id);
    return { success: true, message: 'Позиция удалена' };
  }

  @Post('batch-expense')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async batchExpense(
    @Body() dto: InventoryBatchExpenseDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const items = await this.inventoryService.batchExpense(
      dto.items,
      req.user.userId,
      dto.appointmentId,
    );
    return { success: true, message: 'Массовое списание оформлено', data: items };
  }

  @Post(':id/income')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async income(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: InventoryIncomeDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const item = await this.inventoryService.income(
      id,
      dto.quantity,
      req.user.userId,
      dto.reason,
      dto.purchasePrice,
    );
    return { success: true, message: 'Приход оформлен', data: item };
  }

  @Post(':id/expense')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async expense(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: InventoryExpenseDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const item = await this.inventoryService.expense(
      id,
      dto.quantity,
      req.user.userId,
      dto.appointmentId,
      dto.reason,
    );
    return { success: true, message: 'Списание оформлено', data: item };
  }
}
