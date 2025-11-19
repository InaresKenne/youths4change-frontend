import api from './api';
import type { ApiResponse } from '@/types';

export interface DonationFormData {
  donor_name: string;
  email: string;
  amount: number;
  project_id: number;
  country: string;
}

export const donationService = {
  // Submit donation
  submit: async (data: DonationFormData) => {
    const response = await api.post<ApiResponse<{ id: number }>>(
      '/api/donations',
      data
    );
    return response.data;
  },
};