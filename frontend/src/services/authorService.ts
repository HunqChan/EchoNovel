import api from './api';
import type { ApiResponse, AuthorResponse, AuthorRequest } from '../types';

export const authorService = {
  getAuthors: async (): Promise<ApiResponse<AuthorResponse[]>> => {
    const response = await api.get<ApiResponse<AuthorResponse[]>>('/authors');
    return response.data;
  },
  
  createAuthor: async (data: AuthorRequest): Promise<ApiResponse<AuthorResponse>> => {
    const response = await api.post<ApiResponse<AuthorResponse>>('/admin/authors', data);
    return response.data;
  },

  updateAuthor: async (id: number, data: AuthorRequest): Promise<ApiResponse<AuthorResponse>> => {
    const response = await api.put<ApiResponse<AuthorResponse>>(`/admin/authors/${id}`, data);
    return response.data;
  },

  deleteAuthor: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/admin/authors/${id}`);
    return response.data;
  },
};
