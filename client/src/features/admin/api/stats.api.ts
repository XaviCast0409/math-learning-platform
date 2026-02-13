import axiosClient from '../../../api/axiosClient';
import type { DashboardStats } from '../../../types/admin.types';

export const adminStatsApi = {
  getDashboard: async () => {
    const { data } = await axiosClient.get<DashboardStats>('/admin/stats/dashboard');
    return data;
  }
};