import { useQuery, QueryKey } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

/**
 * Hook for SSR-safe data fetching that uses initial SSR data
 * and then refetches on the client if needed
 */
export function useSSRSafeQuery<T>(
  queryKey: QueryKey,
  queryFn: () => Promise<T>,
  ssrData?: T,
  options?: {
    staleTime?: number;
    enabled?: boolean;
  }
) {
  const [isInitialized, setIsInitialized] = useState(false);

  // Use SSR data as initial data if available
  const query = useQuery({
    queryKey,
    queryFn,
    initialData: ssrData,
    staleTime: options?.staleTime ?? (ssrData ? Infinity : 0),
    enabled: options?.enabled !== false,
    refetchOnMount: ssrData ? false : true,
    refetchOnWindowFocus: false,
  });

  // Mark as initialized after first render to prevent hydration issues
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  return {
    ...query,
    isInitialized,
    // Return SSR data during hydration to prevent mismatches
    data: isInitialized ? query.data : ssrData || query.data,
  };
}

/**
 * Hook to safely access window/document in SSR environment
 */
export function useSSRSafe<T>(
  clientValue: () => T,
  serverValue: T
): T {
  const [value, setValue] = useState<T>(serverValue);

  useEffect(() => {
    setValue(clientValue());
  }, []);

  return value;
}