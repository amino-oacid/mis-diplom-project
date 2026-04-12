import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { FilterAppointmentsDto } from './dto/filter-appointments.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(private appointmentsService: AppointmentsService) {}

  @Get()
  async findAll(@Query() filters: FilterAppointmentsDto) {
    const result = await this.appointmentsService.findAll(filters);
    return { success: true, data: result.data, pagination: result.pagination };
  }

  @Get('today')
  async getTodayAppointments(@Query('doctorId') doctorId?: string) {
    const appointments = await this.appointmentsService.getTodayAppointments(
      doctorId ? parseInt(doctorId, 10) : undefined,
    );
    return { success: true, data: appointments };
  }

  @Get('slots')
  async getSlots(@Query('doctorId') doctorId: string, @Query('date') date: string) {
    const slots = await this.appointmentsService.getSlots(parseInt(doctorId, 10), date);
    return { success: true, data: slots };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const appointment = await this.appointmentsService.findOne(id);
    return { success: true, data: appointment };
  }

  @Post()
  async create(@Body() dto: CreateAppointmentDto) {
    const appointment = await this.appointmentsService.create(dto);
    return { success: true, message: 'Приём успешно создан', data: appointment };
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAppointmentDto) {
    const appointment = await this.appointmentsService.update(id, dto);
    return { success: true, message: 'Приём успешно обновлён', data: appointment };
  }

  @Post(':id/start')
  async start(@Param('id', ParseIntPipe) id: number) {
    const appointment = await this.appointmentsService.start(id);
    return { success: true, message: 'Приём начат', data: appointment };
  }

  @Post(':id/complete')
  async complete(@Param('id', ParseIntPipe) id: number) {
    const appointment = await this.appointmentsService.complete(id);
    return { success: true, message: 'Приём завершён', data: appointment };
  }

  @Post(':id/cancel')
  async cancel(@Param('id', ParseIntPipe) id: number) {
    const appointment = await this.appointmentsService.cancel(id);
    return { success: true, message: 'Приём отменён', data: appointment };
  }
}
