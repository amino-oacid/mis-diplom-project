import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { MedicalRecordsService } from './medical-records.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';

@Controller('medical-records')
@UseGuards(JwtAuthGuard)
export class MedicalRecordsController {
  constructor(private medicalRecordsService: MedicalRecordsService) {}

  @Get('patient/:patientId')
  async findByPatientId(@Param('patientId', ParseIntPipe) patientId: number) {
    const record = await this.medicalRecordsService.findByPatientId(patientId);
    return { success: true, data: record };
  }

  @Put('patient/:patientId')
  async update(@Param('patientId', ParseIntPipe) patientId: number, @Body() dto: UpdateMedicalRecordDto) {
    const record = await this.medicalRecordsService.update(patientId, dto);
    return { success: true, message: 'Медицинская карта обновлена', data: record };
  }

  @Get('patient/:patientId/history')
  async getHistory(@Param('patientId', ParseIntPipe) patientId: number) {
    const history = await this.medicalRecordsService.getHistory(patientId);
    return { success: true, data: history };
  }

  @Get('patient/:patientId/prescriptions')
  async getAllPrescriptions(@Param('patientId', ParseIntPipe) patientId: number) {
    const prescriptions = await this.medicalRecordsService.getAllPrescriptions(patientId);
    return { success: true, data: prescriptions };
  }
}
