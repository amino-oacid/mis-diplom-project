import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { MedicalRecord } from '../medical-records/entities/medical-record.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { SearchPatientsDto } from './dto/search-patients.dto';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    @InjectRepository(MedicalRecord)
    private medicalRecordRepository: Repository<MedicalRecord>,
  ) {}

  async findAll(page = 1, limit = 20, search?: SearchPatientsDto) {
    const skip = (page - 1) * limit;

    const queryBuilder = this.patientRepository
      .createQueryBuilder('patient');

    if (search?.search) {
      const searchTerm = `%${search.search}%`;
      queryBuilder.andWhere(
        '(patient.lastName ILIKE :search OR patient.firstName ILIKE :search OR patient.middleName ILIKE :search OR patient.phone ILIKE :search)',
        { search: searchTerm },
      );
    }

    if (search?.lastName) {
      queryBuilder.andWhere('patient.lastName ILIKE :lastName', {
        lastName: `%${search.lastName}%`,
      });
    }

    if (search?.firstName) {
      queryBuilder.andWhere('patient.firstName ILIKE :firstName', {
        firstName: `%${search.firstName}%`,
      });
    }

    if (search?.phone) {
      queryBuilder.andWhere('patient.phone ILIKE :phone', {
        phone: `%${search.phone}%`,
      });
    }

    queryBuilder
      .orderBy('patient.lastName', 'ASC')
      .addOrderBy('patient.firstName', 'ASC')
      .skip(skip)
      .take(limit);

    const [patients, total] = await queryBuilder.getManyAndCount();

    return {
      data: patients.map((p) => this.toResponseDto(p)),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number): Promise<Patient> {
    const patient = await this.patientRepository.findOne({
      where: { id },
      relations: ['medicalRecord', 'appointments'],
    });

    if (!patient) {
      throw new NotFoundException('Пациент не найден');
    }

    return patient;
  }

  async create(dto: CreatePatientDto): Promise<Patient> {
    const existingByPhone = await this.patientRepository.findOne({
      where: { phone: dto.phone },
    });

    if (existingByPhone) {
      throw new ConflictException('Пациент с таким телефоном уже существует');
    }

    if (dto.snils) {
      const existingBySnils = await this.patientRepository.findOne({
        where: { snils: dto.snils },
      });

      if (existingBySnils) {
        throw new ConflictException('Пациент с таким СНИЛС уже существует');
      }
    }

    const patient = this.patientRepository.create(dto);

    await this.patientRepository.save(patient);

    // Создание ЭМК
    const cardNumber = `MK-${String(patient.id).padStart(6, '0')}`;
    const medicalRecord = this.medicalRecordRepository.create({
      patientId: patient.id,
      cardNumber,
    });

    await this.medicalRecordRepository.save(medicalRecord);

    return patient;
  }

  async update(id: number, dto: UpdatePatientDto): Promise<Patient> {
    const patient = await this.findOne(id);

    if (dto.phone && dto.phone !== patient.phone) {
      const existingByPhone = await this.patientRepository.findOne({
        where: { phone: dto.phone },
      });

      if (existingByPhone && existingByPhone.id !== id) {
        throw new ConflictException('Пациент с таким телефоном уже существует');
      }
    }

    Object.assign(patient, dto);

    await this.patientRepository.save(patient);

    return patient;
  }

  async remove(id: number): Promise<void> {
    const patient = await this.findOne(id);
    await this.patientRepository.remove(patient);
  }

  async getAppointments(patientId: number) {
    const patient = await this.patientRepository.findOne({
      where: { id: patientId },
      relations: ['appointments', 'appointments.doctor', 'appointments.doctor.user', 'appointments.service'],
    });

    if (!patient) {
      throw new NotFoundException('Пациент не найден');
    }

    return patient.appointments;
  }

  private toResponseDto(patient: Patient) {
    const birthDate = new Date(patient.birthDate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return {
      id: patient.id,
      lastName: patient.lastName,
      firstName: patient.firstName,
      middleName: patient.middleName,
      fullName: patient.fullName,
      birthDate: birthDate.toISOString().split('T')[0],
      age,
      gender: patient.gender,
      phone: patient.phone,
      email: patient.email,
      address: patient.address,
      snils: patient.snils,
      insurancePolicy: patient.insurancePolicy,
      createdAt: patient.createdAt,
    };
  }
}
