import React, { useState, useEffect, useCallback } from "react";
import { Search, X } from "lucide-react";
import { Button } from "./ui/button";
import { useDebounce } from "@/hooks/useDebounce";
import { trackFAQSearch } from "@/utils/analytics";

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
}

const SearchBar = ({ onSearch, placeholder = "Digite sua pesquisa..." }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Debounce search query to avoid excessive API calls
  const debouncedQuery = useDebounce(query, 300);

  // Mock suggestions - em produção, viriam de uma API
  const mockSuggestions = [
    "Como configurar minha maquininha?",
    "Taxas de cartão de crédito",
    "Problema com PIX",
    "Como sacar meu dinheiro?",
    "Maquininha não liga",
    "Cancelar transação",
    "Atualizar dados bancários",
    "Como funciona o antecipação?",
    "Resolver problemas de conexão",
    "Configurar Wi-Fi na maquininha",
    "Estorno de pagamento",
    "Alterar plano de taxas"
  ];

  const filterSuggestions = useCallback((searchQuery: string) => {
    if (searchQuery.length > 2) {
      const filtered = mockSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return filtered.slice(0, 6);
    }
    return [];
  }, []);

  useEffect(() => {
    const filtered = filterSuggestions(debouncedQuery);
    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0 && query.length > 2);
  }, [debouncedQuery, query, filterSuggestions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && onSearch) {
      // Track search analytics
      trackFAQSearch(query.trim(), suggestions.length);
      onSearch(query.trim());
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    if (onSearch) {
      // Track search analytics for suggestion clicks
      trackFAQSearch(suggestion, 1);
      onSearch(suggestion);
    }
    setShowSuggestions(false);
  };

  const clearSearch = () => {
    setQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto relative">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="search-bar pl-14 pr-32"
            onFocus={() => query.length > 2 && setShowSuggestions(true)}
          />
          <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-muted-foreground" />
          
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="p-1 hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
            <Button 
              type="submit"
              variant="default"
              className="bg-accent text-accent-foreground hover:bg-accent/90 px-6"
            >
              Buscar
            </Button>
          </div>
        </div>
      </form>
      
      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full text-left px-4 py-3 hover:bg-accent hover:text-accent-foreground transition-colors border-b border-border last:border-b-0 text-sm"
            >
              <Search className="w-4 h-4 inline mr-2 text-muted-foreground" />
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;