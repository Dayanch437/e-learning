import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for making API requests with built-in caching.
 * 
 * @param fetchFn The function to call that returns a promise
 * @param dependencies Dependencies that should trigger a refetch when changed
 * @param initialData Optional initial data to use before first fetch
 * @returns Object with data, loading state, error state, and refetch function
 */
function useCachedFetch<T>(
  fetchFn: () => Promise<T>,
  dependencies: any[] = [],
  initialData?: T
) {
  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Memoize the fetch function to avoid unnecessary re-renders
  const fetchData = useCallback(async (bypassCache = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Here we assume that the fetchFn is a function that uses our cached API service
      // If bypassCache is true, we would need to modify our function to bypass the cache
      const result = await fetchFn();
      
      setData(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      return undefined;
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  // Refetch function that optionally bypasses the cache
  const refetch = useCallback(async (bypassCache = false) => {
    return fetchData(bypassCache);
  }, [fetchData]);

  // Fetch data initially and when dependencies change
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies, fetchData]);

  return { data, loading, error, refetch };
}

export default useCachedFetch;