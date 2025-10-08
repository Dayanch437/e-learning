import { AxiosInstance, AxiosRequestConfig } from 'axios';
import ApiCache from './apiCache';

// Creating a wrapper that adds caching to API calls
export function createCachedApiService(api: AxiosInstance, cache: ApiCache) {
  // Generic fetch with caching for GET requests
  const cachedGet = async <T>(
    url: string, 
    config?: AxiosRequestConfig, 
    cacheTTL?: number, 
    bypassCache = false
  ): Promise<T> => {
    // Generate a cache key based on the URL and query parameters
    const cacheKey = `${url}${config?.params ? JSON.stringify(config.params) : ''}`;
    
    // Check if response is in cache and cache is not bypassed
    if (!bypassCache) {
      const cachedResponse = cache.get(cacheKey);
      if (cachedResponse) {
        return cachedResponse;
      }
    }
    
    // No cache hit, make actual API request
    try {
      const response = await api.get<T>(url, config);
      
      // Cache the response if it's successful
      // Only cache GET requests to keep the cache predictable
      if (response.status >= 200 && response.status < 300) {
        cache.set(cacheKey, response.data, cacheTTL);
      }
      
      return response.data;
    } catch (error) {
      // On error, don't cache and propagate the error
      throw error;
    }
  };

  // Function to invalidate cache entries by URL prefix
  const invalidateCache = (urlPrefix: string) => {
    cache.invalidateByPrefix(urlPrefix);
  };

  // Other methods (POST, PUT, etc.) that should bypass the cache
  const post = async <T>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const response = await api.post<T>(url, data, config);
    
    // Invalidate cache for related resources
    invalidateCache(url.split('/').slice(0, -1).join('/'));
    
    return response.data;
  };

  const put = async <T>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const response = await api.put<T>(url, data, config);
    
    // Invalidate cache for this specific resource and related collections
    cache.invalidate(url);
    invalidateCache(url.split('/').slice(0, -1).join('/'));
    
    return response.data;
  };

  const patch = async <T>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const response = await api.patch<T>(url, data, config);
    
    // Invalidate cache for this specific resource and related collections
    cache.invalidate(url);
    invalidateCache(url.split('/').slice(0, -1).join('/'));
    
    return response.data;
  };

  const remove = async <T>(
    url: string, 
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const response = await api.delete<T>(url, config);
    
    // Invalidate cache for this specific resource and related collections
    cache.invalidate(url);
    invalidateCache(url.split('/').slice(0, -1).join('/'));
    
    return response.data;
  };

  return {
    get: cachedGet,
    post,
    put,
    patch,
    delete: remove,
    invalidateCache,
    clearCache: () => cache.clear()
  };
}

export default createCachedApiService;