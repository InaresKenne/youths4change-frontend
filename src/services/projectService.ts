import api from './api';
import type { Project, ApiResponse } from '@/types';

export const projectService = {
  // Get all projects with optional filters
  getAll: async (filters?: { country?: string; status?: string }) => {
    const params = new URLSearchParams();
    if (filters?.country) params.append('country', filters.country);
    if (filters?.status) params.append('status', filters.status);
    
    const response = await api.get<ApiResponse<Project[]>>(
      `/api/projects?${params.toString()}`
    );
    return response.data;
  },

  // Get single project by ID
  getById: async (id: number) => {
    const response = await api.get<ApiResponse<Project>>(
      `/api/projects/${id}`
    );
    return response.data;
  },
};