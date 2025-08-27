import React, { useCallback, useEffect, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Link as LinkIcon, 
  Image as ImageIcon,
  Undo,
  Redo
} from 'lucide-react';
import type { EditorProps } from './EditorFactory';

/**
 * Editor TipTap - Estável em React 18/StrictMode
 * Gera HTML compatível com o frontend atual
 */
export const TipTapEditor: React.FC<EditorProps> = ({
  value,
  onChange,
  placeholder = "Escreva o conteúdo do artigo...",
  className,
  onImageUpload,
  loading = false
}) => {
  const extensions = useMemo(() => [
    StarterKit,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        target: '_blank',
        rel: 'noopener noreferrer',
      },
    }),
    Image.configure({
      HTMLAttributes: {
        class: 'max-w-full h-auto rounded-md',
      },
    }),
    Placeholder.configure({
      placeholder,
    }),
  ], [placeholder]);

  const editor = useEditor({
    extensions,
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      console.log('📝 TipTapEditor - content changed:', html.slice(0, 100) + '...');
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4',
      },
    },
  });

  // Sincronizar valor externo
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      console.log('📥 TipTapEditor - syncing external value change');
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  const handleImageUpload = useCallback(() => {
    if (!editor || !onImageUpload) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          console.log('⬆️ TipTapEditor - uploading image:', file.name);
          const imageUrl = await onImageUpload(file, `Imagem inserida em ${new Date().toLocaleString()}`);
          editor.chain().focus().setImage({ src: imageUrl }).run();
        } catch (error) {
          console.error('🚨 TipTapEditor - error uploading image:', error);
        }
      }
    };
    input.click();
  }, [editor, onImageUpload]);

  const addLink = useCallback(() => {
    if (!editor) return;
    
    const url = prompt('Digite a URL do link:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  if (loading) {
    return (
      <div className="min-h-[520px] flex items-center justify-center border border-border rounded-md bg-muted/50">
        <div className="text-sm text-muted-foreground">Carregando editor...</div>
      </div>
    );
  }

  if (!editor) {
    return (
      <div className="min-h-[520px] flex items-center justify-center border border-border rounded-md bg-muted/50">
        <div className="text-sm text-muted-foreground">Inicializando editor...</div>
      </div>
    );
  }

  return (
    <div className={cn("tiptap-editor border border-border rounded-md", className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-border bg-muted/50">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-muted' : ''}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-muted' : ''}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-muted' : ''}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-muted' : ''}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addLink}
          className={editor.isActive('link') ? 'bg-muted' : ''}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        {onImageUpload && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleImageUpload}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
        )}
        <div className="ml-auto flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Editor Content */}
      <EditorContent 
        editor={editor} 
        className="min-h-[400px] [&_.ProseMirror]:min-h-[400px] [&_.ProseMirror]:outline-none [&_.ProseMirror]:p-4"
      />
    </div>
  );
};