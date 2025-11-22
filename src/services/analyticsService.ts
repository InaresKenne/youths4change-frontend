import api from './api';
import type { ApiResponse } from '@/types';

export interface OverviewStats {
  total_projects: number;
  active_projects: number;
  total_applications: number;
  approved_applications: number;
  total_donations: number;
  total_beneficiaries: number;
  countries_count: number;
}

export interface CountryStats {
  country: string;
  project_count: number;
  total_beneficiaries: number;
}

export const analyticsService = {
  // Get overview statistics
  getOverview: async () => {
    const response = await api.get<ApiResponse<OverviewStats>>(
      '/api/analytics/overview'
    );
    return response.data;
  },

  // Get stats by country
  getProjectsByCountry: async () => {
    const response = await api.get<ApiResponse<CountryStats[]>>(
      '/api/analytics/projects-by-country'
    );
    return response.data;
  },
};
