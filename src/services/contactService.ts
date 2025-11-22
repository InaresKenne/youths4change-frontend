import api from './api';
import type { ApiResponse, ContactInfo, SocialMedia, RegionalOffice } from '@/types';

export const contactService = {
  // Get main contact info
  getContactInfo: async () => {
    const response = await api.get<ApiResponse<ContactInfo[]>>(
      '/api/contact-info'
    );
    return response.data;
  },

  // Get social media links
  getSocialMedia: async () => {
    const response = await api.get<ApiResponse<SocialMedia[]>>(
      '/api/social-media'
    );
    return response.data;
  },

  // Get regional offices
  getRegionalOffices: async () => {
    const response = await api.get<ApiResponse<RegionalOffice[]>>(
      '/api/regional-offices'
    );
    return response.data;
  },
};