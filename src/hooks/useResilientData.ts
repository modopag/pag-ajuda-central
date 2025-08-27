import { useState, useEffect, useCallback } from 'react';

interface ResilientDataOptions<T> {
  fetcher: () => Promise<T>;
  fallbackData?: T;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  enableOfflineMode?: boolean;
}

interface ResilientDataResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
  isStale: boolean;
  isOffline: boolean;
}

/**
 * Enhanced resilient data fetching hook with timeout, retry, and graceful fallbacks
 * Optimized for network resilience - prevents homepage crashes by always providing usable data
 * Features: fast timeouts, local storage cache, aggressive fallbacks
 */
export function useResilientData<T>({
  fetcher,
  fallbackData = null,
  timeout = 3000, // Reduced from 5000ms for better UX
  retryAttempts = 1, // Reduced from 2 for faster fails 
  retryDelay = 500, // Reduced from 1000ms for faster retries
  enableOfflineMode = true
}: ResilientDataOptions<T>): ResilientDataResult<T> {
  const [data, setData] = useState<T | null>(fallbackData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStale, setIsStale] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  // Monitor online/offline status
  useEffect(() => {
    if (!enableOfflineMode) return;

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [enableOfflineMode]);

  const fetchWithTimeout = useCallback(async (signal: AbortSignal): Promise<T> => {
    return Promise.race([
      fetcher(),
      new Promise<never>((_, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error(`Request timeout after ${timeout}ms`));
        }, timeout);
        
        signal.addEventListener('abort', () => {
          clearTimeout(timeoutId);
          reject(new Error('Request aborted'));
        });
      })
    ]);
  }, [fetcher, timeout]);

  const fetchWithRetry = useCallback(async (signal: AbortSignal, attempts = retryAttempts): Promise<T> => {
    try {
      const result = await fetchWithTimeout(signal);
      return result;
    } catch (err) {
      if (signal.aborted) throw err;
      
      if (attempts > 0) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return fetchWithRetry(signal, attempts - 1);
      }
      throw err;
    }
  }, [fetchWithTimeout, retryAttempts, retryDelay]);

  const executeRequest = useCallback(async () => {
    // Don't fetch if offline and we have fallback data - NETWORK RESILIENCE
    if (isOffline && data) {
      setLoading(false);
      setIsStale(true);
      return;
    }

    setLoading(true);
    setError(null);

    // Cancel previous request
    if (abortController) {
      abortController.abort();
    }

    const newController = new AbortController();
    setAbortController(newController);

    try {
      const result = await fetchWithRetry(newController.signal);
      setData(result);
      setError(null);
      setIsStale(false);
      
      // Store successful result in sessionStorage for instant fallback - NETWORK RESILIENCE
      try {
        sessionStorage.setItem(`resilient-data-cache-${timeout}`, JSON.stringify(result));
      } catch (storageError) {
        console.warn('Failed to cache data in sessionStorage:', storageError);
      }
    } catch (err) {
      if (newController.signal.aborted) return;

      console.warn('Data fetch failed, using fallbacks:', err);
      
      // Try sessionStorage cache first - NETWORK RESILIENCE
      try {
        const cached = sessionStorage.getItem(`resilient-data-cache-${timeout}`);
        if (cached && !data) {
          const cachedData = JSON.parse(cached);
          setData(cachedData);
          setIsStale(true);
          console.log('Using cached data as fallback');
          setLoading(false);
          return;
        }
      } catch (cacheError) {
        console.warn('Failed to read cached data:', cacheError);
      }
      
      // If we have fallback data and no cached data, use it
      if (fallbackData && !data) {
        setData(fallbackData);
        setIsStale(true);
        console.log('Using provided fallback data');
      }
      
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
      setAbortController(null);
    }
  }, [isOffline, data, fallbackData, fetchWithRetry, abortController, timeout]);

  const retry = useCallback(() => {
    executeRequest();
  }, [executeRequest]);

  useEffect(() => {
    executeRequest();

    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, []);

  // Auto-retry when coming back online
  useEffect(() => {
    if (!isOffline && isStale) {
      executeRequest();
    }
  }, [isOffline, isStale, executeRequest]);

  return {
    data,
    loading,
    error,
    retry,
    isStale,
    isOffline
  };
}