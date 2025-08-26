import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import { SEOHelmet } from "@/components/SEO/SEOHelmet";
import { Button } from "@/components/ui/button";
import { MessageSquare, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { trackFAQSearch, trackWhatsAppCTA } from "@/utils/analytics";
import { monitoring } from "@/utils/monitoring";

// Mock data - em produção viria do MockAdapter
const mockArticles = [
  {
    id: "1",
    title: "Como configurar minha maquininha modoPAG?",
    slug: "como-configurar-maquininha",
    excerpt: "Aprenda o passo a passo para configurar sua maquininha modoPAG de forma rápida e fácil.",
    category: { id: "setup", name: "Configuração", slug: "configuracao" },
    tags: ["maquininha", "configuração", "setup"],
    type: "guide",
    updated_at: "2024-01-15"
  },
  {
    id: "2", 
    title: "Taxas de cartão de crédito e débito",
    slug: "taxas-cartao-credito-debito",
    excerpt: "Entenda as taxas aplicadas nas transações com cartão de crédito e débito na modoPAG.",
    category: { id: "fees", name: "Taxas", slug: "taxas" },
    tags: ["taxas", "cartão", "crédito", "débito"],
    type: "info",
    updated_at: "2024-01-10"
  },
  {
    id: "3",
    title: "Resolver problemas com PIX",
    slug: "problemas-pix",
    excerpt: "Soluções para os problemas mais comuns ao usar PIX com sua maquininha modoPAG.",
    category: { id: "troubleshooting", name: "Suporte", slug: "suporte" },
    tags: ["PIX", "problemas", "troubleshooting"],
    type: "troubleshooting",
    updated_at: "2024-01-12"
  }
];

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [results, setResults] = useState(mockArticles);
  const [isLoading, setIsLoading] = useState(false);
  
  const query = searchParams.get("q") || "";

  useEffect(() => {
    if (query) {
      setIsLoading(true);
      // Simulate search delay
      setTimeout(() => {
        const filtered = mockArticles.filter(article =>
          article.title.toLowerCase().includes(query.toLowerCase()) ||
          article.excerpt.toLowerCase().includes(query.toLowerCase()) ||
          article.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        );
        setResults(filtered);
        setIsLoading(false);
        
        // Track search
        trackFAQSearch(query, filtered.length);
        
        // Track empty results
        if (filtered.length === 0) {
          monitoring.trackEmptySearch(query);
        }
      }, 300);
    } else {
      setResults([]);
    }
  }, [query]);

  const handleSearch = (newQuery: string) => {
    setSearchParams({ q: newQuery });
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
      <SEOHelmet
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
      />
      
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
            {isLoading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto"></div>
                <p className="text-muted-foreground mt-4">Buscando...</p>
              </div>
            )}

            {/* Results */}
            {!isLoading && query && (
              <div className="mb-8">
                <p className="text-muted-foreground mb-6">
                  {results.length === 0 
                    ? "Nenhum resultado encontrado" 
                    : `${results.length} ${results.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}`
                  }
                </p>

                {results.length > 0 ? (
                  <div className="space-y-6">
                    {results.map((article) => (
                      <article key={article.id} className="bg-card border border-border rounded-lg p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{article.category.name}</Badge>
                            <Badge variant="outline">{article.type}</Badge>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            Atualizado em {new Date(article.updated_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        
                        <h2 className="text-xl font-semibold mb-3">
                          <Link 
                            to={`/artigo/${article.slug}`}
                            className="text-foreground hover:text-accent transition-colors"
                          >
                            {highlightText(article.title, query)}
                          </Link>
                        </h2>
                        
                        <p className="text-muted-foreground mb-4">
                          {highlightText(article.excerpt, query)}
                        </p>
                        
                        <div className="flex flex-wrap gap-2">
                          {article.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {highlightText(tag, query)}
                            </Badge>
                          ))}
                        </div>
                      </article>
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
                        className="bg-accent text-accent-foreground hover:bg-accent/90"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Falar com Suporte via WhatsApp
                      </Button>
                      
                      <div className="text-sm text-muted-foreground">
                        <p>Sugestões:</p>
                        <ul className="mt-2 space-y-1">
                          <li>• Verifique a ortografia das palavras-chave</li>
                          <li>• Tente termos mais gerais</li>
                          <li>• Use sinônimos para sua busca</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* No Query State */}
            {!query && !isLoading && (
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  O que você gostaria de encontrar?
                </h2>
                <p className="text-muted-foreground mb-8">
                  Digite sua dúvida na barra de pesquisa acima
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                  {["Configurar maquininha", "Taxas e tarifas", "Problemas com PIX"].map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="outline"
                      onClick={() => handleSearch(suggestion)}
                      className="h-auto py-3 px-4 text-left"
                    >
                      {suggestion}
                    </Button>
                  ))}
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