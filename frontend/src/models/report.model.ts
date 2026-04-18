import api from '../services/api';
import {
  ReportParams,
  DashboardSummary,
  AppointmentsReport,
  InventoryReport,
} from '../types/report.types';

/**
 * Модель отчётов
 * API-вызовы для работы с отчётами
 */
export const reportModel = {

  async getSummary(): Promise<DashboardSummary> {
    const response = await api.get<{ success: boolean; data: DashboardSummary }>('/reports/summary');
    return response.data.data;
  },

  async getAppointmentsReport(params?: ReportParams): Promise<AppointmentsReport> {
    const queryParams = params ? {
      startDate: params.dateFrom || undefined,
      endDate: params.dateTo || undefined,
    } : undefined;
    const response = await api.get<{ success: boolean; data: AppointmentsReport }>('/reports/appointments', { params: queryParams });
    return response.data.data;
  },

  async getInventoryReport(params?: ReportParams): Promise<InventoryReport> {
    const response = await api.get<{ success: boolean; data: InventoryReport }>('/reports/inventory', { params });
    return response.data.data;
  },

  async exportReport(
    type: 'appointments' | 'inventory',
    format: 'pdf' | 'excel',
    params?: Omit<ReportParams, 'format'>
  ): Promise<Blob> {
    const queryParams = {
      format,
      startDate: params?.dateFrom || undefined,
      endDate: params?.dateTo || undefined,
    };
    const response = await api.get(`/reports/${type}`, {
      params: queryParams,
      responseType: 'blob',
    });
    return response.data;
  },

  downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};

export default reportModel;
