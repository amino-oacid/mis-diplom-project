import { IsOptional, IsDateString, IsIn } from 'class-validator';

export class ReportFiltersDto {
  @IsOptional()
  @IsDateString({}, { message: 'Некорректный формат даты начала' })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Некорректный формат даты окончания' })
  endDate?: string;

  @IsOptional()
  @IsIn(['json', 'excel', 'pdf'], { message: 'Формат должен быть json, excel или pdf' })
  format?: string;
}

export class InventoryReportFiltersDto {
  @IsOptional()
  @IsIn(['json', 'excel', 'pdf'], { message: 'Формат должен быть json, excel или pdf' })
  format?: string;
}
