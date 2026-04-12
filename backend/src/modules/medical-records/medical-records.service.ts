import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalRecord } from './entities/medical-record.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Appointment, AppointmentStatus } from '../appointments/entities/appointment.entity';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';

@Injectable()
export class MedicalRecordsService {
  constructor(
    @InjectRepository(MedicalRecord)
    private medicalRecordRepository: Repository<MedicalRecord>,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
  ) {}

  async findByPatientId(patientId: number): Promise<MedicalRecord> {
    const record = await this.medicalRecordRepository.findOne({
      where: { patientId },
      relations: ['patient'],
    });

    if (!record) {
      throw new NotFoundException('Медицинская карта не найдена');
    }

    return record;
  }

  async update(patientId: number, dto: UpdateMedicalRecordDto): Promise<MedicalRecord> {
    const record = await this.findByPatientId(patientId);

    Object.assign(record, dto);
    await this.medicalRecordRepository.save(record);

    return record;
  }

  async getHistory(patientId: number) {
    const appointments = await this.appointmentRepository.find({
      where: {
        patientId,
        status: AppointmentStatus.COMPLETED,
      },
      relations: ['doctor', 'doctor.user', 'service', 'prescriptions'],
      order: { appointmentDate: 'DESC' },
    });

    return appointments.map((a) => ({
      appointmentId: a.id,
      date: a.appointmentDate,
      doctor: a.doctor
        ? {
            id: a.doctor.id,
            fullName: a.doctor.user?.fullName || 'Не указан',
            specialization: a.doctor.specialization,
          }
        : null,
      service: a.service
        ? {
            id: a.service.id,
            name: a.service.name,
          }
        : null,
      complaints: a.complaints,
      diagnosis: a.diagnosis,
      conclusion: a.conclusion,
      recommendations: a.recommendations,
      prescriptions: (a.prescriptions || []).map((p) => ({
        id: p.id,
        medicationName: p.medicationName,
        dosage: p.dosage,
        frequency: p.frequency,
        duration: p.duration,
      })),
    }));
  }

  async getAllPrescriptions(patientId: number) {
    const appointments = await this.appointmentRepository.find({
      where: { patientId },
      relations: ['prescriptions'],
    });

    const allPrescriptions = appointments.flatMap((a) => a.prescriptions || []);

    return allPrescriptions;
  }
}
