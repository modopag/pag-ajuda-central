import { useCallback, useRef } from 'react';
import { useDebounce } from './useDebounce';

interface UseDebouncedInputsOptions {
  delay?: number;
}

interface UseDebouncedInputsReturn {
  debouncedTitle: string;
  debouncedSlug: string;
  debouncedMetaTitle: string;
  debouncedMetaDescription: string;
  handleTitleChange: (value: string) => void;
  handleSlugChange: (value: string) => void;
  handleMetaTitleChange: (value: string) => void;
  handleMetaDescriptionChange: (value: string) => void;
}

/**
 * FASE 3: Hook para debounce robusto de inputs críticos
 * Reduz re-renders e melhora performance das validações SEO
 */
export const useDebouncedInputs = (
  initialTitle = '',
  initialSlug = '',
  initialMetaTitle = '',
  initialMetaDescription = '',
  onTitleChange: (value: string) => void,
  onSlugChange: (value: string) => void,
  onMetaTitleChange: (value: string) => void,
  onMetaDescriptionChange: (value: string) => void,
  options: UseDebouncedInputsOptions = {}
): UseDebouncedInputsReturn => {
  const { delay = 800 } = options; // FASE 3: 800ms debounce robusto
  
  const titleRef = useRef(initialTitle);
  const slugRef = useRef(initialSlug);
  const metaTitleRef = useRef(initialMetaTitle);
  const metaDescriptionRef = useRef(initialMetaDescription);
  
  // Debounced values para validações
  const debouncedTitle = useDebounce(titleRef.current, delay);
  const debouncedSlug = useDebounce(slugRef.current, delay);
  const debouncedMetaTitle = useDebounce(metaTitleRef.current, delay);
  const debouncedMetaDescription = useDebounce(metaDescriptionRef.current, delay);
  
  const handleTitleChange = useCallback((value: string) => {
    titleRef.current = value;
    onTitleChange(value);
  }, [onTitleChange]);
  
  const handleSlugChange = useCallback((value: string) => {
    slugRef.current = value;
    onSlugChange(value);
  }, [onSlugChange]);
  
  const handleMetaTitleChange = useCallback((value: string) => {
    metaTitleRef.current = value;
    onMetaTitleChange(value);
  }, [onMetaTitleChange]);
  
  const handleMetaDescriptionChange = useCallback((value: string) => {
    metaDescriptionRef.current = value;
    onMetaDescriptionChange(value);
  }, [onMetaDescriptionChange]);

  return {
    debouncedTitle,
    debouncedSlug,
    debouncedMetaTitle,
    debouncedMetaDescription,
    handleTitleChange,
    handleSlugChange,
    handleMetaTitleChange,
    handleMetaDescriptionChange
  };
};