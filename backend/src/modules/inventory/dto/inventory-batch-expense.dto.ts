import {
  IsInt,
  IsPositive,
  IsOptional,
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class BatchExpenseItemDto {
  @IsInt({ message: 'ID позиции должен быть целым числом' })
  @IsPositive({ message: 'ID позиции должен быть положительным' })
  @Type(() => Number)
  inventoryId: number;

  @IsInt({ message: 'Количество должно быть целым числом' })
  @IsPositive({ message: 'Количество должно быть положительным' })
  @Type(() => Number)
  quantity: number;
}

export class InventoryBatchExpenseDto {
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  appointmentId?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1, { message: 'Необходимо указать хотя бы одну позицию' })
  @Type(() => BatchExpenseItemDto)
  items: BatchExpenseItemDto[];
}
