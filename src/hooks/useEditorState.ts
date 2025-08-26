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
 * Hook para gerenciar estado estável do editor com controle de dirty state
 * Previne reset acidental de conteúdo durante mudanças de tabs
 */
export const useEditorState = ({ 
  initialContent, 
  onContentChange 
}: UseEditorStateProps): UseEditorStateReturn => {
  const contentRef = useRef<string>(initialContent || '');
  const dirtyRef = useRef<boolean>(false);
  const [isDirty, setIsDirty] = useState(false);

  const setContent = useCallback((content: string) => {
    contentRef.current = content;
    onContentChange(content);
  }, [onContentChange]);

  const handleContentChange = useCallback((content: string) => {
    console.log('useEditorState - handleContentChange:', { content, isDirty: dirtyRef.current });
    
    // Só marcar como dirty se realmente mudou
    if (content !== contentRef.current) {
      contentRef.current = content;
      
      if (!dirtyRef.current) {
        dirtyRef.current = true;
        setIsDirty(true);
        console.log('useEditorState - marked as dirty');
      }
      
      onContentChange(content);
    }
  }, [onContentChange]);

  const markClean = useCallback(() => {
    console.log('useEditorState - marking as clean');
    dirtyRef.current = false;
    setIsDirty(false);
  }, []);

  const resetToInitial = useCallback(() => {
    console.log('useEditorState - resetting to initial content:', initialContent);
    contentRef.current = initialContent || '';
    dirtyRef.current = false;
    setIsDirty(false);
    onContentChange(initialContent || '');
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