import { Controller, Get, Query, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ReportFiltersDto } from './dto/report-filters.dto';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('summary')
  async getSummary() {
    const summary = await this.reportsService.getSummary();
    return { success: true, data: summary };
  }

  @Get('appointments')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async getAppointmentsReport(
    @Query() filters: ReportFiltersDto,
    @Res() res: Response,
  ) {
    const { startDate, endDate, format } = filters;

    if (format === 'excel') {
      const buffer = await this.reportsService.exportAppointmentsToExcel(startDate, endDate);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=appointments_${startDate}_${endDate}.xlsx`);
      res.send(buffer);
      return;
    }

    if (format === 'pdf') {
      const buffer = await this.reportsService.exportAppointmentsToPdf(startDate, endDate);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=appointments_${startDate}_${endDate}.pdf`);
      res.send(buffer);
      return;
    }

    const report = await this.reportsService.getAppointmentsReport(startDate, endDate);
    res.json({ success: true, data: report });
  }

  @Get('inventory')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async getInventoryReport(
    @Query() filters: ReportFiltersDto,
    @Res() res: Response,
  ) {
    const { startDate, endDate, format } = filters;

    if (format === 'excel') {
      const buffer = await this.reportsService.exportInventoryToExcel(startDate, endDate);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=inventory_report.xlsx');
      res.send(buffer);
      return;
    }

    if (format === 'pdf') {
      const buffer = await this.reportsService.exportInventoryToPdf(startDate, endDate);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=inventory_report.pdf');
      res.send(buffer);
      return;
    }

    const report = await this.reportsService.getInventoryReport(startDate, endDate);
    res.json({ success: true, data: report });
  }
}
