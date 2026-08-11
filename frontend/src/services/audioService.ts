import api from './api';
import type { ApiResponse, AudioFileResponse } from '../types';

export const audioService = {
  /**
   * Get existing audio for a chapter (returns 404 if none)
   */
  getAudio: async (chapterId: number): Promise<ApiResponse<AudioFileResponse>> => {
    const response = await api.get<ApiResponse<AudioFileResponse>>(`/chapters/${chapterId}/audio`);
    return response.data;
  },

  /**
   * Request TTS audio generation (uses cache if already generated)
   */
  generateTts: async (
    chapterId: number,
    voice: string = 'vi-VN-HoaiMyNeural'
  ): Promise<ApiResponse<AudioFileResponse>> => {
    const response = await api.post<ApiResponse<AudioFileResponse>>(
      `/chapters/${chapterId}/tts?voice=${encodeURIComponent(voice)}`
    );
    return response.data;
  },

  /**
   * Admin upload audio file
   */
  uploadAudio: async (chapterId: number, formData: FormData): Promise<ApiResponse<AudioFileResponse>> => {
    const response = await api.post<ApiResponse<AudioFileResponse>>(
      `/admin/chapters/${chapterId}/audio`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },
};
