import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseAutoSaveOptions {
  data: any;
  onSave: (data: any) => Promise<void>;
  delay?: number;
  enabled?: boolean;
}

export const useAutoSave = ({ 
  data, 
  onSave, 
  delay = 30000, // 30 segundos
  enabled = true 
}: UseAutoSaveOptions) => {
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedRef = useRef<string>();

  useEffect(() => {
    if (!enabled) return;

    const currentData = JSON.stringify(data);
    
    // Se os dados não mudaram, não faz nada
    if (currentData === lastSavedRef.current) return;

    // Limpa o timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Define um novo timeout
    timeoutRef.current = setTimeout(async () => {
      try {
        await onSave(data);
        lastSavedRef.current = currentData;
        toast({
          title: "Rascunho salvo",
          description: "Suas alterações foram salvas automaticamente.",
          duration: 2000,
        });
      } catch (error) {
        console.error('Erro no auto-save:', error);
        toast({
          title: "Erro ao salvar",
          description: "Não foi possível salvar automaticamente. Salve manualmente.",
          variant: "destructive",
          duration: 3000,
        });
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, onSave, delay, enabled, toast]);

  // Cleanup no desmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
};