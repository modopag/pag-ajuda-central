import { useRef, useCallback, useState } from 'react';

interface UseEditorStateProps {
  initialContent: string;
  onContentChange: (content: string) => void;
}

interface UseEditorStateReturn {
  contentRef: React.MutableRefObject<string>;
  dirtyRef: React.MutableRefObject<boolean>;
  isDirty: boolean;
  setContent: (content: string) => void;
  handleContentChange: (content: string) => void;
  markClean: () => void;
  resetToInitial: () => void;
}

/**
 * Comparação simples de conteúdo - removido hash complexo
 */
const normalizeContent = (content: string): string => {
  return content.replace(/\s+/g, ' ').trim();
};

/**
 * Hook otimizado com dirty detection simplificada
 */
export const useEditorState = ({ 
  initialContent, 
  onContentChange 
}: UseEditorStateProps): UseEditorStateReturn => {
  const contentRef = useRef<string>(initialContent || '');
  const dirtyRef = useRef<boolean>(false);
  const [isDirty, setIsDirty] = useState(false);
  
  // Conteúdo inicial normalizado para detecção simples
  const initialContentRef = useRef<string>(
    normalizeContent(initialContent || '')
  );

  const setContent = useCallback((content: string) => {
    console.log('📝 useEditorState - setContent (external)');
    
    // Atualizar conteúdo e resetar estado dirty
    contentRef.current = content;
    initialContentRef.current = normalizeContent(content || '');
    dirtyRef.current = false;
    setIsDirty(false);
  }, []);

  const handleContentChange = useCallback((content: string) => {
    // Sempre atualizar ref primeiro
    contentRef.current = content;
    
    // Verificar se mudou em relação ao conteúdo inicial com comparação simples
    const currentNormalized = normalizeContent(content || '');
    const reallyChanged = currentNormalized !== initialContentRef.current;
    
    if (reallyChanged !== dirtyRef.current) {
      dirtyRef.current = reallyChanged;
      setIsDirty(reallyChanged);
    }
    
    // Sempre propagar mudanças para o componente pai
    onContentChange(content);
  }, [onContentChange]);

  const markClean = useCallback(() => {
    console.log('🧹 useEditorState - marking as clean');
    
    // Atualizar conteúdo inicial normalizado
    const currentContent = contentRef.current || '';
    initialContentRef.current = normalizeContent(currentContent);
    
    dirtyRef.current = false;
    setIsDirty(false);
  }, []);

  const resetToInitial = useCallback(() => {
    console.log('🔄 useEditorState - resetting to initial content');
    
    const safeInitialContent = initialContent || '';
    contentRef.current = safeInitialContent;
    initialContentRef.current = normalizeContent(safeInitialContent);
    dirtyRef.current = false;
    setIsDirty(false);
    
    // Propagar mudança para componente pai
    onContentChange(safeInitialContent);
    
    console.log('✅ useEditorState - reset completed');
  }, [initialContent, onContentChange]);

  return {
    contentRef,
    dirtyRef,
    isDirty,
    setContent,
    handleContentChange,
    markClean,
    resetToInitial
  };
};