import { useCallback, useEffect, useState, lazy, Suspense } from 'react';
import { useEditorState } from '@/hooks/useEditorState';
import { cn } from '@/lib/utils';

// Lazy load ReactQuill para melhor performance
const RichTextEditor = lazy(() => import('./RichTextEditor').then(module => ({ default: module.RichTextEditor })));

interface StableRichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onImageUpload?: (file: File, altText?: string) => Promise<string>;
  isVisible?: boolean;
  loading?: boolean;
  articleId?: string;
}

/**
 * Editor estável que nunca desmonta e usa display:none para esconder
 * FASE 2: Estabilização completa - zero erros addRange()
 * FASE 3: Performance otimizada com lazy loading
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
      console.log('🔄 StableRichTextEditor - article changed, resetting:', { from: currentArticleId, to: articleId });
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
      console.log('🎯 StableRichTextEditor - initializing with value:', value.slice(0, 100) + '...');
      editorState.setContent(value);
      setHasInitialized(true);
    }
  }, [value, hasInitialized, editorState]);

  const handleContentChange = useCallback((content: string) => {
    console.log('📝 StableRichTextEditor - content changed, delegating to editorState');
    editorState.handleContentChange(content);
  }, [editorState]);

  // Marcar como limpo após save bem-sucedido (deve ser chamado externamente)
  useEffect(() => {
    if (hasInitialized && !editorState.isDirty && value === editorState.contentRef.current) {
      console.log('✅ StableRichTextEditor - marking as clean after successful save');
      editorState.markClean();
    }
  }, [value, hasInitialized, editorState]);

  // FASE 2: Container com display:none para esconder completamente
  // Remove qualquer transição CSS que possa causar conflitos
  const containerClasses = cn(
    "relative min-h-[480px] w-full", // Altura fixa para reduzir CLS
    {
      "hidden": !isVisible, // display: none ao invés de opacity
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

  console.log('🎨 StableRichTextEditor - rendering:', { 
    isVisible, 
    hasInitialized, 
    isDirty: editorState.isDirty,
    contentLength: editorState.contentRef.current?.length || 0
  });

  return (
    <div className={containerClasses}>
      {/* FASE 3: Lazy loading do ReactQuill para melhor performance */}
      <Suspense fallback={
        <div className="flex items-center justify-center h-96 border rounded-md">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
            <div className="text-muted-foreground text-sm">Carregando editor...</div>
          </div>
        </div>
      }>
        {/* Editor sempre montado, mas escondido quando não visível */}
        <RichTextEditor
          value={editorState.contentRef.current}
          onChange={handleContentChange}
          placeholder={placeholder}
          onImageUpload={onImageUpload}
          isVisible={isVisible}
        />
      </Suspense>
      
      {/* Debug indicator (apenas dev) */}
      {process.env.NODE_ENV === 'development' && editorState.isDirty && (
        <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 px-2 py-1 text-xs rounded z-10">
          💾 Não salvo
        </div>
      )}
    </div>
  );
};