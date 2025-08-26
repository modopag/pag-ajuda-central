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
    if (writeLockRef.current) {
      console.log('🔒 useEditorState - write locked, ignoring setContent');
      return;
    }
    
    console.log('📝 useEditorState - setContent:', { content: content.slice(0, 100) + '...' });
    contentRef.current = content;
    onContentChange(content);
  }, [onContentChange]);

  const handleContentChange = useCallback((content: string) => {
    if (writeLockRef.current) {
      console.log('🔒 useEditorState - write locked, ignoring handleContentChange');
      return;
    }
    
    console.log('🔄 useEditorState - handleContentChange:', { 
      contentLength: content.length,
      previousLength: contentRef.current.length,
      isDirty: dirtyRef.current 
    });
    
    // Só marcar como dirty se realmente mudou (comparação robusta)
    if (content !== contentRef.current) {
      contentRef.current = content;
      
      // Verificar se mudou em relação ao conteúdo inicial usando hash
      const currentHash = createContentHash(content || '');
      const reallyChanged = currentHash !== initialHashRef.current;
      
      if (reallyChanged && !dirtyRef.current) {
        dirtyRef.current = true;
        setIsDirty(true);
        console.log('✏️ useEditorState - marked as dirty (content really changed)');
      } else if (!reallyChanged && dirtyRef.current) {
        dirtyRef.current = false;
        setIsDirty(false);
        console.log('✅ useEditorState - marked as clean (reverted to initial)');
      }
      
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
    console.log('🔄 useEditorState - resetting to initial content:', initialContent);
    
    // Ativar write lock durante reset
    writeLockRef.current = true;
    
    contentRef.current = initialContent || '';
    initialHashRef.current = createContentHash(initialContent || '');
    dirtyRef.current = false;
    setIsDirty(false);
    onContentChange(initialContent || '');
    
    // Remover write lock após um tick
    setTimeout(() => {
      writeLockRef.current = false;
      console.log('🔓 useEditorState - write lock released after reset');
    }, 0);
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