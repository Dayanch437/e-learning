import axios from 'axios';
import { AuthResponse, User } from '../types';

const API_BASE_URL = 'http://192.168.1.110:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      // Ensure headers object exists
      if (!config.headers) {
        config.headers = {} as any;
      }
      config.headers.Authorization = `Bearer ${token}`;
      
      // Debug log (remove in production)
      console.log('🔑 Adding Authorization header:', `Bearer ${token.substring(0, 20)}...`);
    } else {
      console.log('❌ No access token found in localStorage');
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.method?.toUpperCase(), response.config.url, response.status);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    console.error('❌ API Error:', originalRequest?.method?.toUpperCase(), originalRequest?.url, error.response?.status);
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('🔄 Attempting token refresh...');
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });
          
          const { access } = response.data;
          localStorage.setItem('access_token', access);
          console.log('✅ Token refreshed successfully');
          
          // Retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        } catch (refreshError) {
          console.error('❌ Token refresh failed:', refreshError);
          // Refresh failed, logout user
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      } else {
        // No refresh token, logout user
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login/', { email, password }),
  
  register: (userData: {
    email: string;
    username: string;
    password: string;
    password_confirm: string;
    first_name: string;
    last_name: string;
    role: string;
  }) => api.post<AuthResponse>('/auth/register/', userData),
  
  getProfile: () => api.get<User>('/auth/profile/'),
  
  refreshToken: (refresh: string) => 
    api.post('/auth/token/refresh/', { refresh }),
  
  logout: () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      return api.post('/auth/logout/', { refresh: refreshToken });
    }
    return Promise.resolve();
  },
};

export const grammarAPI = {
  getAll: (params?: any) => api.get('/center/grammar/', { params }),
  getById: (id: number) => api.get(`/center/grammar/${id}/`),
  create: (data: any) => api.post('/center/grammar/', data),
  update: (id: number, data: any) => api.put(`/center/grammar/${id}/`, data),
  delete: (id: number) => api.delete(`/center/grammar/${id}/`),
  publish: (id: number) => api.post(`/center/grammar/${id}/publish/`),
  unpublish: (id: number) => api.post(`/center/grammar/${id}/unpublish/`),
  getStats: () => api.get('/center/stats/grammar/'),
};

export const videoAPI = {
  getAll: (params?: any) => api.get('/center/videos/', { params }),
  getById: (id: number) => api.get(`/center/videos/${id}/`),
  create: (data: any) => api.post('/center/videos/', data),
  update: (id: number, data: any) => api.put(`/center/videos/${id}/`, data),
  delete: (id: number) => api.delete(`/center/videos/${id}/`),
  publish: (id: number) => api.post(`/center/videos/${id}/publish/`),
  unpublish: (id: number) => api.post(`/center/videos/${id}/unpublish/`),
  getStats: () => api.get('/center/stats/videos/'),
};

export const vocabularyAPI = {
  getAll: (params?: any) => api.get('/center/vocabulary/', { params }),
  getById: (id: number) => api.get(`/center/vocabulary/${id}/`),
  create: (data: any) => api.post('/center/vocabulary/', data),
  update: (id: number, data: any) => api.put(`/center/vocabulary/${id}/`, data),
  delete: (id: number) => api.delete(`/center/vocabulary/${id}/`),
  publish: (id: number) => api.post(`/center/vocabulary/${id}/publish/`),
  unpublish: (id: number) => api.post(`/center/vocabulary/${id}/unpublish/`),
  getRandom: (count?: number, level?: string) => 
    api.get('/center/vocabulary/random/', { params: { count, level } }),
  getCategories: () => api.get('/center/vocabulary/categories/'),
  getStats: () => api.get('/center/stats/vocabulary/'),
};

export default api;