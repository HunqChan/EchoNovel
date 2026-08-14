import api from './api';
import type { ApiResponse, StoryResponse, PageResponse, GenreResponse } from '../types';

export interface StoryFilters {
  keyword?: string;
  genreIds?: number[];
  status?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export const storyService = {
  /**
   * Get stories with filtering and pagination
   */
  getStories: async (filters: StoryFilters = {}): Promise<ApiResponse<PageResponse<StoryResponse>>> => {
    const params = new URLSearchParams();

    if (filters.keyword) params.append('keyword', filters.keyword);
    if (filters.genreIds && filters.genreIds.length > 0) {
      params.append('genreIds', filters.genreIds.join(','));
    }
    if (filters.status) params.append('status', filters.status);
    params.append('page', String(filters.page ?? 0));
    params.append('size', String(filters.size ?? 12));
    params.append('sort', filters.sort ?? 'createdAt,desc');

    const response = await api.get<ApiResponse<PageResponse<StoryResponse>>>(`/stories?${params.toString()}`);
    return response.data;
  },

  /**
   * Get story detail by ID (includes chapter list)
   */
  getStoryById: async (id: number): Promise<ApiResponse<StoryResponse>> => {
    const response = await api.get<ApiResponse<StoryResponse>>(`/stories/${id}`);
    return response.data;
  },

  /**
   * Get all genres (for filter dropdown)
   */
  getGenres: async (): Promise<ApiResponse<GenreResponse[]>> => {
    const response = await api.get<ApiResponse<GenreResponse[]>>('/genres');
    return response.data;
  },

  /**
   * Admin: Create story
   */
  createStory: async (data: import('../types').StoryRequest): Promise<ApiResponse<StoryResponse>> => {
    const response = await api.post<ApiResponse<StoryResponse>>('/admin/stories', data);
    return response.data;
  },

  /**
   * Admin: Update story
   */
  updateStory: async (id: number, data: import('../types').StoryRequest): Promise<ApiResponse<StoryResponse>> => {
    const response = await api.put<ApiResponse<StoryResponse>>(`/admin/stories/${id}`, data);
    return response.data;
  },

  /**
   * Admin: Delete story
   */
  deleteStory: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/admin/stories/${id}`);
    return response.data;
  },
};
