import { useState, useCallback, useEffect } from 'react';
import {
  Appointment,
  AppointmentSearchParams,
} from '../types/appointment.types';
import { PaginatedResponse } from '../types';
import { appointmentModel } from '../models/appointment.model';

/**
 * Презентер списка приёмов
 */
export const useAppointmentListPresenter = () => {
  // Состояние данных
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Состояние фильтров
  const [filters, setFilters] = useState<AppointmentSearchParams>({
    search: '',
    dateFrom: '',
    dateTo: '',
    doctorId: undefined,
    status: undefined,
  });

  // Состояние загрузки
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Загрузка приёмов
   */
  const loadAppointments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params: AppointmentSearchParams = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      };

      // Удаляем пустые значения
      Object.keys(params).forEach((key) => {
        const k = key as keyof AppointmentSearchParams;
        if (params[k] === '' || params[k] === undefined) {
          delete params[k];
        }
      });

      const response: PaginatedResponse<Appointment> = await appointmentModel.getAll(params);

      setAppointments(response.items);
      setPagination((prev) => ({
        ...prev,
        total: response.total,
        totalPages: response.totalPages,
      }));
    } catch (err) {
      setError('Ошибка загрузки приёмов');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  // Загрузка при изменении фильтров или страницы
  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  /**
   * Изменение страницы
   */
  const handlePageChange = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  /**
   * Изменение фильтров
   */
  const handleFilterChange = useCallback(
    (field: keyof AppointmentSearchParams) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const value = e.target.value;
        setFilters((prev) => ({ ...prev, [field]: value || undefined }));
        setPagination((prev) => ({ ...prev, page: 1 }));
      },
    []
  );

  /**
   * Сброс фильтров
   */
  const handleResetFilters = useCallback(() => {
    setFilters({
      search: '',
      dateFrom: '',
      dateTo: '',
      doctorId: undefined,
      status: undefined,
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  /**
   * Отмена приёма
   */
  const handleCancel = useCallback(
    async (id: number) => {
      if (!window.confirm('Вы уверены, что хотите отменить приём?')) {
        return;
      }

      try {
        await appointmentModel.cancel(id);
        await loadAppointments();
      } catch (err) {
        setError('Ошибка отмены приёма');
        console.error(err);
      }
    },
    [loadAppointments]
  );

  /**
   * Начать приём
   */
  const handleStart = useCallback(
    async (id: number) => {
      try {
        await appointmentModel.start(id);
        await loadAppointments();
      } catch (err) {
        setError('Ошибка начала приёма');
        console.error(err);
      }
    },
    [loadAppointments]
  );

  /**
   * Обновление списка
   */
  const refresh = useCallback(() => {
    loadAppointments();
  }, [loadAppointments]);

  /**
   * Фильтр по дате (сегодня)
   */
  const setTodayFilter = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    setFilters((prev) => ({ ...prev, dateFrom: today, dateTo: today }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  return {
    // Данные
    appointments,
    pagination,
    filters,
    isLoading,
    error,

    // Методы
    handlePageChange,
    handleFilterChange,
    handleResetFilters,
    handleCancel,
    handleStart,
    refresh,
    setTodayFilter,
  };
};

export default useAppointmentListPresenter;
