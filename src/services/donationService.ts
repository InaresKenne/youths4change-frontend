import api from './api';
import type { ApiResponse } from '@/types';

export interface DonationFormData {
  donor_name: string;
  email: string;
  amount: number;
  project_id: number;
  country: string;
  payment_method: 'mobile_money' | 'bank_transfer';
  transaction_id: string;
  payment_proof_url?: string;
  currency?: string;
}

export interface PaymentAccounts {
  bank_account: {
    account_name: string;
    name: string;
    account_number: string;
    swift_code: string;
    address: string;
  };
  mobile_money: {
    ghana: {
      number: string;
      name: string;
    };
    cameroon: {
      number: string;
      name: string;
    };
  };
}

export const donationService = {
  // Submit donation
  submit: async (data: DonationFormData) => {
    const response = await api.post<{ success: boolean; id: number; message: string; payment_status: string }>(
      '/api/donations',
      data
    );
    return response.data;
  },

  // Get payment account details
  getPaymentAccounts: async () => {
    const response = await api.get<ApiResponse<PaymentAccounts>>('/api/payment-accounts');
    return response.data;
  },
};