import {
  IsString,
  IsOptional,
  IsInt,
  IsPositive,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class InventoryExpenseDto {
  @IsInt({ message: 'Количество должно быть целым числом' })
  @IsPositive({ message: 'Количество должно быть положительным' })
  @Type(() => Number)
  quantity: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  appointmentId?: number;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  reason?: string;
}
