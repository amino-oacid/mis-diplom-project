import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from '../appointments/entities/appointment.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { InventoryLog } from '../inventory/entities/inventory-log.entity';
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
    @InjectRepository(InventoryLog)
    private inventoryLogRepository: Repository<InventoryLog>,
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

  async getInventoryReport(startDate?: string, endDate?: string) {
    // Дефолтные значения: последние 30 дней
    const now = new Date();
    const defaultEnd = now.toISOString().split('T')[0];
    const defaultStart = new Date(now.setDate(now.getDate() - 30)).toISOString().split('T')[0];

    const start = startDate || defaultStart;
    const end = endDate || defaultEnd;

    const [items, logs] = await Promise.all([
      this.inventoryRepository.find(),
      this.inventoryLogRepository
        .createQueryBuilder('log')
        .leftJoinAndSelect('log.inventory', 'inventory')
        .leftJoinAndSelect('log.performer', 'performer')
        .where('log.performedAt >= :startDate', { startDate: start })
        .andWhere('log.performedAt <= :endDate', { endDate: `${end} 23:59:59` })
        .orderBy('log.performedAt', 'DESC')
        .limit(100)
        .getMany(),
    ]);

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

    // Все позиции склада
    const allItems = items.map((i) => ({
      id: i.id,
      name: i.name,
      type: i.type,
      quantity: i.quantity,
      minQuantity: i.minQuantity,
      unit: i.unit,
    }));

    // Журнал движений
    const movements = logs.map((log) => ({
      id: log.id,
      date: log.performedAt,
      itemName: log.inventory?.name || 'Неизвестно',
      operationType: log.operationType,
      quantity: log.quantity,
      quantityAfter: log.quantityAfter,
      reason: log.reason,
      performerName: log.performer?.fullName || 'Неизвестно',
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
      items: allItems,
      movements,
      // Для совместимости с экспортом
      totalItems,
      totalValue,
      expiringItems,
    };
  }

  async exportAppointmentsToExcel(startDate?: string, endDate?: string): Promise<Buffer> {
    const report = await this.getAppointmentsReport(startDate, endDate);

    const statusLabels: Record<string, string> = {
      scheduled: 'Запланирован',
      in_progress: 'В процессе',
      completed: 'Завершён',
      cancelled: 'Отменён',
    };

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Приёмы');

    // Заголовок
    sheet.addRow(['Отчёт по приёмам']);
    sheet.addRow([`Период: ${startDate || 'последние 30 дней'} - ${endDate || 'сегодня'}`]);
    sheet.addRow([]);

    // Заголовки таблицы
    const headerRow = sheet.addRow(['Дата', 'Услуга', 'Цена', 'Статус']);
    headerRow.font = { bold: true };
    headerRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };
    });

    // Данные
    report.appointments.forEach((a) => {
      const date = new Date(a.date).toLocaleDateString('ru-RU');
      sheet.addRow([date, a.service, a.cost, statusLabels[a.status] || a.status]);
    });

    // Автоширина колонок
    sheet.columns.forEach((col) => { col.width = 20; });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async exportAppointmentsToPdf(startDate?: string, endDate?: string): Promise<Buffer> {
    const report = await this.getAppointmentsReport(startDate, endDate);

    const statusLabels: Record<string, string> = {
      scheduled: 'Запланирован',
      in_progress: 'В процессе',
      completed: 'Завершён',
      cancelled: 'Отменён',
    };

    const pdfDoc = await PDFDocument.create();
    // Альбомная ориентация для большей ширины
    let page = pdfDoc.addPage([842, 595]);
    const { font, boldFont } = await this.loadFonts(pdfDoc);

    let y = 550;
    const lineHeight = 18;
    const colWidths = [80, 350, 100, 120]; // Дата, Услуга, Цена, Статус
    const startX = 50;

    // Заголовок
    page.drawText('Отчёт по приёмам', { x: startX, y, size: 16, font: boldFont });
    y -= lineHeight * 1.5;

    const periodStart = startDate || 'последние 30 дней';
    const periodEnd = endDate || 'сегодня';
    page.drawText(`Период: ${periodStart} - ${periodEnd}`, { x: startX, y, size: 10, font });
    y -= lineHeight * 2;

    // Заголовки таблицы
    const headers = ['Дата', 'Услуга', 'Цена', 'Статус'];
    let x = startX;
    headers.forEach((header, i) => {
      page.drawText(header, { x, y, size: 10, font: boldFont });
      x += colWidths[i];
    });
    y -= lineHeight;

    // Данные таблицы
    for (const a of report.appointments) {
      if (y < 50) {
        page = pdfDoc.addPage([842, 595]);
        y = 550;
      }

      const date = new Date(a.date).toLocaleDateString('ru-RU');
      const price = `${a.cost} ₽`;
      const status = statusLabels[a.status] || a.status;

      x = startX;
      page.drawText(date, { x, y, size: 9, font });
      x += colWidths[0];
      page.drawText(a.service, { x, y, size: 9, font });
      x += colWidths[1];
      page.drawText(price, { x, y, size: 9, font });
      x += colWidths[2];
      page.drawText(status, { x, y, size: 9, font });

      y -= lineHeight;
    }

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  async exportInventoryToExcel(startDate?: string, endDate?: string): Promise<Buffer> {
    const report = await this.getInventoryReport(startDate, endDate);

    const operationLabels: Record<string, string> = {
      income: 'Приход',
      expense: 'Расход',
    };

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Журнал склада');

    // Заголовок
    sheet.addRow(['Журнал движения склада']);
    sheet.addRow([]);

    // Заголовки таблицы
    const headerRow = sheet.addRow(['Дата', 'Наименование', 'Операция', 'Кол-во', 'Остаток', 'Причина']);
    headerRow.font = { bold: true };
    headerRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };
    });

    // Данные
    report.movements.forEach((m) => {
      const date = new Date(m.date).toLocaleDateString('ru-RU');
      const operation = operationLabels[m.operationType] || m.operationType;
      const qty = m.operationType === 'income' ? `+${m.quantity}` : `-${m.quantity}`;
      sheet.addRow([date, m.itemName, operation, qty, m.quantityAfter, m.reason || '—']);
    });

    // Автоширина колонок
    sheet.columns = [
      { width: 12 },
      { width: 25 },
      { width: 12 },
      { width: 10 },
      { width: 10 },
      { width: 25 },
    ];

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async exportInventoryToPdf(startDate?: string, endDate?: string): Promise<Buffer> {
    const report = await this.getInventoryReport(startDate, endDate);

    const operationLabels: Record<string, string> = {
      income: 'Приход',
      expense: 'Расход',
    };

    const pdfDoc = await PDFDocument.create();
    // Альбомная ориентация для большей ширины
    let page = pdfDoc.addPage([842, 595]);
    const { font, boldFont } = await this.loadFonts(pdfDoc);

    let y = 550;
    const lineHeight = 18;
    const colWidths = [80, 250, 80, 70, 70, 180]; // Дата, Наименование, Операция, Кол-во, Остаток, Причина
    const startX = 40;

    // Заголовок
    page.drawText('Журнал движения склада', { x: startX, y, size: 16, font: boldFont });
    y -= lineHeight * 2;

    // Заголовки таблицы
    const headers = ['Дата', 'Наименование', 'Операция', 'Кол-во', 'Остаток', 'Причина'];
    let x = startX;
    headers.forEach((header, i) => {
      page.drawText(header, { x, y, size: 10, font: boldFont });
      x += colWidths[i];
    });
    y -= lineHeight;

    // Данные таблицы
    for (const m of report.movements) {
      if (y < 50) {
        page = pdfDoc.addPage([842, 595]);
        y = 550;
      }

      const date = new Date(m.date).toLocaleDateString('ru-RU');
      const operation = operationLabels[m.operationType] || m.operationType;
      const qty = m.operationType === 'income' ? `+${m.quantity}` : `-${m.quantity}`;
      const reason = m.reason || '—';

      x = startX;
      page.drawText(date, { x, y, size: 9, font });
      x += colWidths[0];
      page.drawText(m.itemName, { x, y, size: 9, font });
      x += colWidths[1];
      page.drawText(operation, { x, y, size: 9, font });
      x += colWidths[2];
      page.drawText(qty, { x, y, size: 9, font });
      x += colWidths[3];
      page.drawText(String(m.quantityAfter), { x, y, size: 9, font });
      x += colWidths[4];
      page.drawText(reason, { x, y, size: 9, font });

      y -= lineHeight;
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
