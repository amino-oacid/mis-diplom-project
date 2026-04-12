import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Prescription } from './entities/prescription.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { PrescriptionItemDto } from './dto/create-batch-prescriptions.dto';
import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class PrescriptionsService {
  constructor(
    @InjectRepository(Prescription)
    private prescriptionRepository: Repository<Prescription>,
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    private inventoryService: InventoryService,
    private dataSource: DataSource,
  ) {}

  async findAll() {
    return this.prescriptionRepository.find({
      relations: ['appointment', 'appointment.patient'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Prescription> {
    const prescription = await this.prescriptionRepository.findOne({
      where: { id },
      relations: ['appointment', 'appointment.patient'],
    });

    if (!prescription) {
      throw new NotFoundException('Назначение не найдено');
    }

    return prescription;
  }

  async findByAppointmentId(appointmentId: number) {
    return this.prescriptionRepository.find({
      where: { appointmentId },
      order: { createdAt: 'ASC' },
    });
  }

  async findByPatientId(patientId: number) {
    const appointments = await this.appointmentRepository.find({
      where: { patientId },
      relations: ['prescriptions'],
    });

    return appointments.flatMap((a) => a.prescriptions || []);
  }

  async createBatch(
    appointmentId: number,
    items: (PrescriptionItemDto & { patientId: number })[],
    userId: number,
  ) {
    if (!items || items.length === 0) {
      return [];
    }

    // Используем транзакцию для атомарности операций
    return this.dataSource.transaction(async (manager) => {
      // Сначала создаём назначения
      const prescriptions = items.map((item) =>
        manager.create(Prescription, {
          ...item,
          appointmentId,
        }),
      );

      const savedPrescriptions = await manager.save(Prescription, prescriptions);

      // Затем списываем со склада (если назначения успешно созданы)
      for (const item of items) {
        if (item.inventoryId && item.quantity) {
          await this.inventoryService.expenseWithManager(
            manager,
            item.inventoryId,
            item.quantity,
            userId,
            appointmentId,
            'Назначение пациенту',
          );
        }
      }

      return savedPrescriptions;
    });
  }

  async update(id: number, dto: UpdatePrescriptionDto): Promise<Prescription> {
    const prescription = await this.findOne(id);
    Object.assign(prescription, dto);
    await this.prescriptionRepository.save(prescription);
    return prescription;
  }

  async remove(id: number): Promise<void> {
    const prescription = await this.findOne(id);
    await this.prescriptionRepository.remove(prescription);
  }
}
