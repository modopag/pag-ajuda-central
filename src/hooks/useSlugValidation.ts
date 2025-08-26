import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from './useDebounce';
import { getDataAdapter } from '@/lib/data-adapter';

interface SlugValidationResult {
  isValid: boolean;
  isChecking: boolean;
  isDuplicate: boolean;
  error?: string;
}

export function useSlugValidation(slug: string, currentArticleId?: string) {
  const [result, setResult] = useState<SlugValidationResult>({
    isValid: true,
    isChecking: false,
    isDuplicate: false
  });

  const debouncedSlug = useDebounce(slug, 500);

  const validateSlug = useCallback(async (slugToValidate: string) => {
    if (!slugToValidate.trim()) {
      setResult({
        isValid: false,
        isChecking: false,
        isDuplicate: false,
        error: 'Slug é obrigatório'
      });
      return;
    }

    // Validar formato do slug
    if (!/^[a-z0-9-]+$/.test(slugToValidate)) {
      setResult({
        isValid: false,
        isChecking: false,
        isDuplicate: false,
        error: 'Slug deve conter apenas letras minúsculas, números e hífens'
      });
      return;
    }

    if (slugToValidate.length > 100) {
      setResult({
        isValid: false,
        isChecking: false,
        isDuplicate: false,
        error: 'Slug muito longo (máximo 100 caracteres)'
      });
      return;
    }

    setResult(prev => ({ ...prev, isChecking: true }));

    try {
      const adapter = await getDataAdapter();
      const articles = await adapter.getArticles();
      
      // Verificar se o slug já existe (excluindo o artigo atual se estiver editando)
      const isDuplicate = articles.some(article => 
        article.slug === slugToValidate && article.id !== currentArticleId
      );

      setResult({
        isValid: !isDuplicate,
        isChecking: false,
        isDuplicate,
        error: isDuplicate ? 'Este slug já está sendo usado por outro artigo' : undefined
      });
    } catch (error) {
      setResult({
        isValid: false,
        isChecking: false,
        isDuplicate: false,
        error: 'Erro ao validar slug'
      });
    }
  }, [currentArticleId]);

  useEffect(() => {
    validateSlug(debouncedSlug);
  }, [debouncedSlug, validateSlug]);

  return result;
}