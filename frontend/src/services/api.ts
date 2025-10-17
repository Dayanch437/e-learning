import axios, { AxiosResponse } from 'axios';
import { 
  GrammarLesson, 
  VideoLesson, 
  VocabularyWord, 
  Category,
  ApiListResponse, 
  ApiParams, 
  StatsResponse 
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken
          });
          
          const newAccessToken = response.data.access;
          localStorage.setItem('accessToken', newAccessToken);
          
          // Retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  // Login
  login: (email: string, password: string) => {
    return api.post('/auth/login/', { email, password });
  },

  // Register
  register: (userData: any) => {
    return api.post('/auth/register/', userData);
  },

  // Get user profile
  getProfile: () => {
    return api.get('/auth/profile/');
  },

  // Refresh token
  refreshToken: (refresh: string) => {
    return api.post('/auth/token/refresh/', { refresh });
  },

  // Logout (if backend has logout endpoint)
  logout: () => {
    return api.post('/auth/logout/');
  },
};

// Category API
export const categoryAPI = {
  // Get all categories
  getAll: (params?: ApiParams): Promise<AxiosResponse<ApiListResponse<Category>>> => {
    return api.get('/center/categories/', { params });
  },

  // Get category by ID
  getById: (id: number): Promise<AxiosResponse<Category>> => {
    return api.get(`/center/categories/${id}/`);
  },

  // Create new category
  create: (data: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<AxiosResponse<Category>> => {
    return api.post('/center/categories/', data);
  },

  // Update category
  update: (id: number, data: Partial<Category>): Promise<AxiosResponse<Category>> => {
    return api.put(`/center/categories/${id}/`, data);
  },

  // Delete category
  delete: (id: number): Promise<AxiosResponse<void>> => {
    return api.delete(`/center/categories/${id}/`);
  },
};

// Grammar API
export const grammarAPI = {
  // Get all grammar lessons
  getAll: (params?: ApiParams): Promise<AxiosResponse<ApiListResponse<GrammarLesson>>> => {
    return api.get('/center/grammar/', { params });
  },

  // Get grammar lesson by ID
  getById: (id: number): Promise<AxiosResponse<GrammarLesson>> => {
    return api.get(`/center/grammar/${id}/`);
  },

  // Get grammar statistics
  getStats: (): Promise<AxiosResponse<StatsResponse>> => {
    return api.get('/center/grammar/stats/');
  },
};

// Video API
export const videoAPI = {
  // Get all video lessons
  getAll: (params?: ApiParams): Promise<AxiosResponse<ApiListResponse<VideoLesson>>> => {
    return api.get('/center/videos/', { params });
  },

  // Get video lesson by ID
  getById: (id: number): Promise<AxiosResponse<VideoLesson>> => {
    return api.get(`/center/videos/${id}/`);
  },

  // Get video statistics
  getStats: (): Promise<AxiosResponse<StatsResponse>> => {
    return api.get('/center/videos/stats/');
  },
};

// Vocabulary API
export const vocabularyAPI = {
  // Get all vocabulary words
  getAll: (params?: ApiParams): Promise<AxiosResponse<ApiListResponse<VocabularyWord>>> => {
    return api.get('/center/vocabulary/', { params });
  },

  // Get vocabulary word by ID
  getById: (id: number): Promise<AxiosResponse<VocabularyWord>> => {
    return api.get(`/center/vocabulary/${id}/`);
  },

  // Get vocabulary statistics
  getStats: (): Promise<AxiosResponse<StatsResponse>> => {
    return api.get('/center/vocabulary/stats/');
  },

  // Get random words for practice
  getRandom: (count?: number, level?: string): Promise<AxiosResponse<VocabularyWord[]>> => {
    const params: any = {};
    if (count) params.count = count;
    if (level) params.level = level;
    return api.get('/center/vocabulary/random/', { params });
  },
  
  // Advanced search with more options
  searchAdvanced: (
    query?: string, 
    partOfSpeech?: string, 
    startsWith?: string, 
    additionalParams?: {[key: string]: any}
  ): Promise<AxiosResponse<ApiListResponse<VocabularyWord>>> => {
    const params: any = {...additionalParams};
    if (query) params.q = query;
    if (partOfSpeech) params.part_of_speech = partOfSpeech;
    if (startsWith) params.starts_with = startsWith;
    return api.get('/center/vocabulary/search_advanced/', { params });
  },

  // Get vocabulary categories
  getCategories: (): Promise<AxiosResponse<string[]>> => {
    return api.get('/center/vocabulary/categories/');
  },
};

// Center API (if you need general center information)
export const centerAPI = {
  getAll: (): Promise<AxiosResponse<any[]>> => {
    return api.get('/center/');
  },
};

// Export the axios instance for custom requests
export default api;
