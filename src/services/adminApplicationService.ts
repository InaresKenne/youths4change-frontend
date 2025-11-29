import api from './api';
import type { Application, ApiResponse } from '@/types';

export const adminApplicationService = {
  // Get all applications with optional filters
  getAll: async (filters?: { status?: string; country?: string; search?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.country) params.append('country', filters.country);
    if (filters?.search) params.append('search', filters.search);
    
    const response = await api.get<ApiResponse<Application[]>>(
      `/api/applications?${params.toString()}`
    );
    return response.data;
  },

  // Get single application
  getById: async (id: number) => {
    const response = await api.get<ApiResponse<Application>>(
      `/api/applications/${id}`
    );
    return response.data;
  },

  // Approve or reject application
  review: async (id: number, status: 'approved' | 'rejected') => {
    const response = await api.put<ApiResponse<{ message: string }>>(
      `/api/applications/${id}/review`,
      { status }
    );
    return response.data;
  },
};