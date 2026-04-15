import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('doctors')
@UseGuards(JwtAuthGuard)
export class DoctorsController {
  constructor(private doctorsService: DoctorsService) {}

  @Get()
  async findAll() {
    const doctors = await this.doctorsService.findAll();
    return { success: true, data: doctors };
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDoctorDto) {
    const doctor = await this.doctorsService.update(id, dto);
    return { success: true, data: doctor };
  }
}
