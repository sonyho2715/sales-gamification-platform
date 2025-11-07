import apiClient from './client';
import { ApiResponse, Sale } from '@/types';

export interface CreateSaleData {
  userId: string;
  locationId: string;
  transactionNumber: string;
  saleDate: string;
  saleTime: string;
  totalAmount: number;
  fcpAmount: number;
  hoursWorked: number;
  customerName?: string;
  notes?: string;
  items: {
    productCategoryId?: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
}

export interface SalesFilters {
  userId?: string;
  locationId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export const salesApi = {
  createSale: async (data: CreateSaleData): Promise<Sale> => {
    const response = await apiClient.post<ApiResponse<Sale>>('/sales', data);
    return response.data.data;
  },

  getSales: async (filters: SalesFilters = {}): Promise<{ sales: Sale[]; meta: any }> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const response = await apiClient.get<ApiResponse<Sale[]>>(`/sales?${params.toString()}`);
    return {
      sales: response.data.data,
      meta: response.data.meta,
    };
  },

  getSale: async (id: string): Promise<Sale> => {
    const response = await apiClient.get<ApiResponse<Sale>>(`/sales/${id}`);
    return response.data.data;
  },

  updateSale: async (id: string, data: Partial<CreateSaleData>): Promise<Sale> => {
    const response = await apiClient.put<ApiResponse<Sale>>(`/sales/${id}`, data);
    return response.data.data;
  },

  deleteSale: async (id: string): Promise<void> => {
    await apiClient.delete(`/sales/${id}`);
  },

  getDailySummary: async (date?: string): Promise<any> => {
    const params = date ? `?date=${date}` : '';
    const response = await apiClient.get<ApiResponse<any>>(`/sales/daily-summary${params}`);
    return response.data.data;
  },
};
