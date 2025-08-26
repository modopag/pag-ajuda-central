import { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { cn } from '@/lib/utils';

// Componente legado - use StableRichTextEditor para editores principais

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onImageUpload?: (file: File, altText?: string) => Promise<string>;
  isVisible?: boolean; // Novo prop para controlar visibilidade
}

export const RichTextEditor = ({ 
  value, 
  onChange, 
  placeholder = "Escreva o conteúdo do artigo...",
  className,
  onImageUpload,
  isVisible = true
}: RichTextEditorProps) => {
  const quillRef = useRef<ReactQuill>(null);
  const [isReady, setIsReady] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  // Garante que o valor nunca seja undefined e seja uma string válida
  const safeValue = useMemo(() => {
    console.log('RichTextEditor - processing value:', { value, type: typeof value });
    
    if (value === undefined || value === null) {
      console.log('RichTextEditor - value is null/undefined, using empty string');
      return '';
    }
    
    if (typeof value !== 'string') {
      console.log('RichTextEditor - value is not string, converting:', value);
      return String(value);
    }
    
    return value;
  }, [value]);

  // Verificar se o editor está focado
  const isEditorFocused = useCallback(() => {
    try {
      const quill = quillRef.current?.getEditor();
      if (!quill) return false;
      
      const selection = quill.getSelection();
      return selection !== null && document.activeElement?.closest('.ql-editor') !== null;
    } catch (error) {
      console.warn('RichTextEditor - error checking focus:', error);
      return false;
    }
  }, []);

  // Log quando o componente monta
  useEffect(() => {
    console.log('RichTextEditor - component mounted with value:', safeValue);
    setIsMounted(true);
    
    // Delay controlado para garantir que o DOM está pronto
    const timer = setTimeout(() => {
      if (isVisible) {
        setIsReady(true);
        console.log('RichTextEditor - marked as ready');
      }
    }, isVisible ? 200 : 0);

    return () => {
      clearTimeout(timer);
      setIsMounted(false);
    };
  }, [isVisible]);

  // Atualizar readiness quando visibilidade muda
  useEffect(() => {
    if (isMounted && isVisible && !isReady) {
      const timer = setTimeout(() => {
        setIsReady(true);
        console.log('RichTextEditor - marked as ready after visibility change');
      }, 200);
      
      return () => clearTimeout(timer);
    } else if (!isVisible) {
      // Não desmontar completamente, apenas esconder
      console.log('RichTextEditor - hidden but not unmounted');
    }
  }, [isVisible, isMounted, isReady]);

  // Handler para mudanças com proteção contra erros
  const handleChange = useCallback((content: string) => {
    try {
      console.log('RichTextEditor - handleChange called:', { content, safeValue });
      
      // Verificar se o conteúdo realmente mudou
      if (content !== safeValue) {
        console.log('RichTextEditor - content changed, calling onChange');
        onChange(content || '');
        setHasError(false); // Reset error state on successful change
      }
    } catch (error) {
      console.error('RichTextEditor - error in handleChange:', error);
      setHasError(true);
    }
  }, [onChange, safeValue]);
  
  const imageHandler = useCallback(() => {
    try {
      console.log('RichTextEditor - imageHandler called');
      
      const input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.setAttribute('accept', 'image/*');
      input.click();

      input.onchange = async () => {
        const file = input.files?.[0];
        if (file && onImageUpload) {
          try {
            console.log('RichTextEditor - uploading image:', file.name);
            const imageUrl = await onImageUpload(file, `Imagem inserida em ${new Date().toLocaleString()}`);
            const quill = quillRef.current?.getEditor();
            
            if (quill && isEditorFocused()) {
              console.log('RichTextEditor - inserting image into focused editor');
              const range = quill.getSelection() || { index: 0 };
              quill.insertEmbed(range.index, 'image', imageUrl);
              
              // Mover cursor após a imagem
              quill.setSelection(range.index + 1);
            } else if (quill) {
              console.log('RichTextEditor - inserting image at end (editor not focused)');
              const length = quill.getLength();
              quill.insertEmbed(length - 1, 'image', imageUrl);
              quill.setSelection(length);
            } else {
              console.error('RichTextEditor - quill editor not available');
            }
          } catch (error) {
            console.error('RichTextEditor - error uploading image:', error);
            setHasError(true);
          }
        }
      };
    } catch (error) {
      console.error('RichTextEditor - error in imageHandler:', error);
      setHasError(true);
    }
  }, [onImageUpload, isEditorFocused]);

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        ['link', 'image'],
        ['blockquote', 'code-block'],
        [{ 'align': [] }],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    },
    clipboard: {
      matchVisual: false,
    }
  }), [imageHandler]);

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'link', 'image', 'blockquote', 'code-block', 'align'
  ];

  // Proteção contra seleção inválida
  const handleFocus = useCallback(() => {
    try {
      console.log('RichTextEditor - focused');
      setHasError(false); // Reset error on focus
    } catch (error) {
      console.warn('RichTextEditor - error on focus:', error);
    }
  }, []);

  const handleBlur = useCallback(() => {
    try {
      console.log('RichTextEditor - blurred');
    } catch (error) {
      console.warn('RichTextEditor - error on blur:', error);
    }
  }, []);

  // Renderização condicional baseada em estado
  if (!isMounted || !isVisible) {
    return null; // Não renderizar quando não visível
  }

  // Loading state
  if (!isReady) {
    console.log('RichTextEditor - not ready, showing loading');
    return (
      <div className={cn("prose-editor flex items-center justify-center h-96 border rounded-md", className)}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
          <div className="text-muted-foreground text-sm">Carregando editor...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (hasError) {
    console.log('RichTextEditor - has error, showing recovery option');
    return (
      <div className={cn("prose-editor flex items-center justify-center h-96 border rounded-md border-red-200 bg-red-50", className)}>
        <div className="text-center">
          <div className="text-red-600 mb-2">Erro no editor</div>
          <button 
            onClick={() => {
              setHasError(false);
              setIsReady(false);
              setTimeout(() => setIsReady(true), 100);
            }}
            className="text-sm text-blue-600 hover:underline"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  console.log('RichTextEditor - rendering ReactQuill with:', { safeValue, isReady, isVisible });

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .ql-editor {
            min-height: 300px !important;
            font-size: 16px;
            line-height: 1.6;
          }
          .ql-toolbar {
            border-top: 1px solid hsl(var(--border));
            border-left: 1px solid hsl(var(--border));
            border-right: 1px solid hsl(var(--border));
            background: hsl(var(--background));
          }
          .ql-container {
            border-bottom: 1px solid hsl(var(--border));
            border-left: 1px solid hsl(var(--border));
            border-right: 1px solid hsl(var(--border));
          }
          .ql-editor:focus {
            outline: none;
          }
          .ql-editor.ql-blank::before {
            font-style: normal;
            color: hsl(var(--muted-foreground));
          }
        `
      }} />
      <div className={cn("prose-editor", className)}>
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={safeValue}
          onChange={handleChange}
          placeholder={placeholder}
          modules={modules}
          formats={formats}
          className="h-96"
          bounds=".prose-editor"
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </div>
    </>
  );
};