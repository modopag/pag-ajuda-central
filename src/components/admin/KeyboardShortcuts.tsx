import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface KeyboardShortcutsProps {
  onSave: () => void;
  onSaveAndReview?: () => void;
  onPreview?: () => void;
  disabled?: boolean;
}

export function KeyboardShortcuts({ 
  onSave, 
  onSaveAndReview, 
  onPreview, 
  disabled = false 
}: KeyboardShortcutsProps) {
  const { toast } = useToast();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore shortcuts when disabled or when typing in inputs
      if (disabled || event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Ctrl/Cmd + S: Save
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        onSave();
        toast({
          title: "Salvando...",
          description: "Ctrl+S para salvar rascunho",
          duration: 1000
        });
        return;
      }

      // Ctrl/Cmd + Shift + S: Save and send for review
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'S') {
        event.preventDefault();
        if (onSaveAndReview) {
          onSaveAndReview();
          toast({
            title: "Enviando para revisão...",
            description: "Ctrl+Shift+S para enviar para revisão",
            duration: 1000
          });
        }
        return;
      }

      // Ctrl/Cmd + P: Preview
      if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
        event.preventDefault();
        if (onPreview) {
          onPreview();
          toast({
            title: "Abrindo preview...",
            description: "Ctrl+P para preview",
            duration: 1000
          });
        }
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onSave, onSaveAndReview, onPreview, disabled, toast]);

  // Show shortcuts help on first load
  useEffect(() => {
    const hasSeenShortcuts = localStorage.getItem('editor-shortcuts-seen');
    if (!hasSeenShortcuts) {
      setTimeout(() => {
        toast({
          title: "Atalhos do teclado",
          description: "Ctrl+S: Salvar | Ctrl+Shift+S: Enviar para revisão | Ctrl+P: Preview",
          duration: 5000
        });
        localStorage.setItem('editor-shortcuts-seen', 'true');
      }, 2000);
    }
  }, [toast]);

  return null; // This component only handles keyboard events
}