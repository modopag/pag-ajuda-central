import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import NotFound from './NotFound';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SkipLink } from '@/components/SkipLink';
import { SEOHelmet } from '@/components/SEO/SEOHelmet';
import ArticleFeedback from '@/components/ArticleFeedback';
import RelatedArticles from '@/components/RelatedArticles';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getDataAdapter } from '@/lib/data-adapter';
import { generateArticleUrl, generateCategoryUrl, generateCanonicalUrl, generateBreadcrumbItems, isReservedPath } from '@/utils/urlGenerator';
import { initializeLazyImages } from '@/utils/lazyImages';
import { useSettings } from '@/hooks/useSettings';
import type { Article, Category, Tag } from '@/types/admin';
import { Clock, Eye, Tag as TagIcon, ChevronRight, User, ArrowLeft, MessageCircle, Mail, Heart, Share2, BookOpen } from 'lucide-react';

export default function ArticleSilo() {
  const { categorySlug, articleSlug } = useParams<{ categorySlug: string; articleSlug: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { seo } = useSettings();

  useEffect(() => {
    if (!categorySlug || !articleSlug) {
      navigate('/', { replace: true });
      return;
    }

    // Check if category slug is reserved
    if (isReservedPath(categorySlug)) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    loadArticleData();
  }, [categorySlug, articleSlug, navigate]);

  useEffect(() => {
    if (article && !loading) {
      // Initialize lazy loading for article images
      const cleanup = initializeLazyImages();
      
      // Increment view count
      incrementViewCount();

      return cleanup;
    }
  }, [article, loading]);

  const loadArticleData = async () => {
    if (!categorySlug || !articleSlug) return;

    try {
      setLoading(true);
      const adapter = await getDataAdapter();

      // Load category first
      const categories = await adapter.getCategories();
      const foundCategory = categories.find(c => c.slug === categorySlug && c.is_active);

      if (!foundCategory) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setCategory(foundCategory);

      // Load article within this category
      const articles = await adapter.getArticles();
      const foundArticle = articles.find(
        a => a.slug === articleSlug && 
             a.category_id === foundCategory.id && 
             a.status === 'published'
      );

      if (!foundArticle) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setArticle(foundArticle);

      // Load article tags - using a simplified approach for now
      // In a real implementation, you'd have a proper tags relationship
      setTags([]);

      setLoading(false);
    } catch (error) {
      console.error('Error loading article:', error);
      setNotFound(true);
      setLoading(false);
    }
  };

  const incrementViewCount = async () => {
    if (!article) return;

    try {
      const adapter = await getDataAdapter();
      // Mock increment for now - in real implementation this would update the database
      setArticle(prev => prev ? { ...prev, view_count: prev.view_count + 1 } : null);
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <Header />
        <SkipLink />
        <main id="main-content" className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
          <div className="space-y-6">
            <Skeleton className="h-4 w-96" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-96 w-full" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (notFound || !article || !category || !categorySlug || !articleSlug) {
    return <NotFound />;
  }

  const canonicalUrl = generateCanonicalUrl(generateArticleUrl(categorySlug, articleSlug), seo.site_url);
  
  // Structured data for article
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.meta_description || article.title,
    "url": canonicalUrl,
    "datePublished": article.updated_at,
    "dateModified": article.updated_at,
    "author": {
      "@type": "Organization",
      "name": "modoPAG",
      "url": "https://modopag.com.br"
    },
    "publisher": {
      "@type": "Organization",
      "name": "modoPAG",
      "url": "https://modopag.com.br",
      "logo": {
        "@type": "ImageObject",
        "url": seo.site_url + "/modopag-logo-yellow.webp"
      }
    },
    "inLanguage": "pt-BR",
    "articleSection": category.name,
    "keywords": tags.map(tag => tag.name).join(", "),
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": generateBreadcrumbItems(
        categorySlug, 
        category.name, 
        articleSlug, 
        article.title, 
        seo.site_url
      )
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonicalUrl
    }
  };

  const seoTitle = article.og_title || `${article.title} | ${category.name} - modoPAG`;
  const seoDescription = article.meta_description || `${article.title} - Saiba mais na Central de Ajuda da modoPAG.`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      
      <SEOHelmet
        title={seoTitle}
        description={seoDescription}
        canonicalUrl={canonicalUrl}
        jsonLd={jsonLd}
        ogTitle={article.title}
        ogDescription={seoDescription}
        ogType="article"
      />

      <Header />
      <SkipLink />

      <main id="main-content" className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
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
            <li>
              <Link 
                to={generateCategoryUrl(categorySlug)} 
                className="hover:text-primary transition-colors"
              >
                {category.name}
              </Link>
            </li>
            <ChevronRight className="w-4 h-4" />
            <li className="text-foreground font-medium line-clamp-1" aria-current="page">
              {article.title}
            </li>
          </ol>
        </nav>

        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(generateCategoryUrl(categorySlug))}
          className="mb-6 p-0 h-auto font-normal text-muted-foreground hover:text-primary group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Voltar para {category.name}
        </Button>

        {/* Article Header */}
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge variant="secondary" className="bg-gradient-to-r from-primary/10 to-accent/10 text-primary border-primary/20">
              <BookOpen className="w-3 h-3 mr-1" />
              {category.name}
            </Badge>
            {tags.map((tag) => (
              <Badge key={tag.id} variant="outline" className="text-xs hover:bg-primary/5 transition-colors">
                <TagIcon className="w-3 h-3 mr-1" />
                {tag.name}
              </Badge>
            ))}
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {article.title}
          </h1>

          {article.meta_description && (
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl leading-relaxed">
              {article.meta_description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-6">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span>Atualizado em {new Date(article.updated_at).toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-accent" />
              <span>{article.view_count} visualizações</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              <span>Equipe modoPAG</span>
            </div>
          </div>

          {/* Article Actions */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <Button size="sm" variant="outline" className="hover:bg-primary/5 hover:border-primary/20">
              <Heart className="w-4 h-4 mr-2" />
              Curtir
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="hover:bg-accent/5 hover:border-accent/20"
              onClick={() => navigator.share && navigator.share({
                title: article.title,
                url: window.location.href
              })}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar
            </Button>
          </div>
        </header>

        {/* Article Content */}
        <Card className="mb-8 border-0 shadow-xl bg-gradient-to-br from-card via-card to-card/80">
          <CardContent className="p-8 md:p-12">
            <div 
              className="prose prose-lg max-w-none article-content lazy-images"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </CardContent>
        </Card>

        {/* Article Footer */}
        <div className="space-y-12">
          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-muted-foreground">Tags:</span>
              {tags.map((tag) => (
                <Badge key={tag.id} variant="outline" className="hover:bg-primary/10 transition-colors">
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}

          {/* Quick Help Section */}
          <section className="bg-gradient-to-r from-primary/5 via-background to-accent/5 rounded-xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Este artigo foi útil?
              </h2>
              <p className="text-muted-foreground">
                Se você ainda tem dúvidas, nossa equipe está pronta para ajudar!
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Button 
                size="lg" 
                className="bg-[#25D366] hover:bg-[#25D366]/90 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => window.open('https://wa.me/5511999999999?text=Olá, li o artigo "' + encodeURIComponent(article.title) + '" mas ainda tenho dúvidas', '_blank')}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                WhatsApp
              </Button>
              
              <Button 
                size="lg" 
                variant="secondary"
                className="shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => window.location.href = `mailto:ajuda@modopag.com.br?subject=Dúvida sobre: ${article.title}`}
              >
                <Mail className="w-5 h-5 mr-2" />
                E-mail
              </Button>
            </div>
          </section>

          {/* Feedback */}
          <ArticleFeedback articleId={article.id.toString()} />

          {/* Related Articles */}
          <RelatedArticles 
            currentArticleId={article.id.toString()}
            categoryId={category.id.toString()}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}