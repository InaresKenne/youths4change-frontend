import api from './api';
import type { ApiResponse, Admin } from '@/types';

export interface AdminProfile {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

export interface PasswordChangeData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export const adminAuthService = {
  // Get current admin profile
  getProfile: async () => {
    const response = await api.get<ApiResponse<AdminProfile>>('/api/auth/profile');
    return response.data;
  },

  // Update profile
  updateProfile: async (data: { full_name: string; email: string }) => {
    const response = await api.put<ApiResponse<{ message: string }>>(
      '/api/auth/profile',
      data
    );
    return response.data;
  },

  // Change password
  changePassword: async (data: PasswordChangeData) => {
    const response = await api.put<ApiResponse<{ message: string }>>(
      '/api/auth/password',
      data
    );
    return response.data;
  },
};