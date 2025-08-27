import { useState, useEffect } from 'react';
import { getDataAdapter } from '@/lib/data-adapter';
import type { Category } from '@/types/admin';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const adapter = await getDataAdapter();
        const data = await adapter.getCategoriesWithCounts();
        setCategories(data.filter(category => category.is_active));
        setError(null);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Erro ao carregar categorias');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
}