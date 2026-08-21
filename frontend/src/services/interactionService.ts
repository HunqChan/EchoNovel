import api from './api';
import type {
  ApiResponse,
  FavoriteResponse,
  ReactionSummaryResponse,
  CommentResponse,
  ReadingHistoryResponse,
  TrendingStoryResponse,
  StoryResponse,
  PageResponse,
} from '../types';

export const interactionService = {
  // ==================== Favorites ====================

  toggleFavorite: async (storyId: number): Promise<ApiResponse<{ favorited: boolean }>> => {
    const response = await api.post<ApiResponse<{ favorited: boolean }>>(`/stories/${storyId}/favorite`);
    return response.data;
  },

  getFavoriteStatus: async (storyId: number): Promise<ApiResponse<{ favorited: boolean }>> => {
    const response = await api.get<ApiResponse<{ favorited: boolean }>>(`/stories/${storyId}/favorite-status`);
    return response.data;
  },

  getUserFavorites: async (): Promise<ApiResponse<FavoriteResponse[]>> => {
    const response = await api.get<ApiResponse<FavoriteResponse[]>>('/users/favorites');
    return response.data;
  },

  // ==================== Reactions ====================

  submitReaction: async (storyId: number, type: 'LIKE' | 'DISLIKE'): Promise<ApiResponse<ReactionSummaryResponse>> => {
    const response = await api.post<ApiResponse<ReactionSummaryResponse>>(`/stories/${storyId}/reaction`, { type });
    return response.data;
  },

  getReactionSummary: async (storyId: number): Promise<ApiResponse<ReactionSummaryResponse>> => {
    const response = await api.get<ApiResponse<ReactionSummaryResponse>>(`/stories/${storyId}/reaction-summary`);
    return response.data;
  },

  // ==================== Comments ====================

  getComments: async (storyId: number, page = 0, size = 20): Promise<ApiResponse<PageResponse<CommentResponse>>> => {
    const response = await api.get<ApiResponse<PageResponse<CommentResponse>>>(
      `/stories/${storyId}/comments?page=${page}&size=${size}`
    );
    return response.data;
  },

  postComment: async (storyId: number, content: string): Promise<ApiResponse<CommentResponse>> => {
    const response = await api.post<ApiResponse<CommentResponse>>(`/stories/${storyId}/comments`, { content });
    return response.data;
  },

  // ==================== Reading History ====================

  getReadingHistory: async (): Promise<ApiResponse<ReadingHistoryResponse[]>> => {
    const response = await api.get<ApiResponse<ReadingHistoryResponse[]>>('/users/reading-history');
    return response.data;
  },

  // ==================== Trending ====================

  getTrendingStories: async (): Promise<ApiResponse<TrendingStoryResponse[]>> => {
    const response = await api.get<ApiResponse<TrendingStoryResponse[]>>('/stories/trending');
    return response.data;
  },

  // ==================== Recommendations ====================

  getRecommendations: async (storyId: number): Promise<ApiResponse<StoryResponse[]>> => {
    const response = await api.get<ApiResponse<StoryResponse[]>>(`/stories/${storyId}/recommendations`);
    return response.data;
  },
};
