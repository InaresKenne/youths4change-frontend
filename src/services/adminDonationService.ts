import api from './api';
import type { Donation, ApiResponse } from '@/types';

export interface DonationWithProject extends Donation {
  project_name?: string;
}

export const adminDonationService = {
  // Get all donations with optional filters
  getAll: async (filters?: { project_id?: number; country?: string; search?: string }) => {
    const params = new URLSearchParams();
    if (filters?.project_id) params.append('project_id', filters.project_id.toString());
    if (filters?.country) params.append('country', filters.country);
    if (filters?.search) params.append('search', filters.search);
    
    const response = await api.get<ApiResponse<DonationWithProject[]>>(
      `/api/donations?${params.toString()}`
    );
    return response.data;
  },

  // Get single donation
  getById: async (id: number) => {
    const response = await api.get<ApiResponse<DonationWithProject>>(
      `/api/donations/${id}`
    );
    return response.data;
  },

  // Get donation statistics
  getStats: async () => {
    const response = await api.get<ApiResponse<{
      total_amount: number;
      total_count: number;
      by_country: { country: string; amount: number; count: number }[];
      by_project: { project_id: number; project_name: string; amount: number; count: number }[];
    }>>('/api/donations/stats');
    return response.data;
  },
  
};