import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, // 2 minutes to accommodate long requests like TTS generation
});

/**
 * Request interceptor - Attach JWT token to every request
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: string | null) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const handleLogoutAndRedirect = (error: AxiosError, url: string = '') => {
  const isContentEndpoint = url.includes('/chapters/') || url.includes('/stories/');
  
  if (!isContentEndpoint) {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    if (window.location.pathname !== '/login') {
      window.location.href = '/login?session_expired=true';
    }
  }
  return Promise.reject(error);
};

/**
 * Response interceptor - Handle 401
 */
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      
      if (originalRequest.url?.includes('/auth/refresh') || originalRequest.url?.includes('/auth/login')) {
        return handleLogoutAndRedirect(error, originalRequest.url);
      }

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        return handleLogoutAndRedirect(error, originalRequest.url || '');
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
        const response = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });
        
        const { token, refreshToken: newRefreshToken, user } = response.data.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', newRefreshToken);
        localStorage.setItem('user', JSON.stringify(user));

        originalRequest.headers.Authorization = `Bearer ${token}`;
        
        processQueue(null, token);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        return handleLogoutAndRedirect(refreshError as AxiosError, originalRequest.url || '');
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
