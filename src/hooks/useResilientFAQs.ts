import { getDataAdapter } from '@/lib/data-adapter';
import { useResilientData } from './useResilientData';
import type { FAQ } from '@/types/admin';

// Fallback FAQs to ensure section renders even if data fails
const FALLBACK_FAQS: FAQ[] = [
  {
    id: 'fallback-1',
    question: 'O que é a modoPAG?',
    answer: 'A modoPAG é uma plataforma completa de pagamentos que oferece maquininhas, conta digital e soluções financeiras para empresas de todos os tamanhos.',
    category: 'geral',
    position: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'fallback-2',
    question: 'Como posso entrar em contato com o suporte?',
    answer: 'Você pode entrar em contato conosco através do WhatsApp, e-mail ou pelos canais oficiais disponíveis em nosso site.',
    category: 'suporte',
    position: 2,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'fallback-3',
    question: 'Quais são as taxas da modoPAG?',
    answer: 'Nossas taxas são competitivas e variam de acordo com o plano escolhido e volume de transações. Entre em contato para conhecer nossa tabela completa.',
    category: 'taxas',
    position: 3,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export function useResilientFAQs() {
  const fetcher = async () => {
    const adapter = await getDataAdapter();
    return await adapter.getFAQs();
  };

  const result = useResilientData({
    fetcher,
    fallbackData: FALLBACK_FAQS,
    timeout: 4000,
    retryAttempts: 1,
  });

  return {
    faqs: result.data || FALLBACK_FAQS,
    loading: result.loading,
    error: result.error,
    retry: result.retry,
    isStale: result.isStale,
    isOffline: result.isOffline
  };
}