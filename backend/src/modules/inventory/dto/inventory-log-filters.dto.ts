import {
  IsOptional,
  IsEnum,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OperationType } from '../entities/inventory-log.entity';

export class InventoryLogFiltersDto {
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  inventoryId?: number;

  @IsEnum(OperationType, { message: 'Некорректный тип операции' })
  @IsOptional()
  operationType?: OperationType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}
