import { useState, useCallback, useEffect } from 'react';
import { Patient, PatientSearchParams } from '../types/patient.types';
import { PaginatedResponse } from '../types';
import { patientModel } from '../models/patient.model';

/**
 * Презентер списка пациентов
 */
export const usePatientListPresenter = () => {
  // Состояние данных
  const [patients, setPatients] = useState<Patient[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Состояние поиска и фильтров
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Состояние загрузки
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Дебаунс поиска
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  /**
   * Загрузка пациентов
   */
  const loadPatients = useCallback(async (params?: PatientSearchParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const response: PaginatedResponse<Patient> = await patientModel.getAll({
        page: params?.page || pagination.page,
        limit: params?.limit || pagination.limit,
        search: params?.search ?? debouncedSearch,
      });

      setPatients(response.items);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
      });
    } catch (err) {
      setError('Ошибка загрузки пациентов');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, debouncedSearch]);

  // Загрузка при изменении поиска или страницы
  useEffect(() => {
    loadPatients();
  }, [debouncedSearch, pagination.page]);

  /**
   * Изменение страницы
   */
  const handlePageChange = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  /**
   * Изменение поиска
   */
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  /**
   * Удаление пациента
   */
  const handleDelete = useCallback(async (id: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить пациента?')) {
      return;
    }

    try {
      await patientModel.delete(id);
      await loadPatients();
    } catch (err) {
      setError('Ошибка удаления пациента');
      console.error(err);
    }
  }, [loadPatients]);

  /**
   * Обновление списка
   */
  const refresh = useCallback(() => {
    loadPatients();
  }, [loadPatients]);

  return {
    // Данные
    patients,
    pagination,
    searchQuery,
    isLoading,
    error,

    // Методы
    handlePageChange,
    handleSearchChange,
    handleDelete,
    refresh,
  };
};

export default usePatientListPresenter;
