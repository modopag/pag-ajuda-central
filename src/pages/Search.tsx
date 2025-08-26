import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SEOHelmet } from '@/components/SEO/SEOHelmet';
import { getDataAdapter } from '@/lib/data-adapter';
import type { Article, Category, Tag } from '@/types/admin';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { Search as SearchIcon, Filter, Clock, User, MessageSquare, Home, ChevronRight } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

const ARTICLES_PER_PAGE = 12;

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [suggestions, setSuggestions] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Parâmetros da URL
  const query = searchParams.get('q') || '';
  const selectedCategory = searchParams.get('category') || '';
  const selectedTag = searchParams.get('tag') || '';
  const selectedType = searchParams.get('type') || '';
  const currentPage = parseInt(searchParams.get('page') || '1');
  
  // Debounce para busca
  const debouncedQuery = useDebounce(query, 300);
  
  const totalPages = Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE);
  const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
  const currentArticles = filteredArticles.slice(startIndex, startIndex + ARTICLES_PER_PAGE);

  // Carregar dados iniciais
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const adapter = await getDataAdapter();
        const [articlesData, categoriesData, tagsData] = await Promise.all([
          adapter.getArticles({ status: 'published' }),
          adapter.getCategories(),
          adapter.getTags()
        ]);
        
        setArticles(articlesData);
        setCategories(categoriesData.filter(cat => cat.is_active));
        setTags(tagsData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Aplicar filtros quando parâmetros mudarem
  useEffect(() => {
    let filtered = articles;

    // Filtro por busca
    if (debouncedQuery.trim()) {
      const searchTerm = debouncedQuery.toLowerCase();
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchTerm) ||
        article.content.toLowerCase().includes(searchTerm) ||
        article.meta_description?.toLowerCase().includes(searchTerm)
      );
      
      // Track FAQ search event
      import('@/utils/analytics').then(({ trackFAQSearch }) => {
        trackFAQSearch(debouncedQuery, filtered.length);
      });
    }

    // Filtro por categoria
    if (selectedCategory) {
      filtered = filtered.filter(article => article.category_id === selectedCategory);
    }

    // Filtro por tag
    if (selectedTag) {
      // Aqui seria necessário implementar a relação article-tags no adapter
      // Por enquanto, simulamos
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(selectedTag.toLowerCase())
      );
    }

    // Filtro por tipo
    if (selectedType) {
      filtered = filtered.filter(article => article.type === selectedType);
    }

    setFilteredArticles(filtered);
  }, [articles, debouncedQuery, selectedCategory, selectedTag, selectedType]);

  // Gerar sugestões de autocomplete
  const handleQueryChange = (newQuery: string) => {
    updateSearchParams('q', newQuery);
    
    if (newQuery.trim().length >= 2) {
      const searchTerm = newQuery.toLowerCase();
      const articleSuggestions = articles
        .filter(article => 
          article.title.toLowerCase().includes(searchTerm)
        )
        .slice(0, 6);
      
      setSuggestions(articleSuggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const updateSearchParams = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.delete('page'); // Reset page when filtering
    setSearchParams(newParams);
  };

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
  };

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    
    const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
  };

  const handleSuggestionClick = (article: Article) => {
    setShowSuggestions(false);
    updateSearchParams('q', article.title);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    // A busca já é feita automaticamente via useEffect
  };

  // SEO dinâmico
  const pageTitle = query 
    ? `Resultados para "${query}" | modoPAG - Central de Ajuda`
    : 'Buscar | modoPAG - Central de Ajuda';
  
  const pageDescription = query
    ? `${filteredArticles.length} resultados encontrados para "${query}" na Central de Ajuda modoPAG`
    : 'Busque por artigos, tutoriais e FAQs na Central de Ajuda modoPAG';

  return (
    <>
      <SEOHelmet
        title={pageTitle}
        description={pageDescription}
        canonicalUrl="https://ajuda.modopag.com.br/buscar"
        noindex={!query} // Indexar apenas se houver busca
      />
      
      <div className="min-h-screen bg-background">
        <Header />
        
        {/* Breadcrumbs */}
        <div className="py-4 px-4 border-b border-border">
          <div className="container mx-auto">
            <nav className="flex items-center space-x-2 text-sm" aria-label="Breadcrumb">
              <Home className="w-4 h-4" aria-hidden="true" />
              <Link to="/" className="text-muted-foreground hover:text-accent transition-colors">
                Central de Ajuda
              </Link>
              <ChevronRight className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <span className="text-foreground font-medium" aria-current="page">
                {query ? `Resultados para "${query}"` : 'Buscar'}
              </span>
            </nav>
          </div>
        </div>
        
        <main className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {query ? `Resultados para "${query}"` : 'Buscar na Central de Ajuda'}
            </h1>
            {query && (
              <p className="text-sm text-muted-foreground">
                {filteredArticles.length} {filteredArticles.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
              </p>
            )}
          </div>

          {/* Busca e Filtros */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SearchIcon className="w-4 h-4" />
                Busca e Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Campo de Busca com Autocomplete */}
                <div className="relative">
                  <form onSubmit={handleSearchSubmit}>
                    <div className="relative">
                      <SearchIcon className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Digite sua busca..."
                        value={query}
                        onChange={(e) => handleQueryChange(e.target.value)}
                        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        className="pl-10 pr-4"
                      />
                    </div>
                  </form>
                  
                  {/* Sugestões de Autocomplete */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-background border border-border rounded-md shadow-lg z-50 mt-1" role="listbox">
                      {suggestions.map((article) => (
            <button
              key={article.id}
              onClick={() => handleSuggestionClick(article)}
              className="w-full px-4 py-3 text-left hover:bg-muted transition-colors border-b border-border last:border-b-0"
              role="option"
              aria-label={`Ir para artigo: ${article.title}`}
            >
                          <div className="font-medium text-sm line-clamp-1">
                            {article.title}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {categories.find(cat => cat.id === article.category_id)?.name}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Filtros */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Categoria</label>
                    <Select value={selectedCategory} onValueChange={(value) => updateSearchParams('category', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas as categorias" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todas as categorias</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tag</label>
                    <Select value={selectedTag} onValueChange={(value) => updateSearchParams('tag', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas as tags" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todas as tags</SelectItem>
                        {tags.map((tag) => (
                          <SelectItem key={tag.id} value={tag.slug}>
                            {tag.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tipo</label>
                    <Select value={selectedType} onValueChange={(value) => updateSearchParams('type', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os tipos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos os tipos</SelectItem>
                        <SelectItem value="faq">FAQ</SelectItem>
                        <SelectItem value="guide">Guia</SelectItem>
                        <SelectItem value="tutorial">Tutorial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchParams(new URLSearchParams());
                        setSuggestions([]);
                        setShowSuggestions(false);
                      }}
                      className="w-full"
                    >
                      Limpar Filtros
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resultados */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : currentArticles.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {currentArticles.map((article) => {
                  const categoryName = categories.find(cat => cat.id === article.category_id)?.name || 'Sem categoria';
                  
                  return (
                    <Card key={article.id} className="h-full hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline">{article.type}</Badge>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="w-3 h-3 mr-1" aria-hidden="true" />
                            {article.reading_time_minutes} min
                          </div>
                        </div>
                        <CardTitle className="line-clamp-2">
                          <Link 
                            to={`/article/${article.slug}`}
                            className="hover:text-primary transition-colors"
                            dangerouslySetInnerHTML={{
                              __html: highlightText(article.title, query)
                            }}
                          />
                        </CardTitle>
                        <div className="text-xs text-muted-foreground">
                          {categoryName}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription 
                          className="line-clamp-3 mb-4"
                          dangerouslySetInnerHTML={{
                            __html: highlightText(
                              article.meta_description || 
                              article.content.replace(/<[^>]*>/g, '').slice(0, 150) + '...',
                              query
                            )
                          }}
                        />
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center">
                            <User className="w-3 h-3 mr-1" aria-hidden="true" />
                            {article.author}
                          </div>
                          {article.published_at && (
                            <span>
                              {new Date(article.published_at).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Paginação */}
              {totalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                        className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          isActive={page === currentPage}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                        className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          ) : (
            // Empty State
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  {query ? 'Nenhum resultado encontrado' : 'Comece sua busca'}
                </h3>
                <p className="text-muted-foreground mb-8">
                  {query 
                    ? `Não encontramos resultados para "${query}". Tente usar termos diferentes ou mais específicos.`
                    : 'Digite um termo na caixa de busca acima para encontrar artigos, tutoriais e FAQs.'}
                </p>
                
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Precisa de ajuda?</p>
                  <Button 
                    onClick={() => {
                      import('@/utils/analytics').then(({ trackWhatsAppCTA }) => {
                        trackWhatsAppCTA('search_empty', query || 'no_query');
                      });
                      window.open('https://wa.me/5571981470573?text=Vim%20da%20Central%20de%20Ajuda%20e%20preciso%20de%20suporte%20com%20busca', '_blank');
                    }}
                    className="bg-green-600 hover:bg-green-700"
                    aria-label="Abrir WhatsApp para suporte"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" aria-hidden="true" />
                    Falar no WhatsApp
                  </Button>
                </div>
              </div>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
}