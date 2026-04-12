import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { SearchPatientsDto } from './dto/search-patients.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('patients')
@UseGuards(JwtAuthGuard)
export class PatientsController {
  constructor(private patientsService: PatientsService) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query() search?: SearchPatientsDto,
  ) {
    const result = await this.patientsService.findAll(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
      search,
    );
    return { success: true, ...result };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const patient = await this.patientsService.findOne(id);
    return { success: true, data: patient };
  }

  @Post()
  async create(@Body() dto: CreatePatientDto) {
    const patient = await this.patientsService.create(dto);
    return { success: true, message: 'Пациент успешно создан', data: patient };
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePatientDto) {
    const patient = await this.patientsService.update(id, dto);
    return { success: true, message: 'Пациент успешно обновлён', data: patient };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.patientsService.remove(id);
    return { success: true, message: 'Пациент успешно удалён' };
  }

  @Get(':id/appointments')
  async getAppointments(@Param('id', ParseIntPipe) id: number) {
    const appointments = await this.patientsService.getAppointments(id);
    return { success: true, data: appointments };
  }
}
