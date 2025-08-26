import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SEOHelmet } from '@/components/SEO/SEOHelmet';
import { generateCategoryJsonLd, generateFAQJsonLd } from '@/utils/jsonLd';
import { getDataAdapter } from '@/lib/data-adapter';
import { useSearchWithFilters } from '@/hooks/useSearchWithFilters';
import { useArticleTags } from '@/hooks/useArticleTags';
import type { Article, Category as CategoryType, Tag } from '@/types/admin';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Filter, Clock, User, MessageSquare, Home, ChevronRight, X } from 'lucide-react';
import { trackWhatsAppCTA } from '@/utils/analytics';

const ARTICLES_PER_PAGE = 12;

export default function Category() {
  const { slug } = useParams(); // Changed from categoryId to slug
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [category, setCategory] = useState<CategoryType | null>(null);
  const [isLoadingCategory, setIsLoadingCategory] = useState(true);
  
  // Get filters from URL
  const currentPage = parseInt(searchParams.get('page') || '1');
  const selectedTagIds = searchParams.get('tags')?.split(',').filter(Boolean) || [];
  const selectedType = searchParams.get('type') || '';
  const searchQuery = searchParams.get('q') || '';

  // Use the new search hook
  const searchResults = useSearchWithFilters({
    query: searchQuery,
    categoryId: category?.id,
    tagIds: selectedTagIds,
    articleType: selectedType,
    page: currentPage
  }, {
    itemsPerPage: ARTICLES_PER_PAGE
  });

  const { allTags } = useArticleTags({ includeAll: true });

  const totalPages = Math.ceil(searchResults.filteredCount / ARTICLES_PER_PAGE);

  // Load category data by slug
  useEffect(() => {
    const loadCategoryData = async () => {
      if (!slug) return;
      
      setIsLoadingCategory(true);
      try {
        const adapter = await getDataAdapter();
        
        // Find category by slug
        const categories = await adapter.getCategories();
        const categoryData = categories.find(cat => cat.slug === slug && cat.is_active);
        
        if (!categoryData) {
          setCategory(null);
          setIsLoadingCategory(false);
          return;
        }
        
        setCategory(categoryData);
      } catch (error) {
        console.error('Erro ao carregar categoria:', error);
      } finally {
        setIsLoadingCategory(false);
      }
    };

    loadCategoryData();
  }, [slug]);

  const updateSearchParams = (key: string, value: string | string[]) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (Array.isArray(value)) {
      if (value.length > 0) {
        newParams.set(key, value.join(','));
      } else {
        newParams.delete(key);
      }
    } else if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    
    newParams.delete('page'); // Reset page when filtering
    setSearchParams(newParams);
  };

  const handleTagToggle = (tagId: string) => {
    const currentTags = selectedTagIds.slice();
    const tagIndex = currentTags.indexOf(tagId);
    
    if (tagIndex > -1) {
      currentTags.splice(tagIndex, 1);
    } else {
      currentTags.push(tagId);
    }
    
    updateSearchParams('tags', currentTags);
  };

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
    
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = searchQuery || selectedTagIds.length > 0 || selectedType;

  if (isLoadingCategory) {
    return (
      <>
        <SEOHelmet 
          title="Carregando... | modoPAG - Central de Ajuda"
          description="Carregando categoria da Central de Ajuda modoPAG"
        />
        <div className="min-h-screen bg-background">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <div className="space-y-6">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
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
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  if (!category) {
    return (
      <>
        <SEOHelmet 
          title="Categoria não encontrada | modoPAG - Central de Ajuda"
          description="A categoria solicitada não foi encontrada na Central de Ajuda modoPAG"
          noindex={true}
        />
        <div className="min-h-screen bg-background">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-2xl font-bold mb-4">Categoria não encontrada</h1>
              <p className="text-muted-foreground mb-6">
                A categoria que você está procurando não existe ou foi removida.
              </p>
              
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Precisa de ajuda?</p>
                <Button 
                  onClick={() => window.open('https://wa.me/5571981470573?text=Vim%20da%20Central%20de%20Ajuda%20e%20preciso%20de%20suporte', '_blank')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Falar no WhatsApp
                </Button>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  // JSON-LD para FAQs ou CollectionPage
  const isFAQCategory = category.name.toLowerCase().includes('faq') || 
                       searchResults.articles.some(art => art.type === 'artigo');
  
  let jsonLd;
  if (isFAQCategory) {
    const faqs = searchResults.articles
      .filter(art => art.type === 'artigo')
      .slice(0, 10)
      .map(art => ({
        question: art.title,
        answer: art.meta_description || art.content.replace(/<[^>]*>/g, '').slice(0, 200)
      }));
    jsonLd = generateFAQJsonLd(faqs);
  } else {
    jsonLd = generateCategoryJsonLd(category, searchResults.articles);
  }

  return (
    <>
      <SEOHelmet
        title={`${category.name} | modoPAG - Central de Ajuda`}
        description={category.description}
        canonicalUrl={`https://ajuda.modopag.com.br/category/${category.slug}`}
        jsonLd={jsonLd}
      />
      
      <div className="min-h-screen bg-background">
        <Header />
        
        {/* Breadcrumbs */}
        <div className="py-4 px-4 border-b border-border">
          <div className="container mx-auto">
            <nav className="flex items-center space-x-2 text-sm">
              <Home className="w-4 h-4" />
              <Link to="/" className="text-muted-foreground hover:text-accent transition-colors">
                Central de Ajuda
              </Link>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground font-medium">{category.name}</span>
            </nav>
          </div>
        </div>
        
        <main className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {category.name}
            </h1>
            <p className="text-xl text-muted-foreground mb-2">
              {category.description}
            </p>
            <p className="text-sm text-muted-foreground">
              {searchResults.filteredCount} {searchResults.filteredCount === 1 ? 'artigo encontrado' : 'artigos encontrados'}
            </p>
          </div>

          {/* Filtros */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Buscar</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar artigos..."
                      value={searchQuery}
                      onChange={(e) => updateSearchParams('q', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tags</label>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {allTags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant={selectedTagIds.includes(tag.id) ? "default" : "outline"}
                        className="cursor-pointer transition-colors"
                        onClick={() => handleTagToggle(tag.id)}
                      >
                        {tag.name}
                        {selectedTagIds.includes(tag.id) && (
                          <X className="w-3 h-3 ml-1" />
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo</label>
                  <Select value={selectedType} onValueChange={(value) => updateSearchParams('type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos os tipos</SelectItem>
                      <SelectItem value="artigo">Artigo</SelectItem>
                      <SelectItem value="tutorial">Tutorial</SelectItem>
                      <SelectItem value="aviso">Aviso</SelectItem>
                      <SelectItem value="atualização">Atualização</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={clearAllFilters}
                    className="w-full"
                    disabled={!hasActiveFilters}
                  >
                    Limpar Filtros
                    {hasActiveFilters && (
                      <X className="w-3 h-3 ml-1" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Active Filters Display */}
              {hasActiveFilters && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-medium mb-2">Filtros ativos:</p>
                  <div className="flex flex-wrap gap-2">
                    {searchQuery && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        Busca: "{searchQuery}"
                        <X 
                          className="w-3 h-3 cursor-pointer" 
                          onClick={() => updateSearchParams('q', '')}
                        />
                      </Badge>
                    )}
                    {selectedTagIds.map(tagId => {
                      const tag = allTags.find(t => t.id === tagId);
                      return tag ? (
                        <Badge key={tagId} variant="secondary" className="flex items-center gap-1">
                          Tag: {tag.name}
                          <X 
                            className="w-3 h-3 cursor-pointer" 
                            onClick={() => handleTagToggle(tagId)}
                          />
                        </Badge>
                      ) : null;
                    })}
                    {selectedType && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        Tipo: {selectedType}
                        <X 
                          className="w-3 h-3 cursor-pointer" 
                          onClick={() => updateSearchParams('type', '')}
                        />
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lista de Artigos */}
          {searchResults.isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {Array.from({ length: ARTICLES_PER_PAGE }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-16 mb-2"></div>
                    <div className="h-6 bg-muted rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded"></div>
                      <div className="h-4 bg-muted rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : searchResults.articles.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {searchResults.articles.map((article) => (
                  <Card key={article.id} className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{article.type}</Badge>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="w-3 h-3 mr-1" />
                          {article.reading_time_minutes} min
                        </div>
                      </div>
                      <CardTitle className="line-clamp-2">
                        <Link 
                          to={`/article/${article.slug}`}
                          className="hover:text-primary transition-colors"
                        >
                          {article.title}
                        </Link>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="line-clamp-3 mb-4">
                        {article.meta_description || 
                         article.content.replace(/<[^>]*>/g, '').slice(0, 150) + '...'}
                      </CardDescription>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <User className="w-3 h-3 mr-1" />
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
                ))}
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
                  Nenhum artigo encontrado
                </h3>
                <p className="text-muted-foreground mb-8">
                  {searchQuery || selectedTagIds.length > 0 || selectedType 
                    ? 'Tente ajustar os filtros para encontrar o que procura.'
                    : 'Esta categoria ainda não possui artigos publicados.'}
                </p>
                
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Precisa de ajuda?</p>
                  <Button 
                    onClick={() => {
                      trackWhatsAppCTA('category_empty', `${category.name} - ${searchQuery || 'sem filtros'}`);
                      window.open('https://wa.me/5571981470573?text=Vim%20da%20Central%20de%20Ajuda%20e%20preciso%20de%20suporte%20na%20categoria%20' + encodeURIComponent(category.name), '_blank');
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
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