import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Tag as TagIcon, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RelatedArticlesSkeleton } from '@/components/skeletons/RelatedArticlesSkeleton';
import { getDataAdapter } from '@/lib/data-adapter';
import { generateArticleUrl, generateCategoryUrl } from '@/utils/urlGenerator';
import type { Article, Tag, Category } from '@/types/admin';

interface RelatedArticlesProps {
  currentArticleId: string;
  categoryId: string;
  maxArticles?: number;
}

export default function RelatedArticles({ 
  currentArticleId, 
  categoryId, 
  maxArticles = 3 
}: RelatedArticlesProps) {
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRelatedArticles = async () => {
      setIsLoading(true);
      try {
        const adapter = await getDataAdapter();
        
        // Load categories first
        const allCategories = await adapter.getCategories();
        setCategories(allCategories);
        
        // Get all published articles from the same category
        const categoryArticles = await adapter.getArticles({ 
          category_id: categoryId, 
          status: 'published' 
        });
        
        // Filter out current article
        const otherArticles = categoryArticles.filter(
          article => article.id !== currentArticleId
        );

        // Score articles by relevance (prioritize shared tags and recent updates)
        let scoredArticles = otherArticles.map(article => {
          let score = 1; // Base score for same category
          
          // Bonus for recent articles (within last 30 days)
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          const articleDate = new Date(article.updated_at);
          
          if (articleDate > thirtyDaysAgo) {
            score += 2;
          }
          
          // Bonus for higher view count
          score += Math.min(article.view_count / 100, 2);
          
          return { article, score };
        });

        // Sort by score and take top articles
        scoredArticles.sort((a, b) => b.score - a.score);
        let selectedArticles = scoredArticles.slice(0, maxArticles).map(item => item.article);
        
        // If not enough articles in same category, get from other categories
        if (selectedArticles.length < maxArticles) {
          const allArticles = await adapter.getArticles({ status: 'published' });
          const otherCategoryArticles = allArticles
            .filter(article => 
              article.id !== currentArticleId && 
              article.category_id !== categoryId
            )
            .sort((a, b) => b.view_count - a.view_count)
            .slice(0, maxArticles - selectedArticles.length);
          
          selectedArticles.push(...otherCategoryArticles);
        }
        
        setRelatedArticles(selectedArticles);
      } catch (error) {
        console.error('Erro ao carregar artigos relacionados:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRelatedArticles();
  }, [currentArticleId, categoryId, maxArticles]);

  // Format article content preview
  const getContentPreview = (content: string, maxLength = 120) => {
    const plainText = content.replace(/<[^>]*>/g, '').trim();
    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength).trim() + '...';
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: 'numeric',
      month: 'short'
    }).format(date);
  };

  if (isLoading) {
    return <RelatedArticlesSkeleton maxArticles={maxArticles} />;
  }

  if (relatedArticles.length === 0) {
    return null;
  }

  return (
    <section className="mt-12 pt-8 border-t">
      <h2 className="text-2xl font-bold text-foreground mb-6">
        Artigos relacionados
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {relatedArticles.map((article) => (
          <Card key={article.id} className="hover:shadow-lg transition-all duration-300 group">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Badge 
                  variant="outline" 
                  className="text-xs group-hover:border-primary transition-colors"
                >
                  {article.type}
                </Badge>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="w-3 h-3 mr-1" />
                  {article.reading_time_minutes} min
                </div>
              </div>
              <CardTitle className="line-clamp-2 leading-tight">
                <Link 
                  to={generateArticleUrl(categories.find(c => c.id === article.category_id)?.slug || '', article.slug)}
                  className="hover:text-primary transition-colors"
                >
                  {article.title}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                {getContentPreview(article.meta_description || article.content)}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Atualizado {formatDate(article.updated_at)}</span>
                <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Link to category */}
      <div className="mt-8 text-center">
        <Link 
          to={generateCategoryUrl(categories.find(c => c.id === categoryId)?.slug || '')}
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          Ver todos os artigos desta categoria
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </section>
  );
}