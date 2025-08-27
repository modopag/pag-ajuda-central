import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import NotFound from './NotFound';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SkipLink } from '@/components/SkipLink';
import { SEOHelmet } from '@/components/SEO/SEOHelmet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getDataAdapter } from '@/lib/data-adapter';
import { generateArticleUrl, generateCategoryUrl, generateCanonicalUrl, generateBreadcrumbItems, isReservedPath } from '@/utils/urlGenerator';
import { useSimpleSearch } from '@/hooks/useSimpleSearch';
import { useSettings } from '@/hooks/useSettings';
import type { Category, Article } from '@/types/admin';
import { Clock, FileText, ChevronRight, Search, MessageCircle, Mail, ExternalLink, TrendingUp, Users, Calendar } from 'lucide-react';

export default function CategorySilo() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { seo } = useSettings();

  const {
    filteredArticles,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
  } = useSimpleSearch({
    articles,
    searchFields: ['title', 'content', 'meta_description'],
  });

  useEffect(() => {
    if (!categorySlug) {
      navigate('/', { replace: true });
      return;
    }

    // Check if category slug is reserved
    if (isReservedPath(categorySlug)) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    loadCategoryData();
  }, [categorySlug, navigate]);

  const loadCategoryData = async () => {
    if (!categorySlug) return;

    try {
      setLoading(true);
      const adapter = await getDataAdapter();

      // Load category
      const categories = await adapter.getCategories();
      const foundCategory = categories.find(c => c.slug === categorySlug && c.is_active);

      if (!foundCategory) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setCategory(foundCategory);

      // Load articles for this category
      const allArticles = await adapter.getArticles();
      const categoryArticles = allArticles.filter(
        a => a.category_id === foundCategory.id && a.status === 'published'
      );

      setArticles(categoryArticles);
      setLoading(false);
    } catch (error) {
      console.error('Error loading category:', error);
      setNotFound(true);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <Header />
        <SkipLink />
        <main id="main-content" className="relative z-10 container mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (notFound || !category || !categorySlug) {
    return <NotFound />;
  }

  const canonicalUrl = generateCanonicalUrl(generateCategoryUrl(categorySlug), seo.site_url);
  
  // Structured data for category (CollectionPage)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": category.name,
    "description": category.description,
    "url": canonicalUrl,
    "inLanguage": "pt-BR",
    "isPartOf": {
      "@type": "WebSite",
      "name": "modoPAG Central de Ajuda",
      "url": seo.site_url
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": generateBreadcrumbItems(categorySlug, category.name, undefined, undefined, seo.site_url)
    },
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": filteredArticles.length,
      "itemListElement": filteredArticles.map((article, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Article",
          "headline": article.title,
          "url": generateCanonicalUrl(generateArticleUrl(categorySlug, article.slug), seo.site_url),
          "description": article.meta_description || article.title
        }
      }))
    }
  };

  const seoTitle = `${category.name} - Central de Ajuda modoPAG`;
  const seoDescription = category.description || `Encontre artigos sobre ${category.name} na Central de Ajuda da modoPAG. Tire suas dúvidas sobre pagamentos e soluções financeiras.`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      
      <SEOHelmet
        title={seoTitle}
        description={seoDescription}
        canonicalUrl={canonicalUrl}
        jsonLd={jsonLd}
        ogTitle={seoTitle}
        ogDescription={seoDescription}
      />

      <Header />
      <SkipLink />

      {/* Hero Section */}
      <section className="relative z-10 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 py-16">
        <div className="container mx-auto px-4">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
              <li>
                <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 rotate-180" />
                  Central de Ajuda
                </Link>
              </li>
              <ChevronRight className="w-4 h-4" />
              <li className="text-foreground font-medium" aria-current="page">
                {category.name}
              </li>
            </ol>
          </nav>

          {/* Category Header */}
          <header className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                {category.description}
              </p>
            )}
            
            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-6 mt-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="w-4 h-4 text-primary" />
                <span>{articles.length} artigo{articles.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4 text-accent" />
                <span>{articles.reduce((sum, article) => sum + article.view_count, 0).toLocaleString()} visualizações</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 text-primary" />
                <span>Atualizado {new Date(Math.max(...articles.map(a => new Date(a.updated_at).getTime()))).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </header>
        </div>
      </section>

      <main id="main-content" className="relative z-10 container mx-auto px-4 py-8">

        {/* Search and Filter */}
        {articles.length > 0 && (
          <div className="mb-8 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={`Buscar em ${category.name}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="relevance">Mais Relevante</option>
                <option value="newest">Mais Recente</option>
                <option value="oldest">Mais Antigo</option>
                <option value="title">Por Título</option>
              </select>
            </div>

            {searchTerm && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {filteredArticles.length} resultado{filteredArticles.length !== 1 ? 's' : ''} para "{searchTerm}"
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSearchTerm('')}
                  className="text-primary hover:text-primary/80"
                >
                  Limpar
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Articles Grid - IMPROVED: Clean, minimal cards with responsive layout */}
        {filteredArticles.length > 0 ? (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredArticles.map((article) => (
              <Link
                key={article.id}
                to={generateArticleUrl(categorySlug, article.slug)}
                className="group block h-full"
              >
                <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-border/50 bg-gradient-to-br from-card via-card to-card/90 hover:from-primary/5 hover:to-accent/5 hover:border-primary/20">
                  <CardHeader className="p-4 sm:p-6">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <Badge 
                        variant="secondary" 
                        className="shrink-0 bg-primary/10 text-primary border-primary/20 text-xs font-medium"
                      >
                        {article.type}
                      </Badge>
                      
                      {article.view_count > 0 && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground bg-background/50 px-2 py-1 rounded-full">
                          <TrendingUp className="w-3 h-3" />
                          <span>{article.view_count}</span>
                        </div>
                      )}
                    </div>
                    
                    <CardTitle className="text-lg sm:text-xl font-bold leading-tight line-clamp-3 group-hover:text-primary transition-colors duration-300">
                      {article.title}
                    </CardTitle>
                    
                    {/* REMOVED: meta_description to keep cards minimal */}
                  </CardHeader>
                  
                  <CardContent className="p-4 sm:p-6 pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        <span>{article.reading_time_minutes || 5} min de leitura</span>
                      </div>
                      
                      {/* IMPROVED: Clean hover indicator instead of confusing "Ler artigo" text */}
                      <div className="text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {searchTerm ? 'Nenhum resultado encontrado' : 'Nenhum artigo disponível'}
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {searchTerm 
                ? `Não encontramos artigos que correspondam à sua busca por "${searchTerm}".`
                : 'Esta categoria ainda não possui artigos publicados.'
              }
            </p>
            {searchTerm && (
              <Button
                className="mt-4"
                onClick={() => setSearchTerm('')}
                variant="outline"
              >
                Ver todos os artigos
              </Button>
            )}
          </div>
        )}

        {/* Quick Contact Section */}
        <section className="mt-16 bg-gradient-to-r from-primary/5 via-background to-accent/5 rounded-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Precisa de ajuda rápida?
            </h2>
            <p className="text-muted-foreground">
              Nossa equipe está pronta para te ajudar com qualquer dúvida sobre {category.name}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Button 
              size="lg" 
              className="bg-[#25D366] hover:bg-[#25D366]/90 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => window.open('https://wa.me/5511999999999?text=Olá, preciso de ajuda com ' + encodeURIComponent(category.name), '_blank')}
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              WhatsApp
            </Button>
            
            <Button 
              size="lg" 
              variant="secondary"
              className="shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => window.location.href = `mailto:ajuda@modopag.com.br?subject=Dúvida sobre ${category.name}`}
            >
              <Mail className="w-5 h-5 mr-2" />
              E-mail
            </Button>
          </div>
        </section>

        {/* Trust Section */}
        <div className="mt-12 text-center">
          <Link
            to="https://www.reclameaqui.com.br/empresa/modopag/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-accent/10 px-4 py-2 rounded-full hover:from-primary/20 hover:to-accent/20 transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Nota 8.1/10 no ReclameAqui modoPAG</span>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}