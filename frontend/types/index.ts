export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'MANAGER' | 'SALESPERSON';
  organizationId: string;
  locationId?: string;
  avatarUrl?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface Sale {
  id: string;
  transactionNumber: string;
  saleDate: string;
  saleTime: string;
  totalAmount: number;
  fcpAmount: number;
  hoursWorked: number;
  customerName?: string;
  notes?: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
  location: {
    id: string;
    name: string;
    code: string;
  };
}

export interface DailyPerformance {
  date: string;
  totalSales: number;
  fcpPercentage: number;
  salesPerHour: number;
  transactionCount: number;
  isStarDay: boolean;
  rankInLocation?: number;
  rankInOrganization?: number;
}

export interface LeaderboardEntry {
  rank: number;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  location: {
    id: string;
    name: string;
    code: string;
  };
  totalSales: number;
  fcpPercentage: number;
  salesPerHour: number;
  transactionCount: number;
  isStarDay: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
  error?: {
    message: string;
    code?: string;
  };
}
