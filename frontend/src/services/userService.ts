import api from './api';
import type { ApiResponse, UserResponse } from '../types';

export const userService = {
  getUsers: async (): Promise<ApiResponse<UserResponse[]>> => {
    const response = await api.get<ApiResponse<UserResponse[]>>('/admin/users');
    return response.data;
  },
  
  toggleVip: async (userId: number, isVip: boolean): Promise<ApiResponse<UserResponse>> => {
    const response = await api.put<ApiResponse<UserResponse>>(`/admin/users/${userId}/vip`, { isVip });
    return response.data;
  },

  updateUser: async (userId: number, data: { role: string; vipType: string; vipExpireAt?: string }): Promise<ApiResponse<UserResponse>> => {
    const response = await api.put<ApiResponse<UserResponse>>(`/admin/users/${userId}`, data);
    return response.data;
  },

  deleteUser: async (userId: number): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/admin/users/${userId}`);
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse<UserResponse>> => {
    const response = await api.get<ApiResponse<UserResponse>>('/users/profile');
    return response.data;
  },

  updateProfile: async (data: import('../types').UserProfileUpdateRequest): Promise<ApiResponse<UserResponse>> => {
    const response = await api.put<ApiResponse<UserResponse>>('/users/profile', data);
    return response.data;
  },

  sendChangePasswordOtp: async (): Promise<ApiResponse<void>> => {
    const response = await api.post<ApiResponse<void>>('/users/change-password/send-otp');
    return response.data;
  },

  changePassword: async (data: import('../types').ChangePasswordRequest): Promise<ApiResponse<void>> => {
    const response = await api.post<ApiResponse<void>>('/users/change-password', data);
    return response.data;
  },
};
