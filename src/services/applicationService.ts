import api from './api';
import type { Application, ApiResponse } from '@/types';

export interface ApplicationFormData {
  full_name: string;
  email: string;
  phone: string;
  country: string;
  motivation: string;
}

export const applicationService = {
  // Submit application
  submit: async (data: ApplicationFormData) => {
    const response = await api.post<ApiResponse<{ id: number }>>(
      '/api/applications',
      data
    );
    return response.data;
  },
};