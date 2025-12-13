import api from './api';
import type { ApiResponse, Founder, TeamMember } from '@/types';

// ============= PUBLIC API =============

export const teamService = {
  // Get founder information (public)
  async getFounder(): Promise<ApiResponse<Founder | null>> {
    try {
      const response = await api.get('/api/team/founder');
      return response.data;
    } catch (error) {
      console.error('Error fetching founder:', error);
      throw error;
    }
  },

  // Get team members (public)
  async getTeamMembers(roleType?: string): Promise<ApiResponse<TeamMember[]>> {
    try {
      const params = roleType ? { role_type: roleType } : {};
      const response = await api.get('/api/team/members', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching team members:', error);
      throw error;
    }
  },
};

// ============= ADMIN API =============

export const adminTeamService = {
  // Get founder info for admin
  async getFounder(): Promise<ApiResponse<Founder | null>> {
    try {
      const response = await api.get('/api/team/admin/founder');
      return response.data;
    } catch (error) {
      console.error('Error fetching founder for admin:', error);
      throw error;
    }
  },

  // Update founder information
  async updateFounder(data: Partial<Founder>): Promise<ApiResponse<null>> {
    try {
      const response = await api.put('/api/team/admin/founder', data);
      return response.data;
    } catch (error) {
      console.error('Error updating founder:', error);
      throw error;
    }
  },

  // Get all team members for admin
  async getAllMembers(): Promise<ApiResponse<TeamMember[]>> {
    try {
      const response = await api.get('/api/team/admin/members');
      return response.data;
    } catch (error) {
      console.error('Error fetching team members for admin:', error);
      throw error;
    }
  },

  // Get single team member
  async getMember(id: number): Promise<ApiResponse<TeamMember>> {
    try {
      const response = await api.get(`/api/team/admin/members/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching team member:', error);
      throw error;
    }
  },

  // Create team member
  async createMember(data: Partial<TeamMember>): Promise<ApiResponse<{ id: number }>> {
    try {
      const response = await api.post('/api/team/admin/members', data);
      return response.data;
    } catch (error) {
      console.error('Error creating team member:', error);
      throw error;
    }
  },

  // Update team member
  async updateMember(id: number, data: Partial<TeamMember>): Promise<ApiResponse<null>> {
    try {
      const response = await api.put(`/api/team/admin/members/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating team member:', error);
      throw error;
    }
  },

  // Delete team member
  async deleteMember(id: number): Promise<ApiResponse<null>> {
    try {
      const response = await api.delete(`/api/team/admin/members/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting team member:', error);
      throw error;
    }
  },
};
