import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsEnum,
  MinLength,
  MaxLength,
} from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @IsString({ message: 'Логин должен быть строкой' })
  @IsNotEmpty({ message: 'Логин обязателен' })
  @MinLength(3, { message: 'Логин должен содержать минимум 3 символа' })
  @MaxLength(50, { message: 'Логин не может быть длиннее 50 символов' })
  login: string;

  @IsString({ message: 'Пароль должен быть строкой' })
  @IsNotEmpty({ message: 'Пароль обязателен' })
  @MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
  password: string;

  @IsEnum(UserRole, { message: 'Некорректная роль пользователя' })
  @IsOptional()
  role?: UserRole;

  @IsString({ message: 'Фамилия должна быть строкой' })
  @IsNotEmpty({ message: 'Фамилия обязательна' })
  @MaxLength(100)
  lastName: string;

  @IsString({ message: 'Имя должно быть строкой' })
  @IsNotEmpty({ message: 'Имя обязательно' })
  @MaxLength(100)
  firstName: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  middleName?: string;

  @IsEmail({}, { message: 'Некорректный email' })
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  position?: string;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  specialization?: string;
}
