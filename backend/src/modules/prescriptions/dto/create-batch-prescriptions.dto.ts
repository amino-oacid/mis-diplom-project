import {
  IsInt,
  IsArray,
  ValidateNested,
  IsString,
  IsOptional,
  MaxLength,
  IsDateString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PrescriptionItemDto {
  @IsString({ message: 'Название препарата обязательно' })
  @MaxLength(255)
  medicationName: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  dosage?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  form?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  frequency?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  administrationRoute?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  duration?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Некорректный формат даты начала' })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Некорректный формат даты окончания' })
  endDate?: string;

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsOptional()
  @IsInt()
  prescribedBy?: number;

  @IsOptional()
  @IsInt({ message: 'inventoryId должен быть числом' })
  inventoryId?: number;

  @IsOptional()
  @IsInt({ message: 'quantity должен быть числом' })
  @Min(1, { message: 'Количество должно быть больше 0' })
  quantity?: number;
}

export class CreateBatchPrescriptionsDto {
  @IsInt({ message: 'appointmentId должен быть числом' })
  appointmentId: number;

  @IsInt({ message: 'patientId должен быть числом' })
  patientId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrescriptionItemDto)
  prescriptions: PrescriptionItemDto[];
}
