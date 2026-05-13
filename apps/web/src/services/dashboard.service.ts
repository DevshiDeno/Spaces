import { env } from '@/utils/env';
import { http } from './http';
import { delay } from './mock/delay';
import { mockStats } from './mock/fixtures';
import type { DashboardStats } from '@/types';

export const dashboardService = {
  async stats(): Promise<DashboardStats> {
    if (env.useMockApi) return delay(mockStats);
    const { data } = await http.get<DashboardStats>('/dashboard/stats');
    return data;
  },
};
