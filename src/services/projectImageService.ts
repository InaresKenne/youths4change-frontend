import api from './api';
import type { ApiResponse } from '@/types';

export interface ProjectImage {
  id: number;
  project_id: number;
  cloudinary_public_id: string;
  caption: string | null;
  order_position: number;
  uploaded_by: number | null;
  uploaded_by_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectImageFormData {
  cloudinary_public_id: string;
  caption?: string;
  uploaded_by?: number;
}

export const projectImageService = {
  // Get all images for a project
  getImages: async (projectId: number) => {
    const response = await api.get<ApiResponse<ProjectImage[]>>(
      `/api/projects/${projectId}/images`
    );
    return response.data;
  },

  // Add an image to a project
  addImage: async (projectId: number, data: ProjectImageFormData) => {
    const response = await api.post<ApiResponse<{ id: number }>>(
      `/api/projects/${projectId}/images`,
      data
    );
    return response.data;
  },

  // Update an image
  updateImage: async (projectId: number, imageId: number, data: { caption?: string; order_position?: number }) => {
    const response = await api.put<ApiResponse<{ message: string }>>(
      `/api/projects/${projectId}/images/${imageId}`,
      data
    );
    return response.data;
  },

  // Delete an image
  deleteImage: async (projectId: number, imageId: number) => {
    const response = await api.delete<ApiResponse<{ message: string }>>(
      `/api/projects/${projectId}/images/${imageId}`
    );
    return response.data;
  },

  // Reorder images
  reorderImages: async (projectId: number, images: { id: number; order_position: number }[]) => {
    const response = await api.put<ApiResponse<{ message: string }>>(
      `/api/projects/${projectId}/images/reorder`,
      { images }
    );
    return response.data;
  },
};
