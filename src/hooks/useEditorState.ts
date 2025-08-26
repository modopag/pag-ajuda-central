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
    initialContent ? btoa(initialContent.replace(/\s+/g, ' ').trim()) : ''
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
      const currentHash = content ? btoa(content.replace(/\s+/g, ' ').trim()) : '';
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
    initialHashRef.current = currentContent ? btoa(currentContent.replace(/\s+/g, ' ').trim()) : '';
    
    dirtyRef.current = false;
    setIsDirty(false);
  }, []);

  const resetToInitial = useCallback(() => {
    console.log('🔄 useEditorState - resetting to initial content:', initialContent);
    
    // Ativar write lock durante reset
    writeLockRef.current = true;
    
    contentRef.current = initialContent || '';
    initialHashRef.current = initialContent ? btoa(initialContent.replace(/\s+/g, ' ').trim()) : '';
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