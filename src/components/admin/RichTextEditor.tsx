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
  isVisible?: boolean;
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
  onImageUpload,
  isVisible = true
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

  // FASE 3: Guard de visibilidade melhorado - considera opacity e pointer-events
  const isEditorVisible = useCallback(() => {
    try {
      if (!containerRef.current) return false;
      
      // Verificar se está escondido via display:none ou visibility:hidden
      const computedStyle = window.getComputedStyle(containerRef.current);
      if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') {
        return false;
      }
      
      // NOVO: Verificar opacity e pointer-events para detectar escondido via CSS
      const opacity = parseFloat(computedStyle.opacity || '1');
      const pointerEvents = computedStyle.pointerEvents;
      if (opacity <= 0.1 || pointerEvents === 'none') {
        console.log('👁️ RichTextEditor - hidden via opacity/pointer-events:', { opacity, pointerEvents });
        return false;
      }
      
      // Verificar se tem dimensões
      const rect = containerRef.current.getBoundingClientRect();
      const hasSize = rect.width > 0 && rect.height > 0;
      
      console.log('👁️ RichTextEditor - visibility check:', { 
        hasSize, 
        opacity, 
        pointerEvents, 
        isVisible,
        display: computedStyle.display
      });
      
      return hasSize && isVisible;
    } catch (error) {
      console.warn('🚨 RichTextEditor - error checking visibility:', error);
      return false;
    }
  }, [isVisible]);

  // FASE 2: Guard antes de qualquer operação do Quill
  const getQuillSafely = useCallback(() => {
    try {
      const quill = quillRef.current?.getEditor();
      if (!quill || !isEditorVisible()) {
        console.log('🚫 RichTextEditor - Quill operation blocked: editor not visible');
        return null;
      }
      return quill;
    } catch (error) {
      console.warn('🚨 RichTextEditor - error getting Quill safely:', error);
      return null;
    }
  }, [isEditorVisible]);

  // Verificar se o editor está focado COM guard
  const isEditorFocused = useCallback(() => {
    try {
      const quill = getQuillSafely();
      if (!quill) return false;
      
      const selection = quill.getSelection();
      return selection !== null && document.activeElement?.closest('.ql-editor') !== null;
    } catch (error) {
      console.warn('🚨 RichTextEditor - error checking focus:', error);
      return false;
    }
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

  // FASE 2: Handler para mudanças COM proteção
  const handleChange = useCallback((content: string) => {
    try {
      // Só processar se o editor está visível
      if (!isEditorVisible()) {
        console.log('🚫 RichTextEditor - change blocked: editor not visible');
        return;
      }
      
      // Verificar se o conteúdo realmente mudou
      if (content !== safeValue) {
        console.log('📝 RichTextEditor - content changed, propagating');
        onChange(content || '');
        setHasError(false);
      }
    } catch (error) {
      console.error('🚨 RichTextEditor - error in handleChange:', error);
      setHasError(true);
    }
  }, [onChange, safeValue, isEditorVisible]);
  
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

  // FASE 2: Focus/Blur handlers COM guards
  const handleFocus = useCallback(() => {
    try {
      if (isEditorVisible()) {
        console.log('👁️ RichTextEditor - focused');
        setHasError(false);
      }
    } catch (error) {
      console.warn('🚨 RichTextEditor - error on focus:', error);
    }
  }, [isEditorVisible]);

  const handleBlur = useCallback(() => {
    try {
      console.log('👋 RichTextEditor - blurred');
    } catch (error) {
      console.warn('🚨 RichTextEditor - error on blur:', error);
    }
  }, []);

  // FASE 3: Container com opacity ao invés de invisible/absolute
  const containerClass = cn(
    "prose-editor min-h-[400px]", // Altura mínima fixa para reduzir CLS
    className
  );
  
  const containerStyle = {
    opacity: isVisible ? 1 : 0,
    pointerEvents: isVisible ? 'auto' : 'none',
    transition: 'opacity 0.2s ease-in-out'
  } as React.CSSProperties;

  // Loading state
  if (!isMounted || !isReady) {
    return (
      <div className={containerClass} style={containerStyle} ref={containerRef}>
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
      <div className={containerClass} style={containerStyle} ref={containerRef}>
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
    isReady, 
    isVisible,
    isEditorVisible: isEditorVisible()
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
      <div className={containerClass} style={containerStyle} ref={containerRef}>
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