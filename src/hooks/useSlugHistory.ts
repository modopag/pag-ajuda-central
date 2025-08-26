import { useState, useEffect } from 'react';
import { getDataAdapter } from '@/lib/data-adapter';
import { createSlugRedirect } from '@/utils/redirects';
import type { SlugHistoryEntry } from '@/types/admin';

interface UseSlugHistoryOptions {
  articleId: string;
  currentSlug: string;
}

export function useSlugHistory({ articleId, currentSlug }: UseSlugHistoryOptions) {
  const [history, setHistory] = useState<SlugHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (articleId && articleId !== 'new') {
      loadHistory();
    }
  }, [articleId]);

  const loadHistory = async () => {
    if (!articleId || articleId === 'new') return;
    
    setIsLoading(true);
    try {
      const adapter = await getDataAdapter();
      const slugHistory = await adapter.getSlugHistory(articleId);
      setHistory(slugHistory);
    } catch (error) {
      console.error('Error loading slug history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const recordSlugChange = async (oldSlug: string, newSlug: string) => {
    if (!articleId || articleId === 'new' || oldSlug === newSlug || !oldSlug || !newSlug) {
      return;
    }

    try {
      const adapter = await getDataAdapter();
      
      // Record the slug change
      const historyEntry: Omit<SlugHistoryEntry, 'id'> = {
        article_id: articleId,
        old_slug: oldSlug,
        new_slug: newSlug,
        changed_at: new Date().toISOString(),
        redirect_created: true
      };

      // Create the redirect
      await createSlugRedirect(oldSlug, newSlug);
      
      // Record in history
      await adapter.recordSlugChange(historyEntry);

      // Reload history to show the new entry
      await loadHistory();
    } catch (error) {
      console.error('Error recording slug change:', error);
      throw error;
    }
  };

  return {
    history,
    isLoading,
    recordSlugChange,
    refreshHistory: loadHistory
  };
}