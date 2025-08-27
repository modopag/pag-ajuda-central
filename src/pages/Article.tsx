import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { sanitizeHtml } from '@/utils/htmlSanitizer';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ArticleFeedback from '@/components/ArticleFeedback';
import { ArticleFAQSection } from '@/components/ArticleFAQSection';
import RelatedArticles from '@/components/RelatedArticles';
import { SEOHelmet } from '@/components/SEO/SEOHelmet';
import { generateArticleJsonLd, generateBreadcrumbJsonLd, generateFAQJsonLd } from '@/utils/jsonLd';
import { getDataAdapter } from '@/lib/data-adapter';
import type { Article as ArticleType, Category } from '@/types/admin';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Home, ChevronRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Article = () => {
  const { articleId } = useParams();
  const [article, setArticle] = useState<ArticleType | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [articleFAQs, setArticleFAQs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadArticle = async () => {
      if (!articleId) return;
      
      setIsLoading(true);
      try {
        const adapter = await getDataAdapter();
        const articleData = await adapter.getArticleBySlug(articleId);
        
        if (articleData) {
          setArticle(articleData);
          
          // Track article view
          import('@/utils/analytics').then(({ trackFAQViewArticle }) => {
            trackFAQViewArticle(articleData.id, articleData.category_id, articleData.title);
          });
          
          // Carregar categoria
          const categoryData = await adapter.getCategoryById(articleData.category_id);
          setCategory(categoryData);
          
          // Load article FAQs
          try {
            const faqs = await adapter.getArticleFAQs(articleData.id);
            setArticleFAQs(faqs);
          } catch (error) {
            console.error('Failed to load article FAQs:', error);
            setArticleFAQs([]);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar artigo:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadArticle();
  }, [articleId]);

  // Initialize lazy loading for images after article loads
  useEffect(() => {
    if (article && !isLoading) {
      // Delay slightly to ensure DOM is updated
      const timer = setTimeout(() => {
        import('@/utils/lazyImages').then(({ initializeLazyImages }) => {
          initializeLazyImages();
        });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [article, isLoading]);

  if (isLoading) {
    return (
      <>
        <SEOHelmet 
          title="Carregando... | modoPAG - Central de Ajuda"
          description="Carregando artigo da Central de Ajuda modoPAG"
        />
        <div className="min-h-screen bg-background">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <div className="animate-pulse space-y-6">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-8 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  if (!article) {
    return (
      <>
        <SEOHelmet 
          title="Artigo não encontrado | modoPAG - Central de Ajuda"
          description="O artigo solicitado não foi encontrado na Central de Ajuda modoPAG"
          noindex={true}
        />
        <div className="min-h-screen bg-background">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-2xl font-bold mb-4">Artigo não encontrado</h1>
              <p className="text-muted-foreground">
                O artigo que você está procurando não existe ou foi removido.
              </p>
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  const articleJsonLd = category ? generateArticleJsonLd(article, category) : null;
  const breadcrumbJsonLd = category ? generateBreadcrumbJsonLd(article, category) : null;
  const faqJsonLd = articleFAQs.length > 0 ? generateFAQJsonLd(articleFAQs) : null;
  
  const combinedJsonLd = [articleJsonLd, breadcrumbJsonLd, faqJsonLd].filter(Boolean);

  return (
    <>
      <SEOHelmet
        title={`${article.meta_title || article.title} | modoPAG - Central de Ajuda`}
        description={article.meta_description}
        canonicalUrl={article.canonical_url || `https://ajuda.modopag.com.br/article/${article.slug}`}
        ogTitle={article.og_title || article.title}
        ogDescription={article.og_description || article.meta_description}
        ogImage={article.og_image}
        ogType="article"
        noindex={article.noindex}
        jsonLd={combinedJsonLd}
      />
      
      <div className="min-h-screen bg-background">
        <Header />
        
        {/* Breadcrumbs */}
        <div className="py-4 px-4 border-b border-border">
          <div className="container mx-auto">
            <nav className="flex items-center space-x-2 text-sm" aria-label="Breadcrumb">
              <Home className="w-4 h-4" aria-hidden="true" />
              <a href="/" className="text-muted-foreground hover:text-accent transition-colors">
                Central de Ajuda
              </a>
              <ChevronRight className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
              {category && (
                <>
                  <a 
                    href={`/category/${category.slug}`}
                    className="text-muted-foreground hover:text-accent transition-colors"
                  >
                    {category.name}
                  </a>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                </>
              )}
              <span className="text-foreground font-medium" aria-current="page">{article.title}</span>
            </nav>
          </div>
        </div>
        
        {/* Article Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            {category && (
              <Button 
                variant="ghost" 
                onClick={() => window.history.back()}
                className="mb-6 p-0 h-auto font-normal text-muted-foreground hover:text-accent"
                aria-label={`Voltar para ${category.name}`}
              >
                <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
                Voltar para {category.name}
              </Button>
            )}

            {/* Article Header */}
            <header className="mb-8">
              {category && (
                <Badge variant="secondary" className="mb-4">
                  {category.name}
                </Badge>
              )}
              
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {article.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User size={16} aria-hidden="true" />
                  <span>{article.author}</span>
                </div>
                
                {article.published_at && (
                  <div className="flex items-center gap-1">
                    <Calendar size={16} aria-hidden="true" />
                    <time dateTime={article.published_at}>
                      {new Date(article.published_at).toLocaleDateString('pt-BR')}
                    </time>
                  </div>
                )}
                
                <div className="flex items-center gap-1">
                  <Clock size={16} aria-hidden="true" />
                  <span>{article.reading_time_minutes} min de leitura</span>
                </div>
              </div>
            </header>

            {/* Article Content with Lazy Loading */}
            <article className="prose prose-lg max-w-none mb-12">
              <div 
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.content) }}
                className="article-content lazy-images"
              />
            </article>

          {/* Article FAQs */}
          <ArticleFAQSection articleId={article.id} />

          {/* Article Feedback */}
          <ArticleFeedback 
            articleId={article.id}
          />
          
          {/* Related Articles */}
          <RelatedArticles 
            currentArticleId={article.id}
            categoryId={article.category_id}
          />
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Article;