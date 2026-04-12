import { useState, useCallback, useEffect } from 'react';
import {
  ReportParams,
  AppointmentsReport,
  RevenueReport,
  InventoryReport,
} from '../types/report.types';
import { reportModel } from '../models/report.model';

type ReportType = 'appointments' | 'revenue' | 'inventory';

/**
 * Презентер отчётов
 */
export const useReportsPresenter = () => {
  // Активный тип отчёта (по умолчанию - приёмы)
  const [activeReport, setActiveReport] = useState<ReportType>('appointments');

  // Параметры фильтрации
  const [params, setParams] = useState<ReportParams>({
    dateFrom: '',
    dateTo: '',
    groupBy: 'month',
  });

  // Данные отчётов
  const [appointmentsReport, setAppointmentsReport] = useState<AppointmentsReport | null>(null);
  const [revenueReport, setRevenueReport] = useState<RevenueReport | null>(null);
  const [inventoryReport, setInventoryReport] = useState<InventoryReport | null>(null);

  // Состояние
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Загрузка отчёта
   */
  const loadReport = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      switch (activeReport) {
        case 'appointments':
          const appointmentsData = await reportModel.getAppointmentsReport(params);
          setAppointmentsReport(appointmentsData);
          break;

        case 'revenue':
          const revenueData = await reportModel.getRevenueReport(params);
          setRevenueReport(revenueData);
          break;

        case 'inventory':
          const inventoryData = await reportModel.getInventoryReport();
          setInventoryReport(inventoryData);
          break;
      }
    } catch (err) {
      setError('Ошибка загрузки отчёта');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [activeReport, params]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  /**
   * Изменение типа отчёта
   */
  const handleReportChange = useCallback((type: ReportType) => {
    setActiveReport(type);
  }, []);

  /**
   * Изменение параметров
   */
  const handleParamChange = useCallback(
    (field: keyof ReportParams) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setParams((prev) => ({ ...prev, [field]: e.target.value }));
      },
    []
  );

  /**
   * Применение фильтров
   */
  const applyFilters = useCallback(() => {
    loadReport();
  }, [loadReport]);

  /**
   * Сброс фильтров
   */
  const resetFilters = useCallback(() => {
    setParams({
      dateFrom: '',
      dateTo: '',
      groupBy: 'month',
    });
  }, []);

  /**
   * Экспорт в PDF
   */
  const exportPdf = useCallback(async () => {
    setIsExporting(true);
    try {
      const blob = await reportModel.exportReport(activeReport, 'pdf', params);
      const filename = `${activeReport}-report-${new Date().toISOString().split('T')[0]}.pdf`;
      reportModel.downloadFile(blob, filename);
    } catch (err) {
      setError('Ошибка экспорта PDF');
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  }, [activeReport, params]);

  /**
   * Экспорт в Excel
   */
  const exportExcel = useCallback(async () => {
    setIsExporting(true);
    try {
      const blob = await reportModel.exportReport(activeReport, 'excel', params);
      const filename = `${activeReport}-report-${new Date().toISOString().split('T')[0]}.xlsx`;
      reportModel.downloadFile(blob, filename);
    } catch (err) {
      setError('Ошибка экспорта Excel');
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  }, [activeReport, params]);

  return {
    // Данные
    activeReport,
    params,
    appointmentsReport,
    revenueReport,
    inventoryReport,

    // Состояние
    isLoading,
    isExporting,
    error,

    // Методы
    handleReportChange,
    handleParamChange,
    applyFilters,
    resetFilters,
    exportPdf,
    exportExcel,
    refresh: loadReport,
  };
};

export default useReportsPresenter;
