import api from './api';
import type { ApiResponse, ChapterResponse } from '../types';

export const chapterService = {
  /**
   * Get chapter content by ID (access-controlled on backend)
   */
  getChapterById: async (id: number): Promise<ApiResponse<ChapterResponse>> => {
    const response = await api.get<ApiResponse<ChapterResponse>>(`/chapters/${id}`);
    return response.data;
  },

  /**
   * Get all chapters of a story (summary, no content)
   */
  getChaptersByStoryId: async (storyId: number): Promise<ApiResponse<ChapterResponse[]>> => {
    const response = await api.get<ApiResponse<ChapterResponse[]>>(`/chapters/story/${storyId}`);
    return response.data;
  },

  /**
   * Admin: Create chapter
   */
  createChapter: async (data: import('../types').ChapterRequest): Promise<ApiResponse<ChapterResponse>> => {
    const response = await api.post<ApiResponse<ChapterResponse>>('/admin/chapters', data);
    return response.data;
  },

  /**
   * Admin: Update chapter
   */
  updateChapter: async (id: number, data: import('../types').ChapterRequest): Promise<ApiResponse<ChapterResponse>> => {
    const response = await api.put<ApiResponse<ChapterResponse>>(`/admin/chapters/${id}`, data);
    return response.data;
  },

  /**
   * Admin: Delete chapter
   */
  deleteChapter: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/admin/chapters/${id}`);
    return response.data;
  },
};
