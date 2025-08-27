import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { sanitizeHtml } from '@/utils/htmlSanitizer';
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { getDataAdapter } from '@/lib/data-adapter';
import { generateArticleUrl, generateCategoryUrl, generateCanonicalUrl, generateBreadcrumbItems, isReservedPath } from '@/utils/urlGenerator';
import { initializeLazyImages } from '@/utils/lazyImages';
import { useSettings } from '@/hooks/useSettings';
import { useSSRSafeQuery } from '@/hooks/useSSRSafeData';
import type { Article, Category, Tag } from '@/types/admin';
import { Clock, Eye, Tag as TagIcon, ChevronRight, User, Heart, Share2, BookOpen, Home, Menu, List } from 'lucide-react';
import { ArticleFAQSection } from '@/components/ArticleFAQSection';

interface ArticleSiloProps {
  ssrData?: {
    article: Article;
    category: Category;
    tags: Tag[];
  };
}
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { handleArticleLike, handleArticleShare, isArticleLiked } from '@/utils/articleActions';
import AdminComments from '@/components/AdminComments';
import { useAuth } from '@/hooks/useAuth';

export default function ArticleSilo({ ssrData }: ArticleSiloProps) {
  const { categorySlug, articleSlug } = useParams<{ categorySlug: string; articleSlug: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [notFound, setNotFound] = useState(false);
  const [liked, setLiked] = useState(false);
  const { seo } = useSettings();

  // SSR-safe data fetching for article data
  const { data: articleData, isLoading: loading } = useSSRSafeQuery(
    ['article', categorySlug, articleSlug],
    async () => {
      if (!categorySlug || !articleSlug) return null;
      
      // Check if category slug is reserved
      if (isReservedPath(categorySlug)) {
        throw new Error('Reserved path');
      }

      const adapter = await getDataAdapter();
      
      // Load category first
      const categories = await adapter.getCategories();
      const foundCategory = categories.find(c => c.slug === categorySlug && c.is_active);
      
      if (!foundCategory) {
        throw new Error('Category not found');
      }

      // Load article within this category
      const articles = await adapter.getArticles();
      const foundArticle = articles.find(
        a => a.slug === articleSlug && 
             a.category_id === foundCategory.id && 
             a.status === 'published'
      );

      if (!foundArticle) {
        throw new Error('Article not found');
      }

      return {
        article: foundArticle,
        category: foundCategory,
        tags: [] // Simplified for now
      };
    },
    ssrData,
    {
      enabled: !!(categorySlug && articleSlug),
    }
  );

  const article = articleData?.article || null;
  const category = articleData?.category || null;
  const tags = articleData?.tags || [];

  useEffect(() => {
    if (!categorySlug || !articleSlug) {
      navigate('/', { replace: true });
      return;
    }
  }, [categorySlug, articleSlug, navigate]);

  // Initialize effects for article interactions
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
      
      // Note: In SSR mode, we don't update local state as data is managed by React Query
      console.log(`View count incremented for article ${article.id}`);
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
  
  // Get SEO image data - prioritize structured seo_image, fallback to og_image, then default
  const getSEOImageData = () => {
    if (article.seo_image && article.seo_image.url) {
      return {
        url: article.seo_image.url,
        width: article.seo_image.width,
        height: article.seo_image.height,
        alt: article.seo_image.alt
      };
    }
    
    if (article.og_image) {
      return {
        url: article.og_image,
        width: undefined,
        height: undefined,
        alt: undefined
      };
    }
    
    return {
      url: "https://ajuda.modopag.com.br/og-default.jpg",
      width: 1200,
      height: 630,
      alt: "modoPAG Central de Ajuda"
    };
  };

  const seoImageData = getSEOImageData();
  
  // Enhanced structured data for article with proper image object
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
    "image": seoImageData.width && seoImageData.height ? {
      "@type": "ImageObject",
      "url": seoImageData.url,
      "width": seoImageData.width,
      "height": seoImageData.height,
      "name": seoImageData.alt || article.title,
      "contentUrl": seoImageData.url
    } : seoImageData.url,
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
    // FIXED: Removed overflow-hidden which was preventing sticky positioning
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      
      <SEOHelmet
        title={seoTitle}
        description={seoDescription}
        canonicalUrl={canonicalUrl}
        jsonLd={jsonLd}
        ogTitle={article.og_title || article.title}
        ogDescription={article.og_description || seoDescription}
        ogImage={seoImageData.url}
        ogImageWidth={seoImageData.width}
        ogImageHeight={seoImageData.height}
        ogType="article"
      />

      <Header />
      <SkipLink />

      {/* Mobile Sidebar Toggle - Fixed Position */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button 
              size="icon" 
              className="w-14 h-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground"
              aria-label="Abrir índice e artigos relacionados"
            >
              <List className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[90vw] sm:w-[400px] overflow-y-auto">
            <SheetHeader className="mb-6">
              <SheetTitle className="text-left flex items-center gap-2">
                <List className="w-5 h-5" />
                Navegação do Artigo
              </SheetTitle>
            </SheetHeader>
            
            <div className="space-y-6">
              {/* Mobile Table of Contents */}
              <div>
                <h3 className="font-semibold text-sm mb-3 text-foreground flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Índice do Artigo
                </h3>
                <TableOfContents mobileCollapsible={false} />
              </div>
              
              {/* Mobile Related Articles */}
              <div>
                <h3 className="font-semibold text-sm mb-3 text-foreground flex items-center gap-2">
                  <TagIcon className="w-4 h-4" />
                  Artigos Relacionados
                </h3>
                <SmartRelatedArticles 
                  currentArticleId={article.id.toString()}
                  categoryId={category.id.toString()}
                  tags={tags}
                  sidebarMode={true}
                  maxArticles={4}
                />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <main id="main-content" className="relative z-10 container mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-8">
        <div className="max-w-7xl mx-auto">
          {/* SEO Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-4 md:mb-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/" className="flex items-center gap-1.5">
                      <Home className="h-3.5 w-3.5" />
                      <span>Central de Ajuda</span>
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={generateCategoryUrl(category.slug)}>
                      {category.name}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{article.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </nav>

          {/* Responsive Layout */}
          <div className="flex flex-col lg:flex-row gap-4 md:gap-6 lg:gap-8">
            {/* Main Content - Takes full width on mobile, flexible on desktop */}
            <div className="flex-1 min-w-0 max-w-none">

              {/* Article Header - Responsive spacing and typography */}
              <header className="mb-6 md:mb-8 space-y-4 md:space-y-6">
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                    <Badge variant="secondary" className="font-medium text-xs md:text-sm">
                      {article.type}
                    </Badge>
                    <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-muted-foreground">
                      <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      <span>{article.reading_time_minutes || 5} min de leitura</span>
                    </div>
                  </div>
                  
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
                    {article.title}
                  </h1>
                  
                  {article.meta_description && (
                    <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-4xl">
                      {article.meta_description}
                    </p>
                  )}
                </div>

                {/* Article Meta - Responsive layout and touch-friendly buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 py-4 md:py-6 border-y border-border/50">
                  <div className="flex items-center gap-4 md:gap-6 text-xs md:text-sm text-muted-foreground overflow-x-auto">
                    <div className="flex items-center gap-1.5 md:gap-2 whitespace-nowrap">
                      <User className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                      <span className="text-xs md:text-sm">Atualizado em {new Date(article.updated_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center gap-1.5 md:gap-2 whitespace-nowrap">
                      <Eye className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                      <span className="text-xs md:text-sm">{article.view_count || 0} visualizações</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 md:gap-3">
                    <Button
                      size="sm" 
                      variant={liked ? "default" : "outline"} 
                      className="hover:bg-primary/5 hover:border-primary/20 min-h-[44px] px-3 md:px-4"
                      onClick={handleLike}
                      >
                      <Heart className={`w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2 ${liked ? "fill-current" : ""}`} />
                      <span className="text-xs md:text-sm">{liked ? "Curtido" : "Curtir"}</span>
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="hover:bg-accent/5 hover:border-accent/20 min-h-[44px] px-3 md:px-4"
                      onClick={handleShare}
                    >
                      <Share2 className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" />
                      <span className="text-xs md:text-sm">Compartilhar</span>
                    </Button>
                  </div>
                </div>
              </header>

              {/* Article Content - Responsive padding */}
              <Card className="mb-6 md:mb-8 border-0 shadow-xl bg-gradient-to-br from-card via-card to-card/80">
                <CardContent className="p-4 sm:p-6 md:p-8 lg:p-12">
                  <article 
                    className="prose prose-sm sm:prose-base lg:prose-lg max-w-none article-content lazy-images"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.content) }}
                  />
                </CardContent>
              </Card>

              {/* Article FAQs Section */}
              <ArticleFAQSection articleId={article.id.toString()} />

              {/* Article Footer */}
              <div className="space-y-6 md:space-y-8 lg:space-y-12">
                {/* Tags */}
                {tags.length > 0 && (
                  <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                    <span className="text-xs md:text-sm font-medium text-muted-foreground">Tags:</span>
                    {tags.map((tag) => (
                      <Badge key={tag.id} variant="outline" className="hover:bg-primary/10 transition-colors text-xs">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Feedback */}
                <ArticleFeedback articleId={article.id.toString()} />

                {/* Admin Comments - Only visible to authenticated admins */}
                {isAdmin() && (
                  <AdminComments articleId={article.id.toString()} />
                )}
              </div>
            </div>

            {/* Sticky Sidebar - Desktop only - Responsive width */}
            <div className="hidden lg:block w-72 xl:w-80 flex-shrink-0">
              <div className="sticky top-20 xl:top-24 flex flex-col gap-4 xl:gap-6" style={{ maxHeight: 'calc(100vh - 6rem)' }}>
                {/* Table of Contents - Natural height, no scrollbar */}
                <div className="flex-shrink-0">
                  <TableOfContents />
                </div>
                
                {/* Smart Related Articles - Takes remaining space */}
                <div className="flex-1 min-h-0 overflow-hidden">
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
          </div>

          {/* REMOVED: Mobile TOC section - now accessible via floating button */}
        </div>
      </main>

      <Footer />
    </div>
  );
}