import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  MaxLength,
} from 'class-validator';

export class UpdateDoctorDto {
  @IsString({ message: 'Специализация должна быть строкой' })
  @IsOptional()
  @MaxLength(150)
  specialization?: string;

  @IsString({ message: 'Квалификация должна быть строкой' })
  @IsOptional()
  @MaxLength(100)
  qualification?: string;

  @IsInt({ message: 'Стаж должен быть целым числом' })
  @IsOptional()
  @Min(0, { message: 'Стаж не может быть отрицательным' })
  experienceYears?: number;

  @IsString({ message: 'Номер кабинета должен быть строкой' })
  @IsOptional()
  @MaxLength(20)
  officeNumber?: string;

  @IsString({ message: 'Образование должно быть строкой' })
  @IsOptional()
  education?: string;
}
