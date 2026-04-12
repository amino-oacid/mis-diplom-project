import { IsString, IsOptional, IsEmail, MaxLength } from 'class-validator';

export class UpdateProfileDto {

  @IsString()
  @IsOptional()
  @MaxLength(100)
  lastName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  firstName?: string;

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
}
