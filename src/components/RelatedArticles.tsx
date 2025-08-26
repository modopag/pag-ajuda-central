import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDataAdapter } from '@/lib/data-adapter';
import type { Article } from '@/types/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRelatedArticles = async () => {
      setIsLoading(true);
      try {
        const adapter = await getDataAdapter();
        
        // Buscar artigos da mesma categoria (excluindo o atual)
        const categoryArticles = await adapter.getArticles({ 
          category_id: categoryId, 
          status: 'published' 
        });
        
        const filtered = categoryArticles
          .filter(article => article.id !== currentArticleId)
          .slice(0, maxArticles);
        
        // Se não houver artigos suficientes na categoria, buscar de outras categorias
        if (filtered.length < maxArticles) {
          const allArticles = await adapter.getArticles({ status: 'published' });
          const otherArticles = allArticles
            .filter(article => 
              article.id !== currentArticleId && 
              article.category_id !== categoryId
            )
            .slice(0, maxArticles - filtered.length);
          
          filtered.push(...otherArticles);
        }
        
        setRelatedArticles(filtered);
      } catch (error) {
        console.error('Erro ao carregar artigos relacionados:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRelatedArticles();
  }, [currentArticleId, categoryId, maxArticles]);

  if (isLoading) {
    return (
      <section className="mt-12 pt-8 border-t">
        <h2 className="text-2xl font-bold text-foreground mb-6">
          Artigos relacionados
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: maxArticles }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-16 mb-2"></div>
                <div className="h-6 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
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
          <Card key={article.id} className="hover:shadow-lg transition-shadow">
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
              <CardDescription className="line-clamp-3">
                {article.meta_description || 
                 article.content.replace(/<[^>]*>/g, '').slice(0, 120) + '...'}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}