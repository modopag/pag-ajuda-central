import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
// import { SEOHelmet } from "@/components/SEO/SEOHelmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, ArrowLeft, Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { trackFAQSearch, trackWhatsAppCTA } from "@/utils/analytics";
import { monitoring } from "@/utils/monitoring";
import { useSearchWithFilters } from "@/hooks/useSearchWithFilters";
import { useArticleTags } from "@/hooks/useArticleTags";
import { generateArticleUrl, generateCategoryUrl } from "@/utils/urlGenerator";
import type { Article, Category } from "@/types/admin";

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [categories, setCategories] = useState<Category[]>([]);

  // Use the search hook with real data
  const searchResults = useSearchWithFilters({
    query: query,
    page: 1
  }, {
    itemsPerPage: 20, // Show more results for search
    debounceMs: 300
  });

  const { allTags } = useArticleTags({ includeAll: true });

  useEffect(() => {
    if (query && !searchResults.isLoading) {
      // Track search
      trackFAQSearch(query, searchResults.filteredCount);
      
      // Track empty results
      if (searchResults.filteredCount === 0) {
        monitoring.trackEmptySearch(query);
      }
    }
  }, [query, searchResults.isLoading, searchResults.filteredCount]);

  const handleSearch = (newQuery: string) => {
    setSearchParams({ q: newQuery });
  };

  // Get article tags for enhanced display
  const getArticleTags = async (articleId: string) => {
    // This would be called in a real implementation to get article tags
    return allTags.slice(0, 3); // Mock for now
  };

  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-accent/30 font-medium">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const handleWhatsAppClick = () => {
    trackWhatsAppCTA('search_empty', query);
    window.open('https://wa.me/5571981470573?text=Olá!%20Não%20encontrei%20a%20resposta%20que%20procurava%20na%20Central%20de%20Ajuda.%20Preciso%20de%20ajuda%20com:%20' + encodeURIComponent(query), '_blank', 'noopener');
  };

  const pageTitle = query ? `Busca por "${query}"` : "Buscar na Central de Ajuda";
  const canonicalUrl = query ? `https://ajuda.modopag.com.br/buscar?q=${encodeURIComponent(query)}` : `https://ajuda.modopag.com.br/buscar`;

  return (
    <>
      {/* <SEOHelmet
        title={`${pageTitle} | modoPAG - Central de Ajuda`}
        description={query 
          ? `Resultados da busca por "${query}" na Central de Ajuda modoPAG. Encontre respostas sobre maquininhas, pagamentos e mais.`
          : "Busque por respostas na Central de Ajuda modoPAG. Digite sua dúvida e encontre soluções rápidas."
        }
        canonicalUrl={canonicalUrl}
        ogTitle={pageTitle}
        ogDescription={query 
          ? `Encontre respostas para "${query}" na Central de Ajuda modoPAG`
          : "Busque respostas na Central de Ajuda modoPAG"
        }
      /> */}
      
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          {/* Back to home */}
          <div className="mb-6">
            <Link 
              to="/" 
              className="inline-flex items-center text-muted-foreground hover:text-accent transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar à Central de Ajuda
            </Link>
          </div>

          {/* Search Section */}
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-center text-foreground mb-8">
              {query ? `Resultados para "${query}"` : "Buscar na Central de Ajuda"}
            </h1>
            
            <div className="mb-8">
              <SearchBar 
                onSearch={handleSearch}
                placeholder="Digite sua dúvida..."
              />
            </div>

            {/* Loading State */}
            {searchResults.isLoading && (
              <div className="space-y-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex gap-2">
                          <Skeleton className="h-5 w-20" />
                          <Skeleton className="h-5 w-16" />
                        </div>
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-6 w-3/4" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-5 w-12" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Results */}
            {!searchResults.isLoading && query && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-muted-foreground">
                    {searchResults.filteredCount === 0 
                      ? "Nenhum resultado encontrado" 
                      : `${searchResults.filteredCount} ${searchResults.filteredCount === 1 ? 'resultado encontrado' : 'resultados encontrados'}`
                    }
                  </p>
                  {searchResults.filteredCount > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Exibindo {Math.min(20, searchResults.filteredCount)} resultados
                    </p>
                  )}
                </div>

                {searchResults.articles.length > 0 ? (
                  <div className="space-y-6">
                    {searchResults.articles.map((article) => (
                      <Card key={article.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">
                                {searchResults.categories.find(c => c.id === article.category_id)?.name || 'Categoria'}
                              </Badge>
                              <Badge variant="outline">{article.type}</Badge>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {article.reading_time_minutes} min
                              </div>
                              <span>
                                {new Date(article.updated_at).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          </div>
                          
                          <h2 className="text-xl font-semibold">
                            <Link 
                              to={generateArticleUrl(
                                categories.find(c => c.id === article.category_id)?.slug || 
                                searchResults.categories.find(c => c.id === article.category_id)?.slug || '',
                                article.slug
                              )}
                              className="text-foreground hover:text-primary transition-colors"
                            >
                              {highlightText(article.title, query)}
                            </Link>
                          </h2>
                        </CardHeader>
                        
                        <CardContent>
                          <p className="text-muted-foreground mb-4 line-clamp-2">
                            {highlightText(
                              article.meta_description || 
                              article.content.replace(/<[^>]*>/g, '').slice(0, 200) + '...', 
                              query
                            )}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <User className="w-3 h-3" />
                              {article.author}
                            </div>
                            
                            {/* Article tags would be loaded here in real implementation */}
                            <div className="flex flex-wrap gap-1">
                              {allTags.slice(0, 2).map((tag) => (
                                <Badge key={tag.id} variant="outline" className="text-xs">
                                  {highlightText(tag.name, query)}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  /* Empty State */
                  <div className="text-center py-12 bg-card border border-border rounded-lg">
                    <h2 className="text-xl font-semibold text-foreground mb-4">
                      Não encontramos resultados para "{query}"
                    </h2>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Que tal tentar outros termos ou entrar em contato com nossa equipe de suporte?
                    </p>
                    
                    <div className="space-y-4">
                      <Button 
                        onClick={handleWhatsAppClick}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Falar com Suporte via WhatsApp
                      </Button>
                      
                      <div className="text-sm text-muted-foreground">
                        <p><strong>Sugestões para melhorar sua busca:</strong></p>
                        <ul className="mt-2 space-y-1 text-left max-w-sm mx-auto">
                          <li>• Verifique a ortografia das palavras-chave</li>
                          <li>• Tente termos mais gerais ou específicos</li>
                          <li>• Use sinônimos relacionados ao seu problema</li>
                          <li>• Remova palavras como "como", "onde", "quando"</li>
                        </ul>
                      </div>
                      
                      {/* Popular searches suggestions */}
                      <div className="mt-6">
                        <p className="text-sm font-medium text-foreground mb-3">Buscas populares:</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {['maquininha', 'taxas', 'PIX', 'configuração', 'problemas'].map((term) => (
                            <Button
                              key={term}
                              variant="outline"
                              size="sm"
                              onClick={() => handleSearch(term)}
                              className="text-xs"
                            >
                              {term}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* No Query State */}
            {!query && !searchResults.isLoading && (
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  O que você gostaria de encontrar?
                </h2>
                <p className="text-muted-foreground mb-8">
                  Digite sua dúvida na barra de pesquisa acima para encontrar respostas
                </p>
                
                <div className="max-w-4xl mx-auto">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                    {[
                      "Configurar maquininha", 
                      "Taxas e tarifas", 
                      "Problemas com PIX", 
                      "Antecipação",
                      "Cartão de débito",
                      "Estorno",
                      "Taxa de administração", 
                      "Conta digital"
                    ].map((suggestion) => (
                      <Button
                        key={suggestion}
                        variant="outline"
                        onClick={() => handleSearch(suggestion)}
                        className="h-auto py-3 px-4 text-center text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>

                  {/* Categories quick access */}
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      Ou navegue por categoria:
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {searchResults.categories.slice(0, 6).map((category) => (
                        <Link
                          key={category.id}
                          to={generateCategoryUrl(category.slug)}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs border border-border hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default Search;