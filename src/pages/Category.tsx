import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SEOHelmet } from '@/components/SEO/SEOHelmet';
import { generateCategoryJsonLd, generateFAQJsonLd } from '@/utils/jsonLd';
import { getDataAdapter } from '@/lib/data-adapter';
import type { Article, Category as CategoryType, Tag } from '@/types/admin';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Filter, Clock, User, MessageSquare, Home, ChevronRight } from 'lucide-react';

const ARTICLES_PER_PAGE = 12;

export default function Category() {
  const { categoryId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [category, setCategory] = useState<CategoryType | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Paginação e filtros
  const currentPage = parseInt(searchParams.get('page') || '1');
  const selectedTag = searchParams.get('tag') || '';
  const selectedType = searchParams.get('type') || '';
  const searchQuery = searchParams.get('q') || '';

  const totalPages = Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE);
  const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
  const currentArticles = filteredArticles.slice(startIndex, startIndex + ARTICLES_PER_PAGE);

  useEffect(() => {
    const loadCategoryData = async () => {
      if (!categoryId) return;
      
      setIsLoading(true);
      try {
        const adapter = await getDataAdapter();
        
        // Carregar categoria
        const categoryData = await adapter.getCategoryById(categoryId);
        if (!categoryData) {
          setCategory(null);
          setIsLoading(false);
          return;
        }
        
        setCategory(categoryData);
        
        // Carregar artigos da categoria (apenas publicados)
        const [categoryArticles, allTags] = await Promise.all([
          adapter.getArticles({ category_id: categoryId, status: 'published' }),
          adapter.getTags()
        ]);
        
        setArticles(categoryArticles);
        setTags(allTags);
        
        // Carregar artigos relacionados (outras categorias)
        const otherArticles = await adapter.getArticles({ status: 'published' });
        const related = otherArticles
          .filter(art => art.category_id !== categoryId)
          .slice(0, 3);
        setRelatedArticles(related);
        
      } catch (error) {
        console.error('Erro ao carregar categoria:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategoryData();
  }, [categoryId]);

  // Aplicar filtros
  useEffect(() => {
    let filtered = articles;

    // Filtro por busca
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(query) ||
        article.content.toLowerCase().includes(query)
      );
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
  }, [articles, searchQuery, selectedTag, selectedType]);

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

  if (isLoading) {
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
                       filteredArticles.some(art => art.type === 'faq');
  
  let jsonLd;
  if (isFAQCategory) {
    const faqs = filteredArticles
      .filter(art => art.type === 'faq')
      .slice(0, 10)
      .map(art => ({
        question: art.title,
        answer: art.meta_description || art.content.replace(/<[^>]*>/g, '').slice(0, 200)
      }));
    jsonLd = generateFAQJsonLd(faqs);
  } else {
    jsonLd = generateCategoryJsonLd(category, filteredArticles);
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
              {filteredArticles.length} {filteredArticles.length === 1 ? 'artigo encontrado' : 'artigos encontrados'}
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
                    }}
                    className="w-full"
                  >
                    Limpar Filtros
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Artigos */}
          {currentArticles.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {currentArticles.map((article) => (
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
                  {searchQuery || selectedTag || selectedType 
                    ? 'Tente ajustar os filtros para encontrar o que procura.'
                    : 'Esta categoria ainda não possui artigos publicados.'}
                </p>
                
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Precisa de ajuda?</p>
                  <Button 
                    onClick={() => window.open('https://wa.me/5571981470573?text=Vim%20da%20Central%20de%20Ajuda%20e%20preciso%20de%20suporte%20na%20categoria%20' + encodeURIComponent(category.name), '_blank')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Falar no WhatsApp
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Artigos Relacionados */}
          {relatedArticles.length > 0 && (
            <section className="mt-16 pt-8 border-t">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Artigos de outras categorias
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedArticles.map((article) => (
                  <Card key={article.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <Badge variant="outline" className="w-fit mb-2">{article.type}</Badge>
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
                      <CardDescription className="line-clamp-2">
                        {article.meta_description || 
                         article.content.replace(/<[^>]*>/g, '').slice(0, 100) + '...'}
                      </CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
}