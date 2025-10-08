import api from '../services/api';

/**
 * Utility for prefetching data that's likely to be needed soon
 */
class DataPrefetcher {
  /**
   * Prefetch a list of endpoints that are likely to be accessed soon
   * @param endpoints Array of endpoint URLs to prefetch
   * @param ttl Optional cache TTL in milliseconds
   */
  static async prefetchEndpoints(endpoints: string[], ttl = 5 * 60 * 1000): Promise<void> {
    try {
      // Use Promise.allSettled to avoid failing if one request fails
      await Promise.allSettled(
        endpoints.map(endpoint => 
          api.get(endpoint)
        )
      );
    } catch (error) {
      // Silently fail - prefetching errors shouldn't affect the user experience
      console.debug('Prefetch error:', error);
    }
  }
  
  /**
   * Prefetch common data for the dashboard
   */
  static async prefetchDashboard(): Promise<void> {
    return this.prefetchEndpoints([
      '/center/categories/',
      '/center/grammar/stats/',
      '/center/videos/stats/',
      '/center/vocabulary/stats/'
    ]);
  }
  
  /**
   * Prefetch data for vocabulary practice
   */
  static async prefetchVocabularyPractice(level?: string): Promise<void> {
    const endpoints = ['/center/vocabulary/categories/'];
    
    if (level) {
      endpoints.push(`/center/vocabulary/random/?count=20&level=${level}`);
    } else {
      endpoints.push('/center/vocabulary/random/?count=20');
    }
    
    return this.prefetchEndpoints(endpoints);
  }
}

export default DataPrefetcher;