import apiClient from './client';
import { ApiResponse, LeaderboardEntry, DailyPerformance } from '@/types';

export interface LeaderboardFilters {
  scope?: 'organization' | 'location';
  locationId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export const performanceApi = {
  getLeaderboard: async (filters: LeaderboardFilters = {}): Promise<LeaderboardEntry[]> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const response = await apiClient.get<ApiResponse<LeaderboardEntry[]>>(
      `/performance/leaderboard?${params.toString()}`
    );
    return response.data.data;
  },

  getUserPerformance: async (
    userId?: string,
    days: number = 30
  ): Promise<{
    performances: DailyPerformance[];
    summary: {
      totalSales: number;
      avgSales: number;
      starDaysCount: number;
      daysWorked: number;
    };
  }> => {
    const url = userId
      ? `/performance/user/${userId}?days=${days}`
      : `/performance/user?days=${days}`;

    const response = await apiClient.get<ApiResponse<any>>(url);
    return response.data.data;
  },
};
