import api from './api';
import type { ApiResponse, UploadResponse, UserResponse, StoryResponse } from '../types';

export const uploadService = {
  /**
   * General-purpose image upload to Cloudinary.
   * @param file - Image file (JPG, PNG, WebP, max 5MB)
   * @param folder - Cloudinary folder path (e.g. "echonovel/avatars")
   */
  uploadImage: async (file: File, folder: string): Promise<ApiResponse<UploadResponse>> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    const response = await api.post<ApiResponse<UploadResponse>>('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Upload user avatar. Returns updated user profile with new avatar URL.
   */
  uploadAvatar: async (file: File): Promise<ApiResponse<UserResponse>> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<ApiResponse<UserResponse>>('/users/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Upload story cover image. Returns updated story with new cover URL.
   * @param storyId - ID of the story to update
   * @param file - Cover image file
   */
  uploadStoryCover: async (storyId: number, file: File): Promise<ApiResponse<StoryResponse>> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<ApiResponse<StoryResponse>>(`/admin/stories/${storyId}/cover`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
