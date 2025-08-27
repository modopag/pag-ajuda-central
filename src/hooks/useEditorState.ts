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
 * Cria hash UTF-8 seguro para comparação de conteúdo
 */
const createContentHash = (content: string): string => {
  try {
    // Normalizar espaços em branco e criar hash simples
    const normalized = content.replace(/\s+/g, ' ').trim();
    
    // Usar hash simples baseado em código de caractere
    let hash = 0;
    for (let i = 0; i < normalized.length; i++) {
      const char = normalized.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Converter para 32bit integer
    }
    
    return hash.toString(36);
  } catch (error) {
    console.warn('Erro ao criar hash de conteúdo:', error);
    // Fallback para timestamp + comprimento
    return `${Date.now()}_${content.length}`;
  }
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
  
  // Hash do conteúdo inicial para detecção mais precisa
  const initialHashRef = useRef<string>(
    createContentHash(initialContent || '')
  );

  const setContent = useCallback((content: string) => {
    console.log('📝 useEditorState - setContent (external):', { content: content.slice(0, 50) + '...' });
    
    // Atualizar conteúdo e resetar estado dirty
    contentRef.current = content;
    initialHashRef.current = createContentHash(content || '');
    dirtyRef.current = false;
    setIsDirty(false);
  }, []);

  const handleContentChange = useCallback((content: string) => {
    console.log('🔄 useEditorState - handleContentChange (from editor):', { 
      contentLength: content.length,
      previousLength: contentRef.current.length
    });
    
    // Sempre atualizar ref primeiro
    contentRef.current = content;
    
    // Verificar se mudou em relação ao conteúdo inicial usando hash
    const currentHash = createContentHash(content || '');
    const reallyChanged = currentHash !== initialHashRef.current;
    
    if (reallyChanged !== dirtyRef.current) {
      dirtyRef.current = reallyChanged;
      setIsDirty(reallyChanged);
      console.log(`${reallyChanged ? '✏️' : '✅'} useEditorState - marked as ${reallyChanged ? 'dirty' : 'clean'}`);
    }
    
    // Sempre propagar mudanças para o componente pai
    onContentChange(content);
  }, [onContentChange]);

  const markClean = useCallback(() => {
    console.log('🧹 useEditorState - marking as clean and updating initial hash');
    
    // Atualizar hash inicial para o conteúdo atual
    const currentContent = contentRef.current || '';
    initialHashRef.current = createContentHash(currentContent);
    
    dirtyRef.current = false;
    setIsDirty(false);
  }, []);

  const resetToInitial = useCallback(() => {
    console.log('🔄 useEditorState - resetting to initial content');
    
    const safeInitialContent = initialContent || '';
    contentRef.current = safeInitialContent;
    initialHashRef.current = createContentHash(safeInitialContent);
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