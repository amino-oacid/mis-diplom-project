import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsEnum,
  IsDateString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { GenderType } from '../entities/patient.entity';

export class CreatePatientDto {
  @IsString()
  @IsNotEmpty({ message: 'Фамилия обязательна' })
  @MaxLength(100)
  lastName: string;

  @IsString()
  @IsNotEmpty({ message: 'Имя обязательно' })
  @MaxLength(100)
  firstName: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  middleName?: string;

  @IsDateString({}, { message: 'Некорректная дата рождения' })
  @IsNotEmpty({ message: 'Дата рождения обязательна' })
  birthDate: string;

  @IsEnum(GenderType, { message: 'Некорректный пол' })
  @IsNotEmpty({ message: 'Пол обязателен' })
  gender: GenderType;

  @IsString()
  @IsNotEmpty({ message: 'Телефон обязателен' })
  @MaxLength(20)
  phone: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  phoneAdditional?: string;

  @ValidateIf((o) => o.email && o.email.length > 0)
  @IsEmail({}, { message: 'Некорректный email' })
  email?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  address?: string;

  @IsString()
  @IsOptional()
  @MaxLength(14)
  snils?: string;

  @IsString()
  @IsOptional()
  @MaxLength(16)
  insurancePolicy?: string;

  @IsString()
  @IsOptional()
  passportSeries?: string;

  @IsString()
  @IsOptional()
  passportNumber?: string;

  @IsString()
  @IsOptional()
  passportIssuedBy?: string;

  @IsDateString()
  @IsOptional()
  passportIssuedDate?: string;
}
