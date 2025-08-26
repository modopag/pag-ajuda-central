import { useState, useMemo } from 'react';
import type { Article } from '@/types/admin';

interface UseSimpleSearchProps {
  articles: Article[];
  searchFields: (keyof Article)[];
}

interface UseSimpleSearchResult {
  filteredArticles: Article[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
}

export const useSimpleSearch = ({ 
  articles, 
  searchFields 
}: UseSimpleSearchProps): UseSimpleSearchResult => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('relevance');

  const filteredArticles = useMemo(() => {
    let filtered = articles;

    // Apply search filter
    if (searchTerm.trim()) {
      const lowercaseSearch = searchTerm.toLowerCase();
      filtered = articles.filter(article => 
        searchFields.some(field => {
          const value = article[field];
          return typeof value === 'string' && 
                 value.toLowerCase().includes(lowercaseSearch);
        })
      );
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        case 'oldest':
          return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'relevance':
        default:
          // If search term exists, sort by relevance (title matches first)
          if (searchTerm.trim()) {
            const aScore = a.title.toLowerCase().includes(searchTerm.toLowerCase()) ? 1 : 0;
            const bScore = b.title.toLowerCase().includes(searchTerm.toLowerCase()) ? 1 : 0;
            if (aScore !== bScore) return bScore - aScore;
          }
          // Otherwise sort by view count descending
          return b.view_count - a.view_count;
      }
    });

    return filtered;
  }, [articles, searchTerm, sortBy, searchFields]);

  return {
    filteredArticles,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
  };
};
