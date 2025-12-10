import api from './api';
import type { Project, ApiResponse } from '@/types';

export interface ProjectFormData {
  name: string;
  description: string;
  country: string;
  beneficiaries_count: number;
  budget: number;
  status: string;
  cloudinary_public_id?: string;
}

export const adminProjectService = {
  // Get all projects (including deleted for admin)
  getAll: async (filters?: { country?: string; status?: string; search?: string }) => {
    const params = new URLSearchParams();
    if (filters?.country) params.append('country', filters.country);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    
    const response = await api.get<ApiResponse<Project[]>>(
      `/api/projects?${params.toString()}`
    );
    return response.data;
  },

  // Get single project
  getById: async (id: number) => {
    const response = await api.get<ApiResponse<Project>>(`/api/projects/${id}`);
    return response.data;
  },

  // Create new project
  create: async (data: ProjectFormData) => {
    const response = await api.post<ApiResponse<{ id: number }>>('/api/projects', data);
    return response.data;
  },

  // Update project
  update: async (id: number, data: ProjectFormData) => {
    const response = await api.put<ApiResponse<{ message: string }>>(
      `/api/projects/${id}`,
      data
    );
    return response.data;
  },

  // Delete project (soft delete)
  delete: async (id: number) => {
    const response = await api.delete<ApiResponse<{ message: string }>>(
      `/api/projects/${id}`
    );
    return response.data;
  },
};