import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, FindOptionsWhere } from 'typeorm';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { FilterAppointmentsDto } from './dto/filter-appointments.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
  ) {}

  async findAll(filters?: FilterAppointmentsDto) {
    const page = parseInt(filters?.page, 10) || 1;
    const limit = parseInt(filters?.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.appointmentRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.patient', 'patient')
      .leftJoinAndSelect('appointment.doctor', 'doctor')
      .leftJoinAndSelect('doctor.user', 'user')
      .leftJoinAndSelect('appointment.service', 'service');

    if (filters?.doctorId) {
      queryBuilder.andWhere('appointment.doctorId = :doctorId', { doctorId: filters.doctorId });
    }

    if (filters?.patientId) {
      queryBuilder.andWhere('appointment.patientId = :patientId', { patientId: filters.patientId });
    }

    if (filters?.status) {
      queryBuilder.andWhere('appointment.status = :status', { status: filters.status });
    }

    if (filters?.date) {
      queryBuilder.andWhere('appointment.appointmentDate = :date', { date: filters.date });
    }

    if (filters?.startDate && filters?.endDate) {
      queryBuilder.andWhere('appointment.appointmentDate BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    queryBuilder.orderBy('appointment.appointmentDate', 'ASC').addOrderBy('appointment.startTime', 'ASC');

    const total = await queryBuilder.getCount();
    const items = await queryBuilder.skip(skip).take(limit).getMany();

    return {
      data: items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['patient', 'doctor', 'doctor.user', 'service', 'prescriptions'],
    });

    if (!appointment) {
      throw new NotFoundException('Приём не найден');
    }

    return appointment;
  }

  async create(dto: CreateAppointmentDto): Promise<Appointment> {
    const patient = await this.patientRepository.findOne({ where: { id: dto.patientId } });
    if (!patient) {
      throw new NotFoundException('Пациент не найден');
    }

    const doctor = await this.doctorRepository.findOne({ where: { id: dto.doctorId } });
    if (!doctor) {
      throw new NotFoundException('Врач не найден');
    }

    // Проверка на пересечение времени
    const appointments = await this.appointmentRepository.find({
      where: {
        doctorId: dto.doctorId,
        appointmentDate: new Date(dto.appointmentDate),
        status: Not(AppointmentStatus.CANCELLED),
      },
    });

    const hasOverlap = appointments.some((apt) => {
      return (
        (dto.startTime >= apt.startTime && dto.startTime < apt.endTime) ||
        (dto.endTime > apt.startTime && dto.endTime <= apt.endTime) ||
        (dto.startTime <= apt.startTime && dto.endTime >= apt.endTime)
      );
    });

    if (hasOverlap) {
      throw new BadRequestException('Выбранное время занято');
    }

    const appointment = this.appointmentRepository.create({
      ...dto,
      appointmentDate: new Date(dto.appointmentDate),
      status: AppointmentStatus.SCHEDULED,
    });

    await this.appointmentRepository.save(appointment);

    return this.findOne(appointment.id);
  }

  async update(id: number, dto: UpdateAppointmentDto): Promise<Appointment> {
    const appointment = await this.findOne(id);

    Object.assign(appointment, dto);
    if (dto.appointmentDate) {
      appointment.appointmentDate = new Date(dto.appointmentDate);
    }

    await this.appointmentRepository.save(appointment);

    return this.findOne(id);
  }

  async start(id: number): Promise<Appointment> {
    const appointment = await this.findOne(id);

    if (appointment.status !== AppointmentStatus.SCHEDULED) {
      throw new BadRequestException('Можно начать только запланированный приём');
    }

    appointment.status = AppointmentStatus.IN_PROGRESS;
    await this.appointmentRepository.save(appointment);

    return appointment;
  }

  async complete(id: number): Promise<Appointment> {
    const appointment = await this.findOne(id);

    if (appointment.status !== AppointmentStatus.IN_PROGRESS) {
      throw new BadRequestException('Можно завершить только приём в процессе');
    }

    appointment.status = AppointmentStatus.COMPLETED;
    await this.appointmentRepository.save(appointment);

    return appointment;
  }

  async cancel(id: number): Promise<Appointment> {
    const appointment = await this.findOne(id);

    if (appointment.status === AppointmentStatus.COMPLETED) {
      throw new BadRequestException('Нельзя отменить завершённый приём');
    }

    appointment.status = AppointmentStatus.CANCELLED;
    await this.appointmentRepository.save(appointment);

    return appointment;
  }

  async getSlots(doctorId: number, date: string) {
    const appointments = await this.appointmentRepository.find({
      where: {
        doctorId,
        appointmentDate: new Date(date),
        status: Not(AppointmentStatus.CANCELLED),
      },
    }); // Получаем все приёмы для указанного врача и даты НЕотмененные (запланированные и в процессе), те занятые слоты

    const busySlots = appointments.map((a) => ({
      start: a.startTime,
      end: a.endTime,
    })); // Формируем занятые слоты по времени начала и конца приема

    // Генерация свободных слотов (9:00 - 18:00, по 30 минут)
    const allSlots = [];
    for (let hour = 9; hour < 18; hour++) {
      for (let min = 0; min < 60; min += 30) {
        const start = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
        const endHour = min === 30 ? hour + 1 : hour;
        const endMin = min === 30 ? 0 : 30;
        const end = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;

        const isBusy = busySlots.some(
          (slot) =>
            (start >= slot.start && start < slot.end) ||
            (end > slot.start && end <= slot.end),
        ); // Определяем какие слоты заняты

        allSlots.push({ startTime: start, endTime: end, available: !isBusy }); // Возвращаем все слоты с пометкой, свободен он или нет
      }
    }

    return allSlots;
  }

  async getTodayAppointments(doctorId?: number): Promise<Appointment[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const where: FindOptionsWhere<Appointment> = { appointmentDate: today };
    if (doctorId) {
      where.doctorId = doctorId;
    }

    return this.appointmentRepository.find({
      where,
      relations: ['patient', 'doctor', 'doctor.user', 'service'],
      order: { startTime: 'ASC' },
    });
  }
}
