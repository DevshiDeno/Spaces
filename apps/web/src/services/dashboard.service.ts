import { http } from './http';
import type { DashboardStats } from '@/types';

export const dashboardService = {
  async stats(): Promise<DashboardStats> {
    const { data } = await http.get<DashboardStats>('/dashboard/stats');
    return data;
  },
};
