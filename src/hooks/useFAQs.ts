import { useState, useEffect } from 'react';
import { getDataAdapter } from '@/lib/data-adapter';
import type { FAQ } from '@/types/admin';

export function useFAQs() {
  const [faqs, setFAQs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const adapter = await getDataAdapter();
      const data = await adapter.getFAQs();
      setFAQs(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching FAQs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch FAQs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFAQs();
  }, []);

  const refetch = () => {
    fetchFAQs();
  };

  return {
    faqs,
    loading,
    error,
    refetch
  };
}