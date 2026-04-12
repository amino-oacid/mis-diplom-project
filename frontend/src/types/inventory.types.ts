import { PaginationParams } from './index';

export type InventoryType = 'medication' | 'consumable' | 'equipment';

export interface InventoryItem {
  id: number;
  name: string;
  type: InventoryType;
  quantity: number;
  unit: string;
  minQuantity: number;
  purchasePrice: number;
  expiryDate?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInventoryRequest {
  name: string;
  type: InventoryType;
  quantity: number;
  unit: string;
  minQuantity?: number;
  purchasePrice?: number;
  expiryDate?: string;
  description?: string;
}

export interface UpdateInventoryRequest extends Partial<CreateInventoryRequest> {}

export interface IncomeRequest {
  quantity: number;
  reason?: string;
}

export interface ExpenseRequest {
  quantity: number;
  reason?: string;
  appointmentId?: number;
}

export interface InventorySearchParams extends PaginationParams {
  type?: InventoryType;
  search?: string;
  lowStock?: boolean;
  expiringSoon?: boolean;
}

export interface InventoryLog {
  id: number;
  inventoryId: number;
  userId: number;
  action: 'income' | 'expense';
  quantity: number;
  reason?: string;
  appointmentId?: number;
  createdAt: string;
  inventory?: InventoryItem;
  user?: {
    id: number;
    fullName: string;
  };
}

export interface InventoryStats {
  totalItems: number;
  totalValue: number;
  lowStockCount: number;
  expiringCount: number;
  byType: {
    medication: number;
    consumable: number;
    equipment: number;
  };
}

export interface InventoryFormErrors {
  name?: string;
  type?: string;
  quantity?: string;
  unit?: string;
  purchasePrice?: string;
  general?: string;
}

export const inventoryTypeLabels: Record<InventoryType, string> = {
  medication: 'Медикаменты',
  consumable: 'Расходники',
  equipment: 'Оборудование',
};

export const inventoryTypeColors: Record<InventoryType, string> = {
  medication: '#3b82f6',
  consumable: '#22c55e',
  equipment: '#8b5cf6',
};
