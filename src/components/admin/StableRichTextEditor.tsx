import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useEditorState } from '@/hooks/useEditorState';
import { RichTextEditor } from './RichTextEditor';

export interface StableRichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onImageUpload?: (file: File, altText?: string) => Promise<string>;
  loading?: boolean;
  articleId?: string;
}

/**
 * Editor com DOM sempre estável - nunca desmonta o RichTextEditor
 */
export const StableRichTextEditor: React.FC<StableRichTextEditorProps> = ({
  value,
  onChange,
  placeholder,
  className,
  onImageUpload,
  loading = false,
  articleId
}) => {
  // STABLE KEY - never changes after initialization to prevent remounts
  const editorKey = useMemo(() => `editor-stable-${Date.now()}`, []);
  const lastArticleIdRef = useRef<string | undefined>(articleId);
  
  // Estado interno do editor usando o hook personalizado
  const {
    contentRef,
    isDirty,
    handleContentChange,
    setContent
  } = useEditorState({
    initialContent: value,
    onContentChange: onChange
  });
  
  // Sincronizar com mudanças externas - GUARD RIGOROSO para evitar loops
  useEffect(() => {
    if (
      typeof value === 'string' && 
      value !== contentRef.current && 
      value.trim().length > 0 &&
      !isDirty // Só sincroniza se não há mudanças locais
    ) {
      console.log('📥 StableRichTextEditor - syncing external value change');
      setContent(value);
    }
  }, [value, setContent, isDirty]);
  
  if (loading) {
    return (
      <div className="min-h-[200px] flex items-center justify-center border border-border rounded-md bg-muted/50">
        <div className="text-sm text-muted-foreground">Carregando editor...</div>
      </div>
    );
  }

  console.log('🎨 StableRichTextEditor - rendering:', { 
    hasInitialized: true,
    isDirty,
    contentLength: contentRef.current.length
  });

  return (
    <div className="relative">
      {import.meta.env.DEV && isDirty && (
        <div className="absolute -top-6 right-0 text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded z-50">
          Not saved
        </div>
      )}
      
      <RichTextEditor
        key={editorKey}
        value={contentRef.current}
        onChange={handleContentChange}
        placeholder={placeholder}
        className={className}
        onImageUpload={onImageUpload}
      />
    </div>
  );
};