import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import NotFound from './NotFound';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SkipLink } from '@/components/SkipLink';
import { SEOHelmet } from '@/components/SEO/SEOHelmet';
import ArticleFeedback from '@/components/ArticleFeedback';
import { SmartRelatedArticles } from '@/components/SmartRelatedArticles';
import { TableOfContents } from '@/components/TableOfContents';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getDataAdapter } from '@/lib/data-adapter';
import { generateArticleUrl, generateCategoryUrl, generateCanonicalUrl, generateBreadcrumbItems, isReservedPath } from '@/utils/urlGenerator';
import { initializeLazyImages } from '@/utils/lazyImages';
import { useSettings } from '@/hooks/useSettings';
import type { Article, Category, Tag } from '@/types/admin';
import { Clock, Eye, Tag as TagIcon, ChevronRight, User, Heart, Share2, BookOpen } from 'lucide-react';
import { handleArticleLike, handleArticleShare, isArticleLiked } from '@/utils/articleActions';
import AdminComments from '@/components/AdminComments';
import { AuthService } from '@/lib/auth';

export default function ArticleSilo() {
  const { categorySlug, articleSlug } = useParams<{ categorySlug: string; articleSlug: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [liked, setLiked] = useState(false);
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

      // Check if article is already liked
      setLiked(isArticleLiked(article.id.toString()));

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

    // Check if already viewed in this session
    const sessionKey = `article_viewed_${article.id}`;
    const hasViewed = sessionStorage.getItem(sessionKey);
    
    if (hasViewed) {
      return; // Don't increment if already viewed in this session
    }

    try {
      const adapter = await getDataAdapter();
      
      // Increment view count in storage
      const articles = await adapter.getArticles();
      const updatedArticles = articles.map(a => 
        a.id === article.id 
          ? { ...a, view_count: (a.view_count || 0) + 1 }
          : a
      );
      
      // Update in localStorage (mock adapter uses localStorage)
      localStorage.setItem('modopag_articles', JSON.stringify(updatedArticles));
      
      // Mark as viewed in this session
      sessionStorage.setItem(sessionKey, 'true');
      
      // Update local state
      setArticle(prev => prev ? { 
        ...prev, 
        view_count: (prev.view_count || 0) + 1 
      } : null);
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const handleLike = async () => {
    if (!article) return;
    const success = await handleArticleLike(article.id.toString());
    if (success) {
      setLiked(true);
    }
  };

  const handleShare = async () => {
    if (!article) return;
    await handleArticleShare(article.title);
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

      <main id="main-content" className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="xl:col-span-3">
              {/* Table of Contents - Mobile only */}
              <div className="xl:hidden mb-8">
                <TableOfContents mobileCollapsible={true} />
              </div>

              {/* Article Header */}
              <header className="mb-8 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant="secondary" className="font-medium">
                      {article.type}
                    </Badge>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{article.reading_time_minutes || 5} minutos de leitura</span>
                    </div>
                  </div>
                  
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
                    {article.title}
                  </h1>
                  
                  {article.meta_description && (
                    <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-4xl">
                      {article.meta_description}
                    </p>
                  )}
                </div>

                {/* Article Meta */}
                <div className="flex items-center justify-between flex-wrap gap-4 py-6 border-y border-border/50">
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>Atualizado em {new Date(article.updated_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      <span>{article.view_count || 0} visualizações</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant={liked ? "default" : "outline"} 
                      className="hover:bg-primary/5 hover:border-primary/20"
                      onClick={handleLike}
                    >
                      <Heart className={`w-4 h-4 mr-2 ${liked ? "fill-current" : ""}`} />
                      {liked ? "Curtido" : "Curtir"}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="hover:bg-accent/5 hover:border-accent/20"
                      onClick={handleShare}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Compartilhar
                    </Button>
                  </div>
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

                {/* Feedback */}
                <ArticleFeedback articleId={article.id.toString()} />

                {/* Admin Comments - Only visible to authenticated admins */}
                {AuthService.isAuthenticated() && AuthService.getCurrentUser()?.role === 'admin' && (
                  <AdminComments articleId={article.id.toString()} />
                )}
              </div>
            </div>

            {/* Sidebar - Desktop only */}
            <div className="hidden xl:block xl:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Table of Contents */}
                <TableOfContents />
                
                {/* Smart Related Articles */}
                <SmartRelatedArticles 
                  currentArticleId={article.id.toString()}
                  categoryId={category.id.toString()}
                  tags={tags}
                  sidebarMode={true}
                  maxArticles={4}
                />
              </div>
            </div>
          </div>

          {/* Smart Related Articles - Mobile/Tablet */}
          <div className="xl:hidden mt-12">
            <SmartRelatedArticles 
              currentArticleId={article.id.toString()}
              categoryId={category.id.toString()}
              tags={tags}
              maxArticles={6}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}