import { parse } from 'date-fns';

export interface ValidationError {
  row: number;
  column: string;
  value: any;
  message: string;
}

export interface ValidationWarning {
  row: number;
  column: string;
  value: any;
  message: string;
}

export class CSVValidator {
  private errors: ValidationError[] = [];
  private warnings: ValidationWarning[] = [];

  // Required field validation
  required(value: any, row: number, column: string): boolean {
    if (value === undefined || value === null || value === '') {
      this.errors.push({
        row,
        column,
        value,
        message: `Required field '${column}' is missing`,
      });
      return false;
    }
    return true;
  }

  // Email validation
  email(value: string, row: number, column: string, isRequired = false): boolean {
    if (!value || value.trim() === '') {
      if (isRequired) {
        return this.required(value, row, column);
      }
      return true; // Optional email can be empty
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      this.errors.push({
        row,
        column,
        value,
        message: `Invalid email format: '${value}'`,
      });
      return false;
    }
    return true;
  }

  // Phone validation (flexible format)
  phone(value: string, row: number, column: string): boolean {
    if (!this.required(value, row, column)) return false;

    const cleaned = this.cleanPhone(value);
    if (cleaned.length < 10) {
      this.errors.push({
        row,
        column,
        value,
        message: `Phone number must have at least 10 digits: '${value}'`,
      });
      return false;
    }
    return true;
  }

  // Clean phone number to digits only
  cleanPhone(phone: string): string {
    return phone.replace(/\D/g, '');
  }

  // Date validation (YYYY-MM-DD)
  date(value: string, row: number, column: string): boolean {
    if (!this.required(value, row, column)) return false;

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(value)) {
      this.errors.push({
        row,
        column,
        value,
        message: `Invalid date format. Use YYYY-MM-DD: '${value}'`,
      });
      return false;
    }

    const parsedDate = parse(value, 'yyyy-MM-dd', new Date());
    if (isNaN(parsedDate.getTime())) {
      this.errors.push({
        row,
        column,
        value,
        message: `Invalid date: '${value}'`,
      });
      return false;
    }

    // Warning for old dates (>90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    if (parsedDate < ninetyDaysAgo) {
      this.warnings.push({
        row,
        column,
        value,
        message: `Sale date is more than 90 days old: '${value}'`,
      });
    }

    return true;
  }

  // Time validation (HH:MM)
  time(value: string, row: number, column: string): boolean {
    if (!this.required(value, row, column)) return false;

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(value)) {
      this.errors.push({
        row,
        column,
        value,
        message: `Invalid time format. Use HH:MM (24-hour): '${value}'`,
      });
      return false;
    }
    return true;
  }

  // Positive number validation
  positiveNumber(value: any, row: number, column: string): boolean {
    if (!this.required(value, row, column)) return false;

    const num = parseFloat(value);
    if (isNaN(num) || num < 0) {
      this.errors.push({
        row,
        column,
        value,
        message: `Must be a positive number: '${value}'`,
      });
      return false;
    }
    return true;
  }

  // Positive integer validation
  positiveInteger(value: any, row: number, column: string): boolean {
    if (!this.required(value, row, column)) return false;

    const num = parseInt(value);
    if (isNaN(num) || num < 1 || !Number.isInteger(parseFloat(value))) {
      this.errors.push({
        row,
        column,
        value,
        message: `Must be a positive integer: '${value}'`,
      });
      return false;
    }
    return true;
  }

  // Decimal validation (optional)
  decimal(value: any, row: number, column: string, isRequired = false): boolean {
    if (!value || value === '') {
      if (isRequired) {
        return this.required(value, row, column);
      }
      return true; // Optional decimal can be empty
    }

    const num = parseFloat(value);
    if (isNaN(num)) {
      this.errors.push({
        row,
        column,
        value,
        message: `Invalid decimal number: '${value}'`,
      });
      return false;
    }
    return true;
  }

  // Enum validation
  enum(value: string, row: number, column: string, allowedValues: string[]): boolean {
    if (!this.required(value, row, column)) return false;

    if (!allowedValues.includes(value.toUpperCase())) {
      this.errors.push({
        row,
        column,
        value,
        message: `Invalid value. Must be one of: ${allowedValues.join(', ')}`,
      });
      return false;
    }
    return true;
  }

  // Margin validation (cost vs price)
  margin(costPrice: any, unitPrice: any, row: number): boolean {
    if (!costPrice || !unitPrice) return true; // Skip if either is missing

    const cost = parseFloat(costPrice);
    const price = parseFloat(unitPrice);

    if (!isNaN(cost) && !isNaN(price) && cost > price) {
      this.warnings.push({
        row,
        column: 'cost_price',
        value: costPrice,
        message: `Cost price ($${cost}) is higher than unit price ($${price}) - negative margin!`,
      });
    }
    return true;
  }

  // Get all errors
  getErrors(): ValidationError[] {
    return this.errors;
  }

  // Get all warnings
  getWarnings(): ValidationWarning[] {
    return this.warnings;
  }

  // Check if validation passed
  isValid(): boolean {
    return this.errors.length === 0;
  }

  // Clear errors and warnings
  reset(): void {
    this.errors = [];
    this.warnings = [];
  }
}

// Helper function to parse CSV with papa parse
export function parseCSV(csvText: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const Papa = require('papaparse');

    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim(),
      complete: (results: any) => {
        resolve(results.data);
      },
      error: (error: any) => {
        reject(error);
      },
    });
  });
}

// Helper to clean and normalize data
export function cleanData(row: any): any {
  const cleaned: any = {};
  for (const key in row) {
    const value = row[key];
    cleaned[key] = typeof value === 'string' ? value.trim() : value;
  }
  return cleaned;
}
