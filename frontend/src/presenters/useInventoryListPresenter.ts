import { useState, useCallback, useEffect } from 'react';
import {
  InventoryItem,
  InventorySearchParams,
  InventoryType,
  InventoryStats,
  InventoryLog,
} from '../types/inventory.types';
import { inventoryModel } from '../models/inventory.model';

/**
 * Презентер списка склада
 */
export const useInventoryListPresenter = () => {
  // Состояние данных
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Состояние фильтров
  const [filters, setFilters] = useState<InventorySearchParams>({
    type: undefined,
    search: '',
    lowStock: false,
    expiringSoon: false,
  });

  // Состояние загрузки
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Активная вкладка
  const [activeTab, setActiveTab] = useState<'all' | 'lowStock' | 'expiring' | 'log'>('all');

  /**
   * Загрузка данных
   */
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [itemsResponse, statsData, logsData] = await Promise.all([
        inventoryModel.getAll({
          page: pagination.page,
          limit: pagination.limit,
          ...filters,
        }),
        inventoryModel.getStats(),
        inventoryModel.getLog({ limit: 20 }),
      ]);

      setItems(itemsResponse.items);
      setPagination((prev) => ({
        ...prev,
        total: itemsResponse.total,
        totalPages: itemsResponse.totalPages,
      }));
      setStats(statsData);
      setLogs(logsData);
    } catch (err) {
      setError('Ошибка загрузки данных склада');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * Изменение страницы
   */
  const handlePageChange = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  /**
   * Изменение фильтра типа
   */
  const handleTypeChange = useCallback((type: InventoryType | '') => {
    setFilters((prev) => ({ ...prev, type: type || undefined }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  /**
   * Изменение поиска
   */
  const handleSearchChange = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  /**
   * Переключение фильтра низкого остатка
   */
  const toggleLowStock = useCallback(() => {
    setFilters((prev) => ({ ...prev, lowStock: !prev.lowStock, expiringSoon: false }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  /**
   * Переключение фильтра истекающего срока
   */
  const toggleExpiring = useCallback(() => {
    setFilters((prev) => ({ ...prev, expiringSoon: !prev.expiringSoon, lowStock: false }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  /**
   * Сброс фильтров
   */
  const resetFilters = useCallback(() => {
    setFilters({
      type: undefined,
      search: '',
      lowStock: false,
      expiringSoon: false,
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  /**
   * Удаление позиции
   */
  const handleDelete = useCallback(
    async (id: number) => {
      if (!window.confirm('Удалить позицию со склада?')) return;

      try {
        await inventoryModel.delete(id);
        await loadData();
      } catch (err) {
        setError('Ошибка удаления');
        console.error(err);
      }
    },
    [loadData]
  );

  /**
   * Приход товара
   */
  const handleIncome = useCallback(
    async (id: number, quantity: number, reason?: string) => {
      try {
        await inventoryModel.income(id, { quantity, reason });
        await loadData();
      } catch (err) {
        setError('Ошибка прихода товара');
        console.error(err);
      }
    },
    [loadData]
  );

  /**
   * Списание товара
   */
  const handleExpense = useCallback(
    async (id: number, quantity: number, reason?: string) => {
      try {
        await inventoryModel.expense(id, { quantity, reason });
        await loadData();
      } catch (err) {
        setError('Ошибка списания товара');
        console.error(err);
      }
    },
    [loadData]
  );

  /**
   * Обновление данных
   */
  const refresh = useCallback(() => {
    loadData();
  }, [loadData]);

  return {
    // Данные
    items,
    stats,
    logs,
    pagination,
    filters,
    activeTab,

    // Состояние
    isLoading,
    error,

    // Методы
    setActiveTab,
    handlePageChange,
    handleTypeChange,
    handleSearchChange,
    toggleLowStock,
    toggleExpiring,
    resetFilters,
    handleDelete,
    handleIncome,
    handleExpense,
    refresh,
  };
};

export default useInventoryListPresenter;
