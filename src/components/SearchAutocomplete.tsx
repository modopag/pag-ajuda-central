import { useState, useCallback, useRef, useEffect } from 'react';
import { Search, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { getDataAdapter } from '@/lib/data-adapter';
import { useDebounce } from '@/hooks/useDebounce';
import { trackFAQSearch } from '@/utils/analytics';
import { generateArticleUrl } from '@/utils/urlGenerator';
import type { Article, Category } from '@/types/admin';

interface SearchAutocompleteProps {
  placeholder?: string;
  showButton?: boolean;
  onSearch?: (query: string) => void;
  className?: string;
}

export function SearchAutocomplete({ 
  placeholder = "Pesquisar na central de ajuda...",
  showButton = true,
  onSearch,
  className = ""
}: SearchAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query.trim(), 300);

  // Fetch suggestions based on debounced query
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const fetchSuggestions = async () => {
      setIsLoading(true);
      try {
        const adapter = await getDataAdapter();
        
        // Load categories if not already loaded
        if (categories.length === 0) {
          const allCategories = await adapter.getCategories();
          setCategories(allCategories);
        }
        
        const articles = await adapter.getArticles({ 
          status: 'published',
          search: debouncedQuery 
        });
        
        // Limit to 6 suggestions, prioritize title matches
        const sortedArticles = articles
          .filter(article => 
            article.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
            article.content.toLowerCase().includes(debouncedQuery.toLowerCase())
          )
          .sort((a, b) => {
            const aTitle = a.title.toLowerCase().includes(debouncedQuery.toLowerCase());
            const bTitle = b.title.toLowerCase().includes(debouncedQuery.toLowerCase());
            if (aTitle && !bTitle) return -1;
            if (!aTitle && bTitle) return 1;
            return 0;
          })
          .slice(0, 6);

        setSuggestions(sortedArticles);
        setShowSuggestions(sortedArticles.length > 0);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery]);

  // Handle search submit
  const handleSearch = useCallback((searchQuery?: string) => {
    const searchTerm = searchQuery || query.trim();
    
    if (!searchTerm) return;

    // Track search analytics
    trackFAQSearch(searchTerm, suggestions.length);

    // Close suggestions
    setShowSuggestions(false);
    
    // Custom handler or navigate to search page
    if (onSearch) {
      onSearch(searchTerm);
    } else {
      navigate(`/buscar?q=${encodeURIComponent(searchTerm)}`);
    }
  }, [query, suggestions.length, onSearch, navigate, categories]);

  // Handle suggestion click
  const handleSuggestionClick = (article: Article) => {
    setShowSuggestions(false);
    setQuery('');
    const category = categories.find(c => c.id === article.category_id);
    if (category) {
      navigate(generateArticleUrl(category.slug, article.slug));
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Highlight search term in text
  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? 
        <mark key={index} className="bg-yellow-200 text-yellow-900 px-1 rounded">
          {part}
        </mark> : part
    );
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(suggestions.length > 0)}
            className="pl-10 pr-4"
            autoComplete="off"
          />
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            </div>
          )}
        </div>
        
        {showButton && (
          <Button 
            onClick={() => handleSearch()}
            disabled={!query.trim()}
            className="px-6"
          >
            Buscar
          </Button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <Card className="absolute z-50 w-full mt-1 max-h-96 overflow-y-auto shadow-lg">
          <div className="py-2">
            {suggestions.map((article, index) => (
              <button
                key={article.id}
                onClick={() => handleSuggestionClick(article)}
                className={`w-full text-left px-4 py-3 hover:bg-muted transition-colors border-b last:border-b-0 ${
                  selectedIndex === index ? 'bg-muted' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm line-clamp-1">
                      {highlightText(article.title, debouncedQuery)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {highlightText(
                        article.content.replace(/<[^>]*>/g, '').substring(0, 100) + '...',
                        debouncedQuery
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                        {article.type}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {article.reading_time_minutes} min de leitura
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}