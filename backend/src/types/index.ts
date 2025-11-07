import { Request } from 'express';
import { UserRole } from '@prisma/client';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  organizationId: string;
  locationId?: string;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organizationId: string;
  locationId?: string;
  hireDate?: Date;
}

export interface CreateSaleDto {
  userId: string;
  locationId: string;
  transactionNumber: string;
  saleDate: Date;
  saleTime: Date;
  totalAmount: number;
  fcpAmount: number;
  hoursWorked: number;
  customerName?: string;
  notes?: string;
  items: CreateSaleItemDto[];
}

export interface CreateSaleItemDto {
  productCategoryId?: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CreateGoalDto {
  userId?: string;
  locationId?: string;
  goalType: string;
  targetValue: number;
  periodStart: Date;
  periodEnd: Date;
}

export interface PerformanceMetrics {
  totalSales: number;
  totalFcp: number;
  fcpPercentage: number;
  salesPerHour: number;
  transactionCount: number;
  averageSale: number;
}

export interface GoalProgress {
  goalId: string;
  userId: string;
  currentValue: number;
  targetValue: number;
  percentage: number;
  status: 'in_progress' | 'achieved';
  remainingDays: number;
}
