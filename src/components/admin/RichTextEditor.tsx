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

export const RichTextEditor = ({ 
  value, 
  onChange, 
  placeholder = "Escreva o conteúdo do artigo...",
  className,
  onImageUpload
}: RichTextEditorProps) => {
  const quillRef = useRef<ReactQuill>(null);
  const [isReady, setIsReady] = useState(false);
  
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

  // Log quando o componente monta
  useEffect(() => {
    console.log('RichTextEditor - component mounted with value:', safeValue);
    
    // Pequeno delay para garantir que o DOM está pronto
    const timer = setTimeout(() => {
      setIsReady(true);
      console.log('RichTextEditor - marked as ready');
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Handler para mudanças com verificação de segurança
  const handleChange = useCallback((content: string) => {
    console.log('RichTextEditor - handleChange called:', { content, safeValue });
    
    // Verificar se o conteúdo realmente mudou
    if (content !== safeValue) {
      console.log('RichTextEditor - content changed, calling onChange');
      onChange(content || '');
    }
  }, [onChange, safeValue]);
  
  const imageHandler = useCallback(() => {
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
          
          if (quill) {
            console.log('RichTextEditor - inserting image into editor');
            const range = quill.getSelection();
            quill.insertEmbed(range?.index || 0, 'image', imageUrl);
          } else {
            console.error('RichTextEditor - quill editor not available');
          }
        } catch (error) {
          console.error('RichTextEditor - error uploading image:', error);
        }
      }
    };
  }, [onImageUpload]);

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

  // Não renderizar até estar pronto
  if (!isReady) {
    console.log('RichTextEditor - not ready, showing loading');
    return (
      <div className={cn("prose-editor flex items-center justify-center h-96 border rounded-md", className)}>
        <div className="text-muted-foreground">Carregando editor...</div>
      </div>
    );
  }

  console.log('RichTextEditor - rendering ReactQuill with:', { safeValue, isReady });

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
          onFocus={() => console.log('RichTextEditor - focused')}
          onBlur={() => console.log('RichTextEditor - blurred')}
        />
      </div>
    </>
  );
};