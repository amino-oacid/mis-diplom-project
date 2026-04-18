export interface ReportParams {
  dateFrom?: string;
  dateTo?: string;
  doctorId?: number;
  serviceId?: number;
  format?: 'json' | 'pdf' | 'excel';
  groupBy?: 'day' | 'week' | 'month' | 'doctor' | 'service';
}

export interface DashboardSummary {
  period: {
    from: string;
    to: string;
  };
  // Статистика для карточек
  todayAppointments: number;
  newPatients: number;
  freeSlots: number;
  monthCompleted: number;
  // Детальная статистика
  appointments: {
    total: number;
    completed: number;
    cancelled: number;
    scheduled: number;
  };
  revenue: {
    total: number;
    averageCheck: number;
    topDoctors: {
      id: number;
      name: string;
      count: number;
      revenue: number;
    }[];
    topServices: {
      id: number;
      name: string;
      count: number;
      revenue: number;
    }[];
  };
  inventory: {
    totalItems: number;
    totalValue: number;
    lowStockCount: number;
    expiringSoonCount: number;
    alerts: {
      type: string;
      message: string;
    }[];
  };
}

export interface AppointmentsReport {
  summary: {
    total: number;
    completed: number;
    cancelled: number;
    scheduled: number;
    inProgress: number;
  };
  byDoctor: {
    doctorId: number;
    doctorName: string;
    count: number;
  }[];
  byService: {
    serviceId: number;
    serviceName: string;
    count: number;
  }[];
  appointments: {
    id: number;
    date: string;
    patient: string;
    doctor: string;
    service: string;
    status: string;
    cost: number;
  }[];
}

export interface InventoryReport {
  summary: {
    totalItems: number;
    totalValue: number;
    lowStockCount: number;
    expiringCount: number;
  };
  byType: {
    type: string;
    count: number;
    value: number;
  }[];
  lowStock: {
    id: number;
    name: string;
    quantity: number;
    minQuantity: number;
    unit?: string;
  }[];
  expiring: {
    id: number;
    name: string;
    expiryDate: string;
    quantity: number;
  }[];
  items?: {
    id: number;
    name: string;
    type: string;
    quantity: number;
    minQuantity: number;
    unit?: string;
  }[];
  movements?: {
    id: number;
    date: string;
    itemName: string;
    operationType: 'income' | 'expense';
    quantity: number;
    quantityAfter: number;
    reason: string | null;
    performerName: string;
  }[];
}
