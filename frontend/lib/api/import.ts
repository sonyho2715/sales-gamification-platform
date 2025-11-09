import { apiClient } from './client';
import axios from 'axios';

export interface CSVPreviewResult {
  valid: boolean;
  totalRows: number;
  estimatedSales: number;
  estimatedCustomers: number;
  errors: Array<{
    row: number;
    column: string;
    value: any;
    message: string;
  }>;
  warnings: Array<{
    row: number;
    column: string;
    value: any;
    message: string;
  }>;
  preview: any[];
}

export interface CSVImportResult {
  success: boolean;
  totalRows: number;
  processedRows: number;
  salesCreated: number;
  customersCreated: number;
  errors: any[];
  warnings: any[];
  summary: {
    totalSalesAmount: number;
    totalFCP: number;
    salesBySalesperson: Array<{
      salesperson: string;
      totalSales: number;
    }>;
  };
}

/**
 * Preview a sales CSV file before importing
 */
export async function previewSalesCSV(file: File): Promise<CSVPreviewResult> {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await apiClient.post('/import/sales/preview', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return data.data;
}

/**
 * Import sales from a CSV file
 */
export async function importSalesCSV(file: File, onUploadProgress?: (progressEvent: any) => void): Promise<CSVImportResult> {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await apiClient.post('/import/sales/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
  });

  return data.data;
}

/**
 * Download a CSV template
 */
export async function downloadCSVTemplate(type: 'sales' | 'customers' | 'users'): Promise<void> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const response = await axios.get(`${API_URL}/import/templates/${type}`, {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
    },
    responseType: 'blob',
  });

  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${type}-import-template.csv`);
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export const importApi = {
  previewSalesCSV,
  importSalesCSV,
  downloadCSVTemplate,
};
