import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateMedicalRecordDto {
  @IsOptional()
  @IsString()
  @MaxLength(10)
  bloodType?: string;

  @IsOptional()
  @IsString()
  allergies?: string;

  @IsOptional()
  @IsString()
  chronicDiseases?: string;

  @IsOptional()
  @IsString()
  lifeAnamnesis?: string;

  @IsOptional()
  @IsString()
  surgeries?: string;

  @IsOptional()
  @IsString()
  familyAnamnesis?: string;

  @IsOptional()
  @IsString()
  badHabits?: string;
}
