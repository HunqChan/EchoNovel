import api from './api';
import type { ApiResponse, AdminStatsResponse } from '../types';

export const statsService = {
  getStats: async (): Promise<ApiResponse<AdminStatsResponse>> => {
    const response = await api.get<ApiResponse<AdminStatsResponse>>('/admin/stats');
    return response.data;
  },
};
