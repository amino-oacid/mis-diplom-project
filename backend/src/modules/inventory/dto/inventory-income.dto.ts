import {
  IsString,
  IsOptional,
  IsNumber,
  IsInt,
  IsPositive,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class InventoryIncomeDto {
  @IsInt({ message: 'Количество должно быть целым числом' })
  @IsPositive({ message: 'Количество должно быть положительным' })
  @Type(() => Number)
  quantity: number;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  reason?: string;

  @IsNumber({}, { message: 'Цена закупки должна быть числом' })
  @Min(0, { message: 'Цена закупки не может быть отрицательной' })
  @IsOptional()
  @Type(() => Number)
  purchasePrice?: number;
}
