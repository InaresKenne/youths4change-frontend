import api from './api';
import type { ApiResponse, SiteSettings, PageContent, CoreValue, TeamRole } from '@/types';

export const settingsService = {
  // Get all site settings
  getSettings: async () => {
    const response = await api.get<ApiResponse<SiteSettings>>(
      '/api/settings'
    );
    return response.data;
  },

  // Get specific setting
  getSetting: async (key: string) => {
    const response = await api.get<ApiResponse<{ setting_value: string }>>(
      `/api/settings/${key}`
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

  // Get core values
  getCoreValues: async () => {
    const response = await api.get<ApiResponse<CoreValue[]>>(
      '/api/core-values'
    );
    return response.data;
  },

  // Get team roles
  getTeamRoles: async () => {
    const response = await api.get<ApiResponse<TeamRole[]>>(
      '/api/team-roles'
    );
    return response.data;
  },
};