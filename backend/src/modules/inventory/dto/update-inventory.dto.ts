import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsInt,
  Min,
  MaxLength,
  IsDate,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { InventoryType } from '../entities/inventory.entity';

const toDate = ({ value }: { value: string | null | undefined }): Date | null => {
  if (!value) return null;
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
};

export class UpdateInventoryDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @IsEnum(InventoryType, { message: 'Некорректный тип позиции' })
  @IsOptional()
  type?: InventoryType;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  sku?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  unit?: string;

  @IsInt({ message: 'Минимальный остаток должен быть целым числом' })
  @Min(0, { message: 'Минимальный остаток не может быть отрицательным' })
  @IsOptional()
  @Type(() => Number)
  minQuantity?: number;

  @IsNumber({}, { message: 'Цена закупки должна быть числом' })
  @Min(0, { message: 'Цена закупки не может быть отрицательной' })
  @IsOptional()
  @Type(() => Number)
  purchasePrice?: number;

  @IsOptional()
  @Transform(toDate)
  @IsDate({ message: 'Некорректная дата срока годности' })
  expiryDate?: Date | null;
}
