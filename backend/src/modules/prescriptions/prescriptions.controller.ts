import {
  Controller,
  Get,
  Post,
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
import { CreateBatchPrescriptionsDto } from './dto/create-batch-prescriptions.dto';

@Controller('prescriptions')
@UseGuards(JwtAuthGuard)
export class PrescriptionsController {
  constructor(private prescriptionsService: PrescriptionsService) {}

  @Get('appointment/:appointmentId')
  async findByAppointmentId(@Param('appointmentId', ParseIntPipe) appointmentId: number) {
    const prescriptions = await this.prescriptionsService.findByAppointmentId(appointmentId);
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

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.prescriptionsService.remove(id);
    return { success: true, message: 'Назначение удалено' };
  }
}
