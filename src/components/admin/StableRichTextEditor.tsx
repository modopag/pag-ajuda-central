import { useCallback, useEffect, useState } from 'react';
import { RichTextEditor } from './RichTextEditor';
import { useEditorState } from '@/hooks/useEditorState';
import { cn } from '@/lib/utils';

interface StableRichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onImageUpload?: (file: File, altText?: string) => Promise<string>;
  isVisible?: boolean;
  loading?: boolean;
  articleId?: string; // Para controle de montagem por artigo
}

/**
 * Wrapper estável para RichTextEditor que previne desmontagem em mudanças de tab
 * Mantém estado interno e só aplica valor externo em load inicial ou reset explícito
 */
export const StableRichTextEditor = ({ 
  value, 
  onChange, 
  placeholder,
  className,
  onImageUpload,
  isVisible = true,
  loading = false,
  articleId
}: StableRichTextEditorProps) => {
  const [hasInitialized, setHasInitialized] = useState(false);
  const [currentArticleId, setCurrentArticleId] = useState<string | undefined>(articleId);

  // Reset quando mudar de artigo
  useEffect(() => {
    if (articleId && articleId !== currentArticleId) {
      console.log('StableRichTextEditor - article changed, resetting:', { from: currentArticleId, to: articleId });
      setCurrentArticleId(articleId);
      setHasInitialized(false);
      editorState.resetToInitial();
    }
  }, [articleId, currentArticleId]);

  const editorState = useEditorState({
    initialContent: value,
    onContentChange: onChange
  });

  // Só aplicar valor externo no load inicial (quando não está dirty)
  useEffect(() => {
    if (!hasInitialized && value && !editorState.dirtyRef.current) {
      console.log('StableRichTextEditor - initializing with value:', value);
      editorState.setContent(value);
      setHasInitialized(true);
    }
  }, [value, hasInitialized, editorState]);

  const handleContentChange = useCallback((content: string) => {
    editorState.handleContentChange(content);
  }, [editorState]);

  // Marcar como limpo após save bem-sucedido (deve ser chamado externamente)
  useEffect(() => {
    if (hasInitialized && !editorState.isDirty && value === editorState.contentRef.current) {
      editorState.markClean();
    }
  }, [value, hasInitialized, editorState]);

  // Container com altura mínima para reduzir CLS
  const containerClasses = cn(
    "relative min-h-[480px] w-full transition-all duration-200",
    {
      "opacity-0 pointer-events-none": !isVisible,
      "opacity-100": isVisible
    },
    className
  );

  if (loading) {
    return (
      <div className={containerClasses}>
        <div className="flex items-center justify-center h-96 border rounded-md">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
            <div className="text-muted-foreground text-sm">Carregando editor...</div>
          </div>
        </div>
      </div>
    );
  }

  console.log('StableRichTextEditor - rendering:', { 
    isVisible, 
    hasInitialized, 
    isDirty: editorState.isDirty,
    currentContent: editorState.contentRef.current?.slice(0, 50) + '...'
  });

  return (
    <div className={containerClasses}>
      {/* Editor sempre montado, mas escondido quando não visível */}
      <RichTextEditor
        value={editorState.contentRef.current}
        onChange={handleContentChange}
        placeholder={placeholder}
        onImageUpload={onImageUpload}
        isVisible={isVisible}
      />
      
      {/* Indicador de estado dirty (apenas para debug em dev) */}
      {process.env.NODE_ENV === 'development' && editorState.isDirty && (
        <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 px-2 py-1 text-xs rounded">
          Não salvo
        </div>
      )}
    </div>
  );
};