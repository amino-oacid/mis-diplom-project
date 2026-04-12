import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from '../appointments/entities/appointment.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { PDFDocument } from 'pdf-lib';
import * as fontkit from '@pdf-lib/fontkit';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
  ) {}

  async getSummary() {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0]; // YYYY-MM-DD

    // Начало и конец текущего месяца
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Общее количество пациентов
    const totalPatients = await this.patientRepository.count();

    // Новые пациенты за этот месяц
    const newPatients = await this.patientRepository
      .createQueryBuilder('p')
      .where('p.createdAt >= :monthStart', { monthStart })
      .andWhere('p.createdAt <= :monthEnd', { monthEnd })
      .getCount();

    // Приёмы на сегодня (используем строковое сравнение даты)
    const todayAppointments = await this.appointmentRepository
      .createQueryBuilder('a')
      .where('a.appointmentDate = :today', { today: todayStr })
      .getCount();

    // Завершено за месяц
    const monthCompleted = await this.appointmentRepository
      .createQueryBuilder('a')
      .where('a.status = :status', { status: AppointmentStatus.COMPLETED })
      .andWhere('a.appointmentDate >= :monthStart', { monthStart: monthStart.toISOString().split('T')[0] })
      .andWhere('a.appointmentDate <= :monthEnd', { monthEnd: monthEnd.toISOString().split('T')[0] })
      .getCount();

    // Свободные слоты на сегодня (примерно: 18 слотов в день минус занятые)
    const todayBusySlots = await this.appointmentRepository
      .createQueryBuilder('a')
      .where('a.appointmentDate = :today', { today: todayStr })
      .andWhere('a.status != :cancelled', { cancelled: AppointmentStatus.CANCELLED })
      .getCount();
    const freeSlots = Math.max(0, 18 - todayBusySlots); // 18 слотов по 30 мин с 9:00 до 18:00

    // Позиции с низким остатком
    const lowStockItems = await this.inventoryRepository
      .createQueryBuilder('i')
      .where('i.quantity <= i.minQuantity')
      .getCount();

    return {
      totalPatients,
      newPatients,
      todayAppointments,
      monthCompleted,
      freeSlots,
      lowStockItems,
    };
  }

  async getAppointmentsReport(startDate?: string, endDate?: string) {
    // Дефолтные значения: последние 30 дней
    const now = new Date();
    const defaultEnd = now.toISOString().split('T')[0];
    const defaultStart = new Date(now.setDate(now.getDate() - 30)).toISOString().split('T')[0];

    const start = startDate || defaultStart;
    const end = endDate || defaultEnd;

    const rawAppointments = await this.appointmentRepository
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.doctor', 'doctor')
      .leftJoinAndSelect('doctor.user', 'user')
      .leftJoinAndSelect('a.service', 'service')
      .leftJoinAndSelect('a.patient', 'patient')
      .where('a.appointmentDate >= :startDate', { startDate: start })
      .andWhere('a.appointmentDate <= :endDate', { endDate: end })
      .orderBy('a.appointmentDate', 'ASC')
      .addOrderBy('a.startTime', 'ASC')
      .getMany();

    const total = rawAppointments.length;
    const byStatus = {
      scheduled: rawAppointments.filter((a) => a.status === AppointmentStatus.SCHEDULED).length,
      in_progress: rawAppointments.filter((a) => a.status === AppointmentStatus.IN_PROGRESS).length,
      completed: rawAppointments.filter((a) => a.status === AppointmentStatus.COMPLETED).length,
      cancelled: rawAppointments.filter((a) => a.status === AppointmentStatus.CANCELLED).length,
    };

    const byDoctor: Record<string, number> = {};
    rawAppointments.forEach((a) => {
      const doctorName = a.doctor?.user?.fullName || 'Неизвестно';
      byDoctor[doctorName] = (byDoctor[doctorName] || 0) + 1;
    });

    const revenue = rawAppointments
      .filter((a) => a.status === AppointmentStatus.COMPLETED && a.service)
      .reduce((sum, a) => sum + Number(a.service?.price || 0), 0);

    // Преобразуем в формат для фронтенда (простые строки вместо объектов)
    const appointments = rawAppointments.map((a) => ({
      id: a.id,
      date: a.appointmentDate,
      patient: a.patient?.fullName || 'Неизвестно',
      doctor: a.doctor?.user?.fullName || 'Неизвестно',
      service: a.service?.name || 'Без услуги',
      status: a.status,
      cost: Number(a.service?.price || 0),
    }));

    return { total, byStatus, byDoctor, revenue, appointments };
  }

  async getInventoryReport() {
    const items = await this.inventoryRepository.find();

    const totalItems = items.length;
    const totalValue = items.reduce((sum, i) => sum + i.quantity * Number(i.purchasePrice || 0), 0);

    const lowStockItems = items.filter((i) => i.quantity <= i.minQuantity);
    const lowStockCount = lowStockItems.length;

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const expiringItems = items.filter(
      (i) => i.expiryDate && new Date(i.expiryDate) <= thirtyDaysFromNow,
    );

    const byTypeMap: Record<string, { count: number; value: number }> = {};
    items.forEach((i) => {
      if (!byTypeMap[i.type]) {
        byTypeMap[i.type] = { count: 0, value: 0 };
      }
      byTypeMap[i.type].count++;
      byTypeMap[i.type].value += i.quantity * Number(i.purchasePrice || 0);
    });

    // Преобразуем в формат для фронтенда
    const byType = Object.entries(byTypeMap).map(([type, data]) => ({
      type,
      count: data.count,
      value: data.value,
    }));

    const lowStock = lowStockItems.map((i) => ({
      id: i.id,
      name: i.name,
      quantity: i.quantity,
      minQuantity: i.minQuantity,
      unit: i.unit,
    }));

    const expiring = expiringItems.map((i) => ({
      id: i.id,
      name: i.name,
      expiryDate: i.expiryDate
        ? (i.expiryDate instanceof Date ? i.expiryDate.toISOString().split('T')[0] : String(i.expiryDate).split('T')[0])
        : null,
      quantity: i.quantity,
    }));

    return {
      summary: {
        totalItems,
        totalValue,
        lowStockCount,
        expiringCount: expiringItems.length,
      },
      byType,
      lowStock,
      expiring,
      // Для совместимости с экспортом
      totalItems,
      totalValue,
      expiringItems,
    };
  }

  async getRevenueReport(startDate?: string, endDate?: string) {
    // Дефолтные значения: последние 30 дней
    const now = new Date();
    const defaultEnd = now.toISOString().split('T')[0];
    const defaultStart = new Date(now.setDate(now.getDate() - 30)).toISOString().split('T')[0];

    const start = startDate || defaultStart;
    const end = endDate || defaultEnd;

    const appointments = await this.appointmentRepository
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.service', 'service')
      .leftJoinAndSelect('a.doctor', 'doctor')
      .leftJoinAndSelect('doctor.user', 'user')
      .where('a.appointmentDate >= :startDate', { startDate: start })
      .andWhere('a.appointmentDate <= :endDate', { endDate: end })
      .andWhere('a.status = :status', { status: AppointmentStatus.COMPLETED })
      .orderBy('a.appointmentDate', 'ASC')
      .getMany();

    const totalRevenue = appointments.reduce((sum, a) => sum + Number(a.service?.price || 0), 0);

    const byService: Record<string, { count: number; revenue: number }> = {};
    appointments.forEach((a) => {
      const serviceName = a.service?.name || 'Без услуги';
      if (!byService[serviceName]) {
        byService[serviceName] = { count: 0, revenue: 0 };
      }
      byService[serviceName].count++;
      byService[serviceName].revenue += Number(a.service?.price || 0);
    });

    const byDoctor: Record<string, { count: number; revenue: number }> = {};
    appointments.forEach((a) => {
      const doctorName = a.doctor?.user?.fullName || 'Неизвестно';
      if (!byDoctor[doctorName]) {
        byDoctor[doctorName] = { count: 0, revenue: 0 };
      }
      byDoctor[doctorName].count++;
      byDoctor[doctorName].revenue += Number(a.service?.price || 0);
    });

    // Группировка по периодам (дням)
    const byPeriodMap: Record<string, { count: number; revenue: number }> = {};
    appointments.forEach((a) => {
      const period = String(a.appointmentDate).split('T')[0];
      if (!byPeriodMap[period]) {
        byPeriodMap[period] = { count: 0, revenue: 0 };
      }
      byPeriodMap[period].count++;
      byPeriodMap[period].revenue += Number(a.service?.price || 0);
    });

    const byPeriod = Object.entries(byPeriodMap).map(([period, data]) => ({
      period,
      count: data.count,
      revenue: data.revenue,
    }));

    // Топ докторов
    const topDoctors = Object.entries(byDoctor)
      .map(([name, data], idx) => ({
        id: idx + 1,
        name,
        count: data.count,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Топ услуг
    const topServices = Object.entries(byService)
      .map(([name, data], idx) => ({
        id: idx + 1,
        name,
        count: data.count,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    const appointmentsCount = appointments.length;
    const averageCheck = appointmentsCount > 0 ? totalRevenue / appointmentsCount : 0;

    return {
      summary: {
        totalRevenue,
        totalAppointments: appointmentsCount,
        averageCheck,
      },
      byPeriod,
      topDoctors,
      topServices,
      // Для совместимости с экспортом
      totalRevenue,
      byService,
      byDoctor,
      appointmentsCount,
    };
  }

  async exportAppointmentsToExcel(startDate?: string, endDate?: string): Promise<Buffer> {
    const report = await this.getAppointmentsReport(startDate, endDate);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Отчёт по приёмам');

    sheet.addRow(['Отчёт по приёмам']);
    sheet.addRow([`Период: ${startDate || 'последние 30 дней'} - ${endDate || 'сегодня'}`]);
    sheet.addRow([]);

    sheet.addRow(['Статистика']);
    sheet.addRow(['Всего приёмов', report.total]);
    sheet.addRow(['Выручка', report.revenue]);
    sheet.addRow([]);

    sheet.addRow(['По статусам']);
    sheet.addRow(['Запланировано', report.byStatus.scheduled]);
    sheet.addRow(['В процессе', report.byStatus.in_progress]);
    sheet.addRow(['Завершено', report.byStatus.completed]);
    sheet.addRow(['Отменено', report.byStatus.cancelled]);
    sheet.addRow([]);

    sheet.addRow(['По врачам']);
    Object.entries(report.byDoctor).forEach(([doctor, count]) => {
      sheet.addRow([doctor, count]);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async exportAppointmentsToPdf(startDate?: string, endDate?: string): Promise<Buffer> {
    const report = await this.getAppointmentsReport(startDate, endDate);

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const { font, boldFont } = await this.loadFonts(pdfDoc);

    let y = 800;
    const lineHeight = 20;

    page.drawText('Отчёт по приёмам', { x: 50, y, size: 18, font: boldFont });
    y -= lineHeight * 2;

    const periodStart = startDate || 'последние 30 дней';
    const periodEnd = endDate || 'сегодня';
    page.drawText(`Период: ${periodStart} - ${periodEnd}`, { x: 50, y, size: 12, font });
    y -= lineHeight * 2;

    page.drawText('Статистика', { x: 50, y, size: 14, font: boldFont });
    y -= lineHeight;
    page.drawText(`Всего приёмов: ${report.total}`, { x: 50, y, size: 11, font });
    y -= lineHeight;
    page.drawText(`Выручка: ${report.revenue} руб.`, { x: 50, y, size: 11, font });
    y -= lineHeight * 2;

    page.drawText('По статусам', { x: 50, y, size: 14, font: boldFont });
    y -= lineHeight;
    page.drawText(`Запланировано: ${report.byStatus.scheduled}`, { x: 50, y, size: 11, font });
    y -= lineHeight;
    page.drawText(`В процессе: ${report.byStatus.in_progress}`, { x: 50, y, size: 11, font });
    y -= lineHeight;
    page.drawText(`Завершено: ${report.byStatus.completed}`, { x: 50, y, size: 11, font });
    y -= lineHeight;
    page.drawText(`Отменено: ${report.byStatus.cancelled}`, { x: 50, y, size: 11, font });
    y -= lineHeight * 2;

    page.drawText('По врачам', { x: 50, y, size: 14, font: boldFont });
    y -= lineHeight;
    Object.entries(report.byDoctor).forEach(([doctor, count]) => {
      if (y > 50) {
        page.drawText(`${doctor}: ${count}`, { x: 50, y, size: 11, font });
        y -= lineHeight;
      }
    });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  async exportRevenueToExcel(startDate?: string, endDate?: string): Promise<Buffer> {
    const report = await this.getRevenueReport(startDate, endDate);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Отчёт по доходам');

    sheet.addRow(['Отчёт по доходам']);
    sheet.addRow([`Период: ${startDate} - ${endDate}`]);
    sheet.addRow([]);

    sheet.addRow(['Общая выручка', report.totalRevenue]);
    sheet.addRow(['Количество приёмов', report.appointmentsCount]);
    sheet.addRow([]);

    sheet.addRow(['По услугам']);
    sheet.addRow(['Услуга', 'Количество', 'Выручка']);
    Object.entries(report.byService).forEach(([service, data]) => {
      sheet.addRow([service, data.count, data.revenue]);
    });
    sheet.addRow([]);

    sheet.addRow(['По врачам']);
    sheet.addRow(['Врач', 'Количество', 'Выручка']);
    Object.entries(report.byDoctor).forEach(([doctor, data]) => {
      sheet.addRow([doctor, data.count, data.revenue]);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async exportRevenueToPdf(startDate?: string, endDate?: string): Promise<Buffer> {
    const report = await this.getRevenueReport(startDate, endDate);

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const { font, boldFont } = await this.loadFonts(pdfDoc);

    let y = 800;
    const lineHeight = 20;

    page.drawText('Отчёт по доходам', { x: 50, y, size: 18, font: boldFont });
    y -= lineHeight * 2;

    const periodStart = startDate || 'последние 30 дней';
    const periodEnd = endDate || 'сегодня';
    page.drawText(`Период: ${periodStart} - ${periodEnd}`, { x: 50, y, size: 12, font });
    y -= lineHeight * 2;

    page.drawText(`Общая выручка: ${report.totalRevenue} руб.`, { x: 50, y, size: 14, font: boldFont });
    y -= lineHeight;
    page.drawText(`Количество приёмов: ${report.appointmentsCount}`, { x: 50, y, size: 11, font });
    y -= lineHeight * 2;

    page.drawText('По услугам', { x: 50, y, size: 14, font: boldFont });
    y -= lineHeight;
    Object.entries(report.byService).forEach(([service, data]) => {
      if (y > 50) {
        page.drawText(`${service}: ${data.count} (${data.revenue} руб.)`, { x: 50, y, size: 11, font });
        y -= lineHeight;
      }
    });
    y -= lineHeight;

    page.drawText('По врачам', { x: 50, y, size: 14, font: boldFont });
    y -= lineHeight;
    Object.entries(report.byDoctor).forEach(([doctor, data]) => {
      if (y > 50) {
        page.drawText(`${doctor}: ${data.count} (${data.revenue} руб.)`, { x: 50, y, size: 11, font });
        y -= lineHeight;
      }
    });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  async exportInventoryToExcel(): Promise<Buffer> {
    const report = await this.getInventoryReport();

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Отчёт по складу');

    sheet.addRow(['Отчёт по складу']);
    sheet.addRow([]);

    sheet.addRow(['Общая статистика']);
    sheet.addRow(['Всего позиций', report.summary.totalItems]);
    sheet.addRow(['Общая стоимость', report.summary.totalValue]);
    sheet.addRow(['Низкий остаток', report.summary.lowStockCount]);
    sheet.addRow([]);

    sheet.addRow(['По типам']);
    sheet.addRow(['Тип', 'Количество', 'Стоимость']);
    report.byType.forEach((item) => {
      sheet.addRow([item.type, item.count, item.value]);
    });
    sheet.addRow([]);

    if (report.expiring.length > 0) {
      sheet.addRow(['Истекающие позиции']);
      sheet.addRow(['Название', 'Количество', 'Срок годности']);
      report.expiring.forEach((item) => {
        sheet.addRow([item.name, item.quantity, item.expiryDate]);
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async exportInventoryToPdf(): Promise<Buffer> {
    const report = await this.getInventoryReport();

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const { font, boldFont } = await this.loadFonts(pdfDoc);

    let y = 800;
    const lineHeight = 20;

    const typeLabels: Record<string, string> = {
      medication: 'Медикаменты',
      consumable: 'Расходные материалы',
      equipment: 'Оборудование',
    };

    page.drawText('Отчёт по складу', { x: 50, y, size: 18, font: boldFont });
    y -= lineHeight * 2;

    page.drawText('Общая статистика', { x: 50, y, size: 14, font: boldFont });
    y -= lineHeight;
    page.drawText(`Всего позиций: ${report.summary.totalItems}`, { x: 50, y, size: 11, font });
    y -= lineHeight;
    page.drawText(`Общая стоимость: ${report.summary.totalValue} руб.`, { x: 50, y, size: 11, font });
    y -= lineHeight;
    page.drawText(`Низкий остаток: ${report.summary.lowStockCount}`, { x: 50, y, size: 11, font });
    y -= lineHeight;
    page.drawText(`Истекает срок: ${report.summary.expiringCount}`, { x: 50, y, size: 11, font });
    y -= lineHeight * 2;

    page.drawText('По типам', { x: 50, y, size: 14, font: boldFont });
    y -= lineHeight;
    report.byType.forEach((item) => {
      const label = typeLabels[item.type] || item.type;
      page.drawText(`${label}: ${item.count} поз. (${item.value} руб.)`, { x: 50, y, size: 11, font });
      y -= lineHeight;
    });
    y -= lineHeight;

    if (report.lowStock.length > 0) {
      page.drawText('Позиции с низким остатком', { x: 50, y, size: 14, font: boldFont });
      y -= lineHeight;
      report.lowStock.forEach((item) => {
        if (y > 50) {
          page.drawText(`${item.name}: ${item.quantity}/${item.minQuantity} ${item.unit}`, { x: 50, y, size: 11, font });
          y -= lineHeight;
        }
      });
      y -= lineHeight;
    }

    if (report.expiring.length > 0 && y > 100) {
      page.drawText('Истекающий срок годности', { x: 50, y, size: 14, font: boldFont });
      y -= lineHeight;
      report.expiring.forEach((item) => {
        if (y > 50) {
          page.drawText(`${item.name}: ${item.expiryDate}`, { x: 50, y, size: 11, font });
          y -= lineHeight;
        }
      });
    }

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  private async loadFonts(pdfDoc: PDFDocument) {
    pdfDoc.registerFontkit(fontkit);

    // Проверяем оба возможных пути к шрифтам
    const possiblePaths = [
      path.join(process.cwd(), 'dist/assets/fonts'),
      path.join(process.cwd(), 'src/assets/fonts'),
    ];

    let fontsDir: string | null = null;
    for (const p of possiblePaths) {
      if (fs.existsSync(path.join(p, 'Roboto-Regular.ttf'))) {
        fontsDir = p;
        break;
      }
    }

    if (!fontsDir) {
      throw new Error(`Fonts not found in: ${possiblePaths.join(', ')}`);
    }

    const regularFontBytes = fs.readFileSync(path.join(fontsDir, 'Roboto-Regular.ttf'));
    const boldFontBytes = fs.readFileSync(path.join(fontsDir, 'Roboto-Bold.ttf'));

    const font = await pdfDoc.embedFont(regularFontBytes);
    const boldFont = await pdfDoc.embedFont(boldFontBytes);

    return { font, boldFont };
  }
}
