import api from '../services/api';
import {
  InventoryItem,
  CreateInventoryRequest,
  UpdateInventoryRequest,
  IncomeRequest,
  ExpenseRequest,
  InventorySearchParams,
  InventoryLog,
  InventoryStats,
} from '../types/inventory.types';
import { PaginatedResponse } from '../types';

/**
 * Модель склада
 * API-вызовы для работы со складом
 */
export const inventoryModel = {

  async getAll(params?: InventorySearchParams): Promise<PaginatedResponse<InventoryItem>> {
    const response = await api.get<{
      success: boolean;
      data: InventoryItem[];
      pagination: { page: number; limit: number; total: number; pages: number };
    }>('/inventory', { params });
    return {
      items: response.data.data || [],
      total: response.data.pagination?.total || 0,
      page: response.data.pagination?.page || 1,
      limit: response.data.pagination?.limit || 10,
      totalPages: response.data.pagination?.pages || 0,
    };
  },

  async getById(id: number): Promise<InventoryItem> {
    const response = await api.get<{ success: boolean; data: InventoryItem }>(`/inventory/${id}`);
    return response.data.data;
  },

  async create(data: CreateInventoryRequest): Promise<InventoryItem> {
    const response = await api.post<{ success: boolean; data: InventoryItem }>('/inventory', data);
    return response.data.data;
  },

  async update(id: number, data: UpdateInventoryRequest): Promise<InventoryItem> {
    const response = await api.put<{ success: boolean; data: InventoryItem }>(`/inventory/${id}`, data);
    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/inventory/${id}`);
  },

  async income(id: number, data: IncomeRequest): Promise<InventoryItem> {
    const response = await api.post<{ success: boolean; data: InventoryItem }>(`/inventory/${id}/income`, data);
    return response.data.data;
  },

  async expense(id: number, data: ExpenseRequest): Promise<InventoryItem> {
    const response = await api.post<{ success: boolean; data: InventoryItem }>(`/inventory/${id}/expense`, data);
    return response.data.data;
  },

  async getStats(): Promise<InventoryStats> {
    const response = await api.get<{ success: boolean; data: InventoryStats }>('/inventory/stats');
    return response.data.data;
  },

  async getLog(params?: { inventoryId?: number; limit?: number }): Promise<InventoryLog[]> {
    const response = await api.get<{ success: boolean; data: InventoryLog[] }>('/inventory/log', { params });
    return response.data.data || [];
  },
};

export default inventoryModel;
