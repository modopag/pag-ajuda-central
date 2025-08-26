import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
}

const SearchBar = ({ onSearch, placeholder = "Pesquisar" }: SearchBarProps) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="search-bar pl-14 pr-20"
          />
          <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-muted-foreground" />
          <Button 
            type="submit"
            variant="default"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-accent text-accent-foreground hover:bg-accent/90 px-6"
          >
            Buscar
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;