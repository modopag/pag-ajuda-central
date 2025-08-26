import { useState, useEffect } from 'react';
import { getDataAdapter } from '@/lib/data-adapter';
import type { Tag } from '@/types/admin';

interface UseArticleTagsOptions {
  articleId?: string;
  includeAll?: boolean;
}

export function useArticleTags({ articleId, includeAll = false }: UseArticleTagsOptions = {}) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTags = async () => {
      setIsLoading(true);
      try {
        const adapter = await getDataAdapter();
        
        // Load all tags if requested
        if (includeAll) {
          const allTagsData = await adapter.getTags();
          setAllTags(allTagsData);
        }

        // Load article-specific tags if articleId is provided
        if (articleId) {
          const articleTags = await adapter.getArticleTags(articleId);
          setTags(articleTags);
        } else {
          setTags([]);
        }
      } catch (error) {
        console.error('Error loading tags:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTags();
  }, [articleId, includeAll]);

  const getTagsByIds = (tagIds: string[]): Tag[] => {
    return allTags.filter(tag => tagIds.includes(tag.id));
  };

  const getSharedTags = (articleId1: string, articleId2: string): Promise<Tag[]> => {
    return new Promise(async (resolve, reject) => {
      try {
        const adapter = await getDataAdapter();
        const [tags1, tags2] = await Promise.all([
          adapter.getArticleTags(articleId1),
          adapter.getArticleTags(articleId2)
        ]);

        const sharedTags = tags1.filter(tag1 => 
          tags2.some(tag2 => tag2.id === tag1.id)
        );

        resolve(sharedTags);
      } catch (error) {
        reject(error);
      }
    });
  };

  return {
    tags,
    allTags,
    isLoading,
    getTagsByIds,
    getSharedTags
  };
}