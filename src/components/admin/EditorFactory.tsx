import React from 'react';
import { TipTapEditor } from './TipTapEditor';
import { QuillEditor } from './QuillEditor';
import { PlainTextEditor } from './PlainTextEditor';

export interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onImageUpload?: (file: File, altText?: string) => Promise<string>;
  loading?: boolean;
  articleId?: string;
}

/**
 * Factory de Editor com fallback configurável via VITE_EDITOR_ENGINE
 * - tiptap (default): Editor TipTap estável
 * - quill: ReactQuill legado
 * - textarea: Fallback seguro
 */
export const EditorFactory: React.FC<EditorProps> = (props) => {
  const engine = import.meta.env.VITE_EDITOR_ENGINE ?? 'tiptap';
  
  console.log('🏭 EditorFactory - using engine:', engine);
  
  switch (engine) {
    case 'quill':
      return <QuillEditor {...props} />;
    case 'textarea':
      return <PlainTextEditor {...props} />;
    case 'tiptap':
    default:
      return <TipTapEditor {...props} />;
  }
};