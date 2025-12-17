import api from './api';
import type { ApiResponse, ContactInfo, SocialMedia, RegionalOffice } from '@/types';

export const adminContactService = {
  // Contact Info
  getContactInfo: async () => {
    const response = await api.get<ApiResponse<ContactInfo[]>>('/api/contact-info');
    return response.data;
  },

  updateContactInfo: async (id: number, data: Partial<ContactInfo>) => {
    const response = await api.put<ApiResponse<{ message: string }>>(
      `/api/contact-info/${id}`,
      data
    );
    return response.data;
  },

  // Social Media
  getSocialMedia: async () => {
    const response = await api.get<ApiResponse<SocialMedia[]>>('/api/social-media/all');
    return response.data;
  },

  createSocialMedia: async (data: {
    platform: string;
    platform_name: string;
    url: string;
    icon?: string;
    color_class?: string;
  }) => {
    const response = await api.post<ApiResponse<{ id: number }>>(
      '/api/social-media',
      data
    );
    return response.data;
  },

  updateSocialMedia: async (id: number, data: Partial<SocialMedia>) => {
    const response = await api.put<ApiResponse<{ message: string }>>(
      `/api/social-media/${id}`,
      data
    );
    return response.data;
  },

  deleteSocialMedia: async (id: number) => {
    const response = await api.delete<ApiResponse<{ message: string }>>(
      `/api/social-media/${id}`
    );
    return response.data;
  },

  // Regional Offices
  getRegionalOffices: async () => {
    const response = await api.get<ApiResponse<RegionalOffice[]>>('/api/regional-offices/all');
    return response.data;
  },

  createRegionalOffice: async (data: {
    country: string;
    email: string;
    phone: string;
    address?: string;
  }) => {
    const response = await api.post<ApiResponse<{ id: number }>>(
      '/api/regional-offices',
      data
    );
    return response.data;
  },

  updateRegionalOffice: async (id: number, data: Partial<RegionalOffice>) => {
    const response = await api.put<ApiResponse<{ message: string }>>(
      `/api/regional-offices/${id}`,
      data
    );
    return response.data;
  },

  deleteRegionalOffice: async (id: number) => {
    const response = await api.delete<ApiResponse<{ message: string }>>(
      `/api/regional-offices/${id}`
    );
    return response.data;
  },

  // Get countries from regional offices
  getOfficeCountries: async () => {
    const response = await api.get<ApiResponse<string[]>>(
      '/api/regional-offices/countries'
    );
    return response.data;
  },
};