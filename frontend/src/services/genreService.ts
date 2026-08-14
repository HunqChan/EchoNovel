import api from './api';
import type { ApiResponse, GenreResponse, GenreRequest } from '../types';

export const genreService = {
  getGenres: async (): Promise<ApiResponse<GenreResponse[]>> => {
    const response = await api.get<ApiResponse<GenreResponse[]>>('/genres');
    return response.data;
  },
  
  createGenre: async (data: GenreRequest): Promise<ApiResponse<GenreResponse>> => {
    const response = await api.post<ApiResponse<GenreResponse>>('/admin/genres', data);
    return response.data;
  },

  updateGenre: async (id: number, data: GenreRequest): Promise<ApiResponse<GenreResponse>> => {
    const response = await api.put<ApiResponse<GenreResponse>>(`/admin/genres/${id}`, data);
    return response.data;
  },

  deleteGenre: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/admin/genres/${id}`);
    return response.data;
  },
};
