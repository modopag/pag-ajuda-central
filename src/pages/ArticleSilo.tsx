import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { SEOHelmet } from '@/components/SEO/SEOHelmet';
import ArticleFeedback from '@/components/ArticleFeedback';
import RelatedArticles from '@/components/RelatedArticles';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getDataAdapter } from '@/lib/data-adapter';
import { generateArticleUrl, generateCategoryUrl, generateCanonicalUrl, generateBreadcrumbItems, isReservedPath } from '@/utils/urlGenerator';
import { initializeLazyImages } from '@/utils/lazyImages';
import { useSettings } from '@/hooks/useSettings';
import type { Article, Category, Tag } from '@/types/admin';
import { Clock, Eye, Tag as TagIcon, ChevronRight, User } from 'lucide-react';

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
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <Skeleton className="h-4 w-96" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (notFound || !article || !category || !categorySlug || !articleSlug) {
    navigate('/404', { replace: true });
    return null;
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
    <>
      <SEOHelmet
        title={seoTitle}
        description={seoDescription}
        canonicalUrl={canonicalUrl}
        jsonLd={jsonLd}
        ogTitle={article.title}
        ogDescription={seoDescription}
        ogType="article"
      />

      <main id="main-content" className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
            <li>
              <Link to="/" className="hover:text-primary transition-colors">
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

        {/* Article Header */}
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {category.name}
            </Badge>
            {tags.map((tag) => (
              <Badge key={tag.id} variant="outline" className="text-xs">
                <TagIcon className="w-3 h-3 mr-1" />
                {tag.name}
              </Badge>
            ))}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
            {article.title}
          </h1>

          {article.meta_description && (
            <p className="text-lg text-muted-foreground mb-6 max-w-3xl leading-relaxed">
              {article.meta_description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>Atualizado em {new Date(article.updated_at).toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{article.view_count} visualizações</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>Equipe modoPAG</span>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div 
              className="prose prose-lg max-w-none article-content lazy-images"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </CardContent>
        </Card>

        {/* Article Footer */}
        <div className="space-y-8">
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

          {/* Related Articles */}
          <RelatedArticles 
            currentArticleId={article.id.toString()}
            categoryId={category.id.toString()}
          />
        </div>
      </main>
    </>
  );
}