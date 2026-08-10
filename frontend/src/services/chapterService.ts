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
};
