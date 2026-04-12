import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { PrescriptionsService } from './prescriptions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { CreateBatchPrescriptionsDto } from './dto/create-batch-prescriptions.dto';

@Controller('prescriptions')
@UseGuards(JwtAuthGuard)
export class PrescriptionsController {
  constructor(private prescriptionsService: PrescriptionsService) {}

  @Get()
  async findAll() {
    const prescriptions = await this.prescriptionsService.findAll();
    return { success: true, data: prescriptions };
  }

  @Get('appointment/:appointmentId')
  async findByAppointmentId(@Param('appointmentId', ParseIntPipe) appointmentId: number) {
    const prescriptions = await this.prescriptionsService.findByAppointmentId(appointmentId);
    return { success: true, data: prescriptions };
  }

  @Get('patient/:patientId')
  async findByPatientId(@Param('patientId', ParseIntPipe) patientId: number) {
    const prescriptions = await this.prescriptionsService.findByPatientId(patientId);
    return { success: true, data: prescriptions };
  }

  @Post('batch')
  async createBatch(@Body() dto: CreateBatchPrescriptionsDto, @Req() req: Request) {
    const userId = (req.user as any).userId;
    const items = dto.prescriptions.map((p) => ({
      ...p,
      patientId: dto.patientId,
    }));
    const result = await this.prescriptionsService.createBatch(dto.appointmentId, items, userId);
    return { success: true, message: 'Назначения созданы', data: result };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const prescription = await this.prescriptionsService.findOne(id);
    return { success: true, data: prescription };
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePrescriptionDto) {
    const prescription = await this.prescriptionsService.update(id, dto);
    return { success: true, message: 'Назначение обновлено', data: prescription };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.prescriptionsService.remove(id);
    return { success: true, message: 'Назначение удалено' };
  }
}
