// Simple cache implementation for API responses
interface CacheItem {
  data: any;
  expiry: number;
}

class ApiCache {
  private cache: Map<string, CacheItem>;
  private defaultTTL: number; // Time to live in milliseconds

  constructor(defaultTTL = 5 * 60 * 1000) { // Default 5 minutes
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
  }

  set(key: string, data: any, ttl = this.defaultTTL): void {
    const expiry = Date.now() + ttl;
    this.cache.set(key, { data, expiry });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    
    // Return null if item doesn't exist
    if (!item) return null;
    
    // Return null if item has expired and remove it
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  // Invalidate all cache entries that match a prefix
  invalidateByPrefix(prefix: string): void {
    this.cache.forEach((_, key) => {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    });
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
  }
  
  // Get cache size (number of entries)
  size(): number {
    return this.cache.size;
  }
  
  // Get cache statistics
  getStats(): { size: number, entries: { key: string, expires: Date }[] } {
    const entries = Array.from(this.cache.entries()).map(([key, value]) => ({
      key,
      expires: new Date(value.expiry)
    }));
    
    return {
      size: this.cache.size,
      entries
    };
  }
}

export default ApiCache;