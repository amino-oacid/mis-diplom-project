import {
  IsNumber,
  IsString,
  IsOptional,
  IsDateString,
  IsNotEmpty,
} from 'class-validator';

export class CreateAppointmentDto {
  @IsNumber({}, { message: 'ID пациента должен быть числом' })
  @IsNotEmpty({ message: 'ID пациента обязателен' })
  patientId: number;

  @IsNumber({}, { message: 'ID врача должен быть числом' })
  @IsNotEmpty({ message: 'ID врача обязателен' })
  doctorId: number;

  @IsNumber()
  @IsOptional()
  serviceId?: number;

  @IsDateString({}, { message: 'Некорректный формат даты' })
  @IsNotEmpty({ message: 'Дата приёма обязательна' })
  appointmentDate: string;

  @IsString({ message: 'Время начала должно быть строкой' })
  @IsNotEmpty({ message: 'Время начала обязательно' })
  startTime: string;

  @IsString({ message: 'Время окончания должно быть строкой' })
  @IsNotEmpty({ message: 'Время окончания обязательно' })
  endTime: string;
}
