import { IsOptional, IsDateString, IsIn } from 'class-validator';

export class ReportFiltersDto {
  @IsOptional()
  @IsDateString({}, { message: 'Некорректный формат даты начала' })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Некорректный формат даты окончания' })
  endDate?: string;

  @IsOptional()
  @IsIn(['excel', 'pdf'], { message: 'Формат должен быть excel или pdf' })
  format?: 'excel' | 'pdf';
}

export class InventoryReportFiltersDto {
  @IsOptional()
  @IsIn(['excel', 'pdf'], { message: 'Формат должен быть excel или pdf' })
  format?: 'excel' | 'pdf';
}
