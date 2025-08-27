import { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onImageUpload?: (file: File, altText?: string) => Promise<string>;
}

/**
 * FASE 2: Editor com guards de visibilidade para prevenir erros addRange()
 * Nunca desmonta, apenas esconde via CSS
 */
export const RichTextEditor = ({ 
  value, 
  onChange, 
  placeholder = "Escreva o conteúdo do artigo...",
  className,
  onImageUpload
}: RichTextEditorProps) => {
  const quillRef = useRef<ReactQuill>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  // Garantir que o valor nunca seja undefined
  const safeValue = useMemo(() => {
    if (value === undefined || value === null) {
      return '';
    }
    return typeof value === 'string' ? value : String(value);
  }, [value]);

  // Verificação simples de disponibilidade do editor
  const isEditorAvailable = useCallback((): boolean => {
    if (!quillRef.current || !containerRef.current) return false;
    
    const container = containerRef.current;
    
    // Verificar se está oculto por display: none
    const computedStyle = window.getComputedStyle(container);
    if (computedStyle.display === 'none') {
      console.log('🚫 RichTextEditor - hidden by display:none');
      return false;
    }
    
    return true;
  }, []);

  // Acesso seguro ao Quill
  const getQuillSafely = useCallback(() => {
    if (!isEditorAvailable()) {
      console.log('⚠️ RichTextEditor - attempted to access Quill while not available');
      return null;
    }
    return quillRef.current?.getEditor();
  }, [isEditorAvailable]);

  // Verificação de foco
  const isEditorFocused = useCallback((): boolean => {
    const quill = getQuillSafely();
    if (!quill) return false;
    
    return quill.hasFocus();
  }, [getQuillSafely]);

  // Montagem controlada
  useEffect(() => {
    console.log('🚀 RichTextEditor - component mounted');
    setIsMounted(true);
    
    // Delay para garantir DOM pronto
    const timer = setTimeout(() => {
      setIsReady(true);
      console.log('✅ RichTextEditor - marked as ready');
    }, 100); // Reduzido de 200ms para melhor performance

    return () => {
      clearTimeout(timer);
      setIsMounted(false);
    };
  }, []);

  // Manipulação de mudanças
  const handleChange = useCallback((content: string, delta: any, source: string, editor: any) => {
    if (source !== 'user') return;
    
    console.log('📝 RichTextEditor - handleChange from user:', content.slice(0, 100) + '...');
    onChange(content);
  }, [onChange]);
  
  // FASE 2: Image handler COM guards
  const imageHandler = useCallback(() => {
    try {
      const quill = getQuillSafely();
      if (!quill) {
        console.log('🚫 RichTextEditor - image upload blocked: editor not ready');
        return;
      }
      
      console.log('📷 RichTextEditor - image handler called');
      
      const input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.setAttribute('accept', 'image/*');
      input.click();

      input.onchange = async () => {
        const file = input.files?.[0];
        if (file && onImageUpload) {
          try {
            console.log('⬆️ RichTextEditor - uploading image:', file.name);
            const imageUrl = await onImageUpload(file, `Imagem inserida em ${new Date().toLocaleString()}`);
            
            // Re-verificar se ainda está seguro após upload
            const safeQuill = getQuillSafely();
            if (!safeQuill) {
              console.log('🚫 RichTextEditor - image insertion blocked: editor not safe after upload');
              return;
            }
            
            if (isEditorFocused()) {
              console.log('🎯 RichTextEditor - inserting image at cursor');
              const range = safeQuill.getSelection() || { index: 0 };
              safeQuill.insertEmbed(range.index, 'image', imageUrl);
              safeQuill.setSelection(range.index + 1);
            } else {
              console.log('📌 RichTextEditor - inserting image at end');
              const length = safeQuill.getLength();
              safeQuill.insertEmbed(length - 1, 'image', imageUrl);
              safeQuill.setSelection(length);
            }
          } catch (error) {
            console.error('🚨 RichTextEditor - error uploading image:', error);
            setHasError(true);
          }
        }
      };
    } catch (error) {
      console.error('🚨 RichTextEditor - error in imageHandler:', error);
      setHasError(true);
    }
  }, [onImageUpload, getQuillSafely, isEditorFocused]);

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

  // Focus/Blur handlers
  const handleFocus = useCallback(() => {
    console.log('👁️ RichTextEditor - focused');
    setHasError(false);
  }, []);

  const handleBlur = useCallback(() => {
    console.log('👋 RichTextEditor - blurred');
  }, []);

  // Container sempre visível
  const containerClass = cn(
    "prose-editor min-h-[400px]", // Altura mínima fixa para reduzir CLS
    className
  );

  // Loading state
  if (!isMounted || !isReady) {
    return (
      <div className={containerClass} ref={containerRef}>
        <div className="flex items-center justify-center h-96 border rounded-md">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
            <div className="text-muted-foreground text-sm">Carregando editor...</div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (hasError) {
    return (
      <div className={containerClass} ref={containerRef}>
        <div className="flex items-center justify-center h-96 border rounded-md border-red-200 bg-red-50">
          <div className="text-center">
            <div className="text-red-600 mb-2">⚠️ Erro no editor</div>
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
      </div>
    );
  }

  console.log('🎨 RichTextEditor - rendering ReactQuill:', { 
    safeValueLength: safeValue.length, 
    isReady
  });

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
      <div className={containerClass} ref={containerRef}>
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