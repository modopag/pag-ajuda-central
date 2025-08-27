import React from 'react';
import { StableRichTextEditor } from './StableRichTextEditor';
import type { EditorProps } from './EditorFactory';

/**
 * Wrapper para o editor Quill legado
 * Mantém compatibilidade com o código anterior
 */
export const QuillEditor: React.FC<EditorProps> = (props) => {
  console.log('🪶 QuillEditor - rendering legacy Quill editor');
  
  return <StableRichTextEditor {...props} />;
};