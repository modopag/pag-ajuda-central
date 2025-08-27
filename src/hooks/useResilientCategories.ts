import { getDataAdapter } from '@/lib/data-adapter';
import { useResilientData } from './useResilientData';
import type { Category } from '@/types/admin';

// Fallback categories to ensure homepage never breaks
const FALLBACK_CATEGORIES: Category[] = [
  {
    id: 'fallback-1',
    name: 'Dúvidas Iniciais',
    slug: 'duvidas-iniciais',
    description: 'Primeiros passos com a modoPAG',
    icon_url: '/icons/duvidas-iniciais.svg',
    position: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    article_count: 0
  },
  {
    id: 'fallback-2',
    name: 'Maquininhas modoPAG',
    slug: 'maquininhas-modopag',
    description: 'Guias sobre nossas maquininhas',
    icon_url: '/icons/maquininha.svg',
    position: 2,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    article_count: 0
  },
  {
    id: 'fallback-3',
    name: 'Taxas e Recebimentos',
    slug: 'taxas-e-recebimentos',
    description: 'Entenda nossas taxas e prazos',
    icon_url: '/icons/taxas.svg',
    position: 3,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    article_count: 0
  },
  {
    id: 'fallback-4',
    name: 'Suporte e Contato',
    slug: 'suporte-e-contato',
    description: 'Como entrar em contato conosco',
    icon_url: '/icons/suporte.svg',
    position: 4,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    article_count: 0
  }
];

export function useResilientCategories() {
  const fetcher = async () => {
    const adapter = await getDataAdapter();
    const data = await adapter.getCategoriesWithCounts();
    return data.filter(category => category.is_active);
  };

  const result = useResilientData({
    fetcher,
    fallbackData: FALLBACK_CATEGORIES,
    timeout: 2000, // Faster timeout for better UX - NETWORK RESILIENCE
    retryAttempts: 1, // Quick fail for better performance
    enableOfflineMode: true
  });

  return {
    categories: result.data || FALLBACK_CATEGORIES,
    loading: result.loading,
    error: result.error,
    retry: result.retry,
    isStale: result.isStale,
    isOffline: result.isOffline
  };
}