import api from './api';
import type { LoginRequest, RegisterRequest, AuthResponse, ApiResponse } from '../types';

export const authService = {
  login: async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return response.data;
  },

  sendRegisterOtp: async (data: { email: string }): Promise<ApiResponse<void>> => {
    const response = await api.post<ApiResponse<void>>('/auth/register/send-otp', data);
    return response.data;
  },

  sendForgotPasswordOtp: async (data: import('../types').ForgotPasswordRequest): Promise<ApiResponse<void>> => {
    const response = await api.post<ApiResponse<void>>('/auth/forgot-password/send-otp', data);
    return response.data;
  },

  resetPassword: async (data: import('../types').ResetPasswordRequest): Promise<ApiResponse<void>> => {
    const response = await api.post<ApiResponse<void>>('/auth/forgot-password/reset', data);
    return response.data;
  },

  googleLogin: async (data: import('../types').GoogleAuthRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/google', data);
    return response.data;
  },

  refreshToken: async (data: import('../types').RefreshTokenRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/refresh', data);
    return response.data;
  },

  logout: async (data: import('../types').LogoutRequest): Promise<ApiResponse<void>> => {
    const response = await api.post<ApiResponse<void>>('/auth/logout', data);
    return response.data;
  },
};
