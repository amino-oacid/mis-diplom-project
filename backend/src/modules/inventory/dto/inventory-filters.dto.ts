import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  IsBooleanString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { InventoryType } from '../entities/inventory.entity';

export class InventoryFiltersDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsEnum(InventoryType, { message: 'Некорректный тип позиции' })
  @IsOptional()
  type?: InventoryType;

  @IsBooleanString()
  @IsOptional()
  lowStock?: string;

  @IsBooleanString()
  @IsOptional()
  expiringSoon?: string;

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
