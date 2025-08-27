import React, { useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import type { EditorProps } from './EditorFactory';

/**
 * Editor de fallback seguro - textarea simples
 * Converte HTML básico para texto e vice-versa
 */
export const PlainTextEditor: React.FC<EditorProps> = ({
  value,
  onChange,
  placeholder = "Escreva o conteúdo do artigo...",
  className,
  loading = false
}) => {
  const [textValue, setTextValue] = useState('');

  // Converter HTML para texto na inicialização
  useEffect(() => {
    if (value) {
      // Remove tags HTML básicas para exibir como texto
      const textContent = value
        .replace(/<[^>]*>/g, '') // Remove todas as tags
        .replace(/&nbsp;/g, ' ') // Converte &nbsp; para espaço
        .replace(/&amp;/g, '&') // Converte &amp; para &
        .replace(/&lt;/g, '<') // Converte &lt; para <
        .replace(/&gt;/g, '>') // Converte &gt; para >
        .trim();
      setTextValue(textContent);
    }
  }, [value]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setTextValue(newText);
    
    // Converte texto para HTML básico
    const htmlContent = newText
      .split('\n\n') // Divide por parágrafos
      .filter(para => para.trim()) // Remove parágrafos vazios
      .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`) // Converte quebras de linha
      .join('');
    
    onChange(htmlContent || '<p></p>');
  }, [onChange]);

  if (loading) {
    return (
      <div className="min-h-[520px] flex items-center justify-center border border-border rounded-md bg-muted/50">
        <div className="text-sm text-muted-foreground">Carregando editor...</div>
      </div>
    );
  }

  return (
    <div className={cn("plain-text-editor", className)}>
      <div className="mb-2 text-sm text-muted-foreground bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded border">
        ⚠️ Editor no modo de fallback (texto simples). Funcionalidades avançadas indisponíveis.
      </div>
      <Textarea
        value={textValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="min-h-[400px] resize-none font-mono text-sm"
        style={{ minHeight: '400px' }}
      />
    </div>
  );
};