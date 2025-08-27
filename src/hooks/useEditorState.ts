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
 * FASE 2: Hook estável com hash-based dirty detection
 * FASE 4: Anti-reset com contentRef único e lock de escrita
 */
export const useEditorState = ({ 
  initialContent, 
  onContentChange 
}: UseEditorStateProps): UseEditorStateReturn => {
  const contentRef = useRef<string>(initialContent || '');
  const dirtyRef = useRef<boolean>(false);
  const writeLockRef = useRef<boolean>(false); // Lock para prevenir conflitos
  const [isDirty, setIsDirty] = useState(false);
  
  // Hash do conteúdo inicial para detecção mais precisa
  const initialHashRef = useRef<string>(
    createContentHash(initialContent || '')
  );

  const setContent = useCallback((content: string) => {
    // FASE 3: Simplificar write lock - só usar durante reset
    if (writeLockRef.current) {
      console.log('🔒 useEditorState - write locked during reset, ignoring setContent');
      return;
    }
    
    console.log('📝 useEditorState - setContent (external):', { content: content.slice(0, 100) + '...' });
    
    // Atualizar conteúdo mas não marcar como dirty (conteúdo externo)
    contentRef.current = content;
    // NÃO chamar onContentChange aqui para evitar loops
  }, []);

  const handleContentChange = useCallback((content: string) => {
    // FASE 3: Simplificar write lock check
    if (writeLockRef.current) {
      console.log('🔒 useEditorState - ignoring change during reset');
      return;
    }
    
    console.log('🔄 useEditorState - handleContentChange (from editor):', { 
      contentLength: content.length,
      previousLength: contentRef.current.length
    });
    
    // Sempre atualizar ref primeiro
    const previousContent = contentRef.current;
    contentRef.current = content;
    
    // Só marcar como dirty se realmente mudou (comparação robusta)
    if (content !== previousContent) {
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
    }
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
    
    // FASE 3: Write lock mais curto e direto
    writeLockRef.current = true;
    
    const safeInitialContent = initialContent || '';
    contentRef.current = safeInitialContent;
    initialHashRef.current = createContentHash(safeInitialContent);
    dirtyRef.current = false;
    setIsDirty(false);
    
    // Propagar mudança para componente pai
    onContentChange(safeInitialContent);
    
    // Release lock imediatamente após operações síncronas
    writeLockRef.current = false;
    console.log('🔓 useEditorState - reset completed, lock released');
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