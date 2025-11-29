import api from './api';
import type { ApiResponse, SiteSettings, PageContent, CoreValue, TeamRole } from '@/types';

export const adminSettingsService = {
  // Get all site settings
  getSettings: async () => {
    const response = await api.get<ApiResponse<SiteSettings>>('/api/settings');
    return response.data;
  },

  // Update site settings
  updateSettings: async (data: Partial<SiteSettings>) => {
    const response = await api.put<ApiResponse<{ message: string }>>(
      '/api/settings',
      data
    );
    return response.data;
  },

  // Get page content
  getPageContent: async (pageName: string) => {
    const response = await api.get<ApiResponse<PageContent>>(
      `/api/content/${pageName}`
    );
    return response.data;
  },

  // Update page content
  updatePageContent: async (pageName: string, data: PageContent) => {
    const response = await api.put<ApiResponse<{ message: string }>>(
      `/api/content/${pageName}`,
      data
    );
    return response.data;
  },

  // Core Values
  getCoreValues: async () => {
    const response = await api.get<ApiResponse<CoreValue[]>>('/api/core-values');
    return response.data;
  },

  createCoreValue: async (data: { title: string; description: string; icon: string }) => {
    const response = await api.post<ApiResponse<{ id: number }>>(
      '/api/core-values',
      data
    );
    return response.data;
  },

  updateCoreValue: async (id: number, data: { title: string; description: string; icon: string }) => {
    const response = await api.put<ApiResponse<{ message: string }>>(
      `/api/core-values/${id}`,
      data
    );
    return response.data;
  },

  deleteCoreValue: async (id: number) => {
    const response = await api.delete<ApiResponse<{ message: string }>>(
      `/api/core-values/${id}`
    );
    return response.data;
  },

  // Team Roles
  getTeamRoles: async () => {
    const response = await api.get<ApiResponse<TeamRole[]>>('/api/team-roles');
    return response.data;
  },

  createTeamRole: async (data: { role_title: string; responsibilities: string }) => {
    const response = await api.post<ApiResponse<{ id: number }>>(
      '/api/team-roles',
      data
    );
    return response.data;
  },

  updateTeamRole: async (id: number, data: { role_title: string; responsibilities: string }) => {
    const response = await api.put<ApiResponse<{ message: string }>>(
      `/api/team-roles/${id}`,
      data
    );
    return response.data;
  },

  deleteTeamRole: async (id: number) => {
    const response = await api.delete<ApiResponse<{ message: string }>>(
      `/api/team-roles/${id}`
    );
    return response.data;
  },
};