import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseAutoSaveOptions {
  data: any;
  onSave: (data: any) => Promise<void>;
  delay?: number;
  enabled?: boolean;
}

/**
 * FASE 3: Auto-save otimizado com debounce robusto e delay aumentado
 * Reduz re-renders e melhora performance
 */
export const useAutoSave = ({ 
  data, 
  onSave, 
  delay = 45000, // FASE 3: Aumentado de 30s para 45s (menos re-renders)
  enabled = true 
}: UseAutoSaveOptions) => {
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedRef = useRef<string>();
  const lastSaveAttemptRef = useRef<number>(0);
  const isSavingRef = useRef<boolean>(false);

  useEffect(() => {
    if (!enabled || isSavingRef.current) return;

    const currentData = JSON.stringify(data);
    const now = Date.now();
    
    // FASE 3: Debounce robusto - evitar saves muito frequentes
    if (now - lastSaveAttemptRef.current < 5000) { // Mínimo 5s entre tentativas
      console.log('🚫 useAutoSave - debounced: too soon since last attempt');
      return;
    }
    
    // Se os dados não mudaram, não faz nada
    if (currentData === lastSavedRef.current) return;

    // Limpa o timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    console.log('⏰ useAutoSave - scheduling save in', delay, 'ms');

    // Define um novo timeout
    timeoutRef.current = setTimeout(async () => {
      try {
        // Dupla verificação antes de salvar
        if (currentData === lastSavedRef.current) {
          console.log('🚫 useAutoSave - cancelled: data unchanged at save time');
          return;
        }

        isSavingRef.current = true;
        lastSaveAttemptRef.current = Date.now();
        
        console.log('💾 useAutoSave - saving data...');
        await onSave(data);
        
        lastSavedRef.current = currentData;
        console.log('✅ useAutoSave - save successful');
        
        toast({
          title: "💾 Rascunho salvo",
          description: "Suas alterações foram salvas automaticamente.",
          duration: 2000,
        });
      } catch (error) {
        console.error('🚨 useAutoSave - save error (not blocking UI):', error);
        
        toast({
          title: "⚠️ Erro ao salvar",
          description: "Não foi possível salvar automaticamente. Salve manualmente.",
          variant: "destructive",
          duration: 3000,
        });
      } finally {
        isSavingRef.current = false;
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
      isSavingRef.current = false;
    };
  }, []);
};