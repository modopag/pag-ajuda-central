import { useState, useEffect, useMemo } from 'react';
import { useDebounce } from './useDebounce';
import { getDataAdapter } from '@/lib/data-adapter';
import type { Article, Tag, Category } from '@/types/admin';

interface SearchFilters {
  query: string;
  categoryId?: string;
  tagIds?: string[];
  articleType?: string;
  page?: number;
}

interface SearchResult {
  articles: Article[];
  totalCount: number;
  filteredCount: number;
  isLoading: boolean;
  categories: Category[];
  tags: Tag[];
  hasMore: boolean;
}

interface UseSearchWithFiltersOptions {
  itemsPerPage?: number;
  debounceMs?: number;
}

export function useSearchWithFilters(
  filters: SearchFilters,
  options: UseSearchWithFiltersOptions = {}
) {
  const { itemsPerPage = 12, debounceMs = 300 } = options;
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const debouncedQuery = useDebounce(filters.query, debounceMs);

  // Load categories and tags once
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const adapter = await getDataAdapter();
        const [categoriesData, tagsData] = await Promise.all([
          adapter.getCategories(),
          adapter.getTags()
        ]);
        
        setCategories(categoriesData.filter(cat => cat.is_active));
        setTags(tagsData);
      } catch (error) {
        console.error('Error loading metadata:', error);
      }
    };

    loadMetadata();
  }, []);

  // Search with filters
  useEffect(() => {
    const searchArticles = async () => {
      setIsLoading(true);
      try {
        const adapter = await getDataAdapter();
        
        // Start with published articles
        let searchArticles = await adapter.getArticles({ status: 'published' });
        setTotalCount(searchArticles.length);

        // Apply category filter
        if (filters.categoryId) {
          searchArticles = searchArticles.filter(
            article => article.category_id === filters.categoryId
          );
        }

        // Apply type filter
        if (filters.articleType) {
          searchArticles = searchArticles.filter(
            article => article.type === filters.articleType
          );
        }

        // Apply tag filters
        if (filters.tagIds && filters.tagIds.length > 0) {
          const articlesWithTags = await Promise.all(
            searchArticles.map(async (article) => {
              const articleTags = await adapter.getArticleTags(article.id);
              const hasMatchingTag = articleTags.some(tag => 
                filters.tagIds!.includes(tag.id)
              );
              return hasMatchingTag ? article : null;
            })
          );
          
          searchArticles = articlesWithTags.filter(Boolean) as Article[];
        }

        // Apply text search
        if (debouncedQuery.trim()) {
          const query = debouncedQuery.toLowerCase();
          
          const searchResults = await Promise.all(
            searchArticles.map(async (article) => {
              let score = 0;
              
              // Title match (highest priority)
              if (article.title.toLowerCase().includes(query)) {
                score += 10;
              }
              
              // Meta description match
              if (article.meta_description?.toLowerCase().includes(query)) {
                score += 5;
              }
              
              // Content match
              if (article.content.toLowerCase().includes(query)) {
                score += 3;
              }
              
              // Tag match
              const articleTags = await adapter.getArticleTags(article.id);
              const tagMatch = articleTags.some(tag => 
                tag.name.toLowerCase().includes(query)
              );
              if (tagMatch) {
                score += 7;
              }

              return score > 0 ? { article, score } : null;
            })
          );
          
          const validResults = searchResults.filter(Boolean) as { article: Article; score: number }[];
          searchArticles = validResults
            .sort((a, b) => b.score - a.score)
            .map(result => result.article);
        }

        // Sort by relevance and date
        searchArticles.sort((a, b) => {
          // If we have a query, articles are already sorted by relevance
          if (debouncedQuery.trim()) return 0;
          
          // Otherwise, sort by date (newest first)
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        });

        setArticles(searchArticles);
      } catch (error) {
        console.error('Error searching articles:', error);
        setArticles([]);
      } finally {
        setIsLoading(false);
      }
    };

    searchArticles();
  }, [debouncedQuery, filters.categoryId, filters.tagIds, filters.articleType]);

  // Paginated results
  const paginatedResults = useMemo(() => {
    const page = filters.page || 1;
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    return {
      articles: articles.slice(startIndex, endIndex),
      totalCount: totalCount,
      filteredCount: articles.length,
      hasMore: endIndex < articles.length,
      isLoading,
      categories,
      tags
    };
  }, [articles, filters.page, itemsPerPage, totalCount, isLoading, categories, tags]);

  return paginatedResults;
}
