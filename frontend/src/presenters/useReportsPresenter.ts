import { useState, useCallback } from 'react';
import {
  ReportParams,
  AppointmentsReport,
  InventoryReport,
} from '../types/report.types';
import { reportModel } from '../models/report.model';

type ReportType = 'appointments' | 'inventory';

/**
 * Презентер отчётов
 */
export const useReportsPresenter = () => {
  // Активный тип отчёта (по умолчанию - приёмы)
  const [activeReport, setActiveReport] = useState<ReportType>('appointments');

  // Параметры фильтрации (вводимые значения)
  const [params, setParams] = useState<ReportParams>({
    dateFrom: '',
    dateTo: '',
    groupBy: 'month',
  });

  // Применённые параметры (для запроса)
  const [appliedParams, setAppliedParams] = useState<ReportParams>({
    dateFrom: '',
    dateTo: '',
    groupBy: 'month',
  });

  // Данные отчётов
  const [appointmentsReport, setAppointmentsReport] = useState<AppointmentsReport | null>(null);
  const [inventoryReport, setInventoryReport] = useState<InventoryReport | null>(null);

  // Состояние
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Загрузка отчёта
   */
  const loadReport = useCallback(async (paramsToUse: ReportParams) => {
    setIsLoading(true);
    setError(null);

    try {
      switch (activeReport) {
        case 'appointments':
          const appointmentsData = await reportModel.getAppointmentsReport(paramsToUse);
          setAppointmentsReport(appointmentsData);
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
  }, [activeReport]);

  /**
   * Изменение типа отчёта
   */
  const handleReportChange = useCallback((type: ReportType) => {
    setActiveReport(type);
    // Сбрасываем данные при смене вкладки
    if (type === 'appointments') {
      setInventoryReport(null);
    } else {
      setAppointmentsReport(null);
    }
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
    setAppliedParams(params);
    loadReport(params);
  }, [params, loadReport]);

  /**
   * Экспорт в PDF
   */
  const exportPdf = useCallback(async () => {
    setIsExporting(true);
    try {
      const blob = await reportModel.exportReport(activeReport, 'pdf', appliedParams);
      const filename = `${activeReport}-report-${new Date().toISOString().split('T')[0]}.pdf`;
      reportModel.downloadFile(blob, filename);
    } catch (err) {
      setError('Ошибка экспорта PDF');
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  }, [activeReport, appliedParams]);

  /**
   * Экспорт в Excel
   */
  const exportExcel = useCallback(async () => {
    setIsExporting(true);
    try {
      const blob = await reportModel.exportReport(activeReport, 'excel', appliedParams);
      const filename = `${activeReport}-report-${new Date().toISOString().split('T')[0]}.xlsx`;
      reportModel.downloadFile(blob, filename);
    } catch (err) {
      setError('Ошибка экспорта Excel');
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  }, [activeReport, appliedParams]);

  return {
    // Данные
    activeReport,
    params,
    appointmentsReport,
    inventoryReport,

    // Состояние
    isLoading,
    isExporting,
    error,

    // Методы
    handleReportChange,
    handleParamChange,
    applyFilters,
    exportPdf,
    exportExcel,
  };
};

export default useReportsPresenter;
