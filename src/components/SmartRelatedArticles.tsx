import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight, TrendingUp, Star, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getDataAdapter } from '@/lib/data-adapter';
import { generateArticleUrl } from '@/utils/urlGenerator';
import { cn } from '@/lib/utils';
import type { Article, Category, Tag } from '@/types/admin';

interface SmartRelatedArticlesProps {
  currentArticleId: string;
  categoryId: string;
  tags?: Tag[];
  className?: string;
  maxArticles?: number;
  sidebarMode?: boolean;
}

interface ScoredArticle {
  article: Article;
  score: number;
  reasons: string[];
}

export function SmartRelatedArticles({ 
  currentArticleId, 
  categoryId,
  tags = [],
  className,
  maxArticles = 5,
  sidebarMode = false
}: SmartRelatedArticlesProps) {
  const [relatedArticles, setRelatedArticles] = useState<ScoredArticle[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    loadSmartRelatedArticles();
  }, [currentArticleId, categoryId, tags, maxArticles]);

  const loadSmartRelatedArticles = async () => {
    setIsLoading(true);
    try {
      const adapter = await getDataAdapter();
      
      // Load categories, articles, and current article details
      const [allCategories, allArticles, currentArticle] = await Promise.all([
        adapter.getCategories(),
        adapter.getArticles({ status: 'published' }),
        adapter.getArticleById(currentArticleId).catch(() => null)
      ]);
      
      setCategories(allCategories);
      
      // Filter out current article
      const candidateArticles = allArticles.filter(
        article => article.id !== currentArticleId
      );

      if (candidateArticles.length === 0) {
        setRelatedArticles([]);
        return;
      }

      // Score articles using enhanced algorithm
      const scoredArticles: ScoredArticle[] = candidateArticles.map(article => {
        const reasons: string[] = [];
        let score = 0;

        // Same category (30% weight)
        if (article.category_id === categoryId) {
          score += 30;
          reasons.push('Mesma categoria');
        }

        // Content similarity (40% weight) - improved algorithm
        if (tags.length > 0) {
          // Title keyword matching
          const titleWords = article.title.toLowerCase().split(/\s+/);
          const tagNames = tags.map(t => t.name.toLowerCase());
          const titleMatches = titleWords.filter(word => 
            tagNames.some(tag => tag.includes(word) || word.includes(tag))
          ).length;
          
          if (titleMatches > 0) {
            const titleScore = Math.min(titleMatches / titleWords.length, 0.4) * 40;
            score += titleScore;
            reasons.push('Palavras-chave similares');
          }

          // Description similarity
          if (article.meta_description && currentArticle?.meta_description) {
            const commonWords = article.meta_description.toLowerCase()
              .split(/\s+/)
              .filter(word => word.length > 3 && 
                currentArticle.meta_description?.toLowerCase().includes(word)
              ).length;
            
            if (commonWords > 2) {
              score += Math.min(commonWords * 2, 15);
              reasons.push('Conteúdo relacionado');
            }
          }
        }

        // Popularity score (20% weight) - enhanced
        const viewCount = article.view_count || 0;
        const avgViews = Math.max(candidateArticles.reduce((sum, a) => sum + (a.view_count || 0), 0) / candidateArticles.length, 1);
        const viewScore = Math.min((viewCount / avgViews), 2) * 10;
        score += viewScore;
        
        if (viewCount > avgViews * 1.5) {
          reasons.push('Artigo popular');
        }

        // Recency bonus (10% weight)
        const articleDate = new Date(article.updated_at);
        const daysOld = Math.floor((Date.now() - articleDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysOld <= 7) {
          score += 10;
          reasons.push('Recém atualizado');
        } else if (daysOld <= 30) {
          score += 5;
          reasons.push('Conteúdo recente');
        }

        // Reading time similarity bonus
        const currentReadingTime = currentArticle?.reading_time_minutes || 5;
        const timeDiff = Math.abs((article.reading_time_minutes || 5) - currentReadingTime);
        if (timeDiff <= 2) {
          score += 5;
          reasons.push('Tempo de leitura similar');
        }

        // Article type bonuses
        if (article.type === 'tutorial') {
          score += 5;
          reasons.push('Tutorial prático');
        } else if (article.type === 'artigo' && currentArticle?.type === 'artigo') {
          score += 3;
          reasons.push('Mesmo tipo de conteúdo');
        }

        // Quality indicators
        if (article.meta_description && article.meta_description.length > 100) {
          score += 2; // Well-documented articles
        }

        return { article, score, reasons };
      });

      // Sort by score and apply diversity filter
      scoredArticles.sort((a, b) => b.score - a.score);
      
      // Ensure variety in results - don't show all from same category
      const diverseArticles: ScoredArticle[] = [];
      const categoryCount: Record<string, number> = {};
      
      for (const scoredArticle of scoredArticles) {
        const catId = scoredArticle.article.category_id;
        const currentCatCount = categoryCount[catId] || 0;
        
        if (currentCatCount < 2 || diverseArticles.length < maxArticles) {
          diverseArticles.push(scoredArticle);
          categoryCount[catId] = currentCatCount + 1;
          
          if (diverseArticles.length >= maxArticles * 2) break;
        }
      }
      
      setRelatedArticles(diverseArticles);
    } catch (error) {
      console.error('Erro ao carregar artigos relacionados:', error);
      setRelatedArticles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreIcon = (score: number) => {
    if (score >= 50) return <Star className="w-3 h-3 text-yellow-500" />;
    if (score >= 30) return <TrendingUp className="w-3 h-3 text-primary" />;
    return <Eye className="w-3 h-3 text-muted-foreground" />;
  };

  const getScoreColor = (score: number) => {
    if (score >= 50) return "border-yellow-500/20 bg-yellow-500/5";
    if (score >= 30) return "border-primary/20 bg-primary/5";
    return "border-muted/20 bg-muted/5";
  };

  const displayedArticles = showAll 
    ? relatedArticles 
    : relatedArticles.slice(0, sidebarMode ? 3 : maxArticles);

  if (isLoading) {
    return (
      <div className={cn("space-y-3", className)}>
        {Array.from({ length: sidebarMode ? 3 : maxArticles }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-muted rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (relatedArticles.length === 0) return null;

  if (sidebarMode) {
    return (
      <Card className={cn("border-accent/20 bg-gradient-to-br from-accent/5 to-primary/5 h-full flex flex-col", className)}>
        <div className="p-4 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-4 flex-shrink-0">
            <TrendingUp className="w-4 h-4 text-accent" />
            <h3 className="font-semibold text-sm text-foreground">
              Relacionados
            </h3>
            <div className="flex-1 h-px bg-gradient-to-r from-accent/30 to-transparent" />
          </div>
          {/* FIXED: Flexible scrollable area */}
          <ScrollArea className="flex-1 min-h-0">
            <div className="space-y-3 pr-2">
              {displayedArticles.map(({ article, score, reasons }) => {
                const category = categories.find(c => c.id === article.category_id);
                return (
                  <Link
                    key={article.id}
                    to={generateArticleUrl(category?.slug || '', article.slug)}
                    className="group block"
                  >
                    <div className={cn(
                      "p-3 rounded-lg border transition-all duration-300 hover:scale-[1.02] hover:shadow-md",
                      getScoreColor(score),
                      "hover:border-accent/40"
                    )}>
                      <div className="flex items-start gap-2 mb-2">
                        {getScoreIcon(score)}
                        <h4 className="text-xs font-medium line-clamp-2 group-hover:text-accent transition-colors">
                          {article.title}
                        </h4>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {article.reading_time_minutes || 5}min
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      </div>

                      {reasons.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          <Badge 
                            variant="outline" 
                            className="text-[10px] px-1 py-0 h-4 border-accent/30 text-accent/80"
                          >
                            {reasons[0]}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </ScrollArea>

          {relatedArticles.length > 3 && !showAll && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowAll(true)}
              className="w-full mt-3 text-xs hover:bg-accent/10"
            >
              Ver mais {relatedArticles.length - 3} artigos
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <section className={cn("mt-12 pt-8 border-t border-border/50", className)}>
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="w-5 h-5 text-accent" />
        <h2 className="text-2xl font-bold text-foreground bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
          Conteúdos relacionados inteligentes
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedArticles.map(({ article, score, reasons }) => {
          const category = categories.find(c => c.id === article.category_id);
          return (
            <Card key={article.id} className={cn(
              "group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 overflow-hidden",
              getScoreColor(score)
            )}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getScoreIcon(score)}
                    <Badge variant="outline" className="text-[10px] px-2 py-1">
                      {article.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {article.reading_time_minutes || 5}min
                  </div>
                </div>
                
                <h3 className="font-semibold text-sm line-clamp-2 mb-3 leading-relaxed group-hover:text-accent transition-colors">
                  <Link 
                    to={generateArticleUrl(category?.slug || '', article.slug)}
                    className="hover:underline"
                  >
                    {article.title}
                  </Link>
                </h3>

                {reasons.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {reasons.slice(0, 2).map((reason, index) => (
                      <Badge 
                        key={index}
                        variant="outline" 
                        className="text-[9px] px-1.5 py-0.5 h-5 border-accent/30 text-accent/80"
                      >
                        {reason}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{category?.name}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity text-accent">
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {relatedArticles.length > maxArticles && !showAll && (
        <div className="text-center mt-8">
          <Button
            onClick={() => setShowAll(true)}
            variant="outline"
            className="hover:bg-accent/10 hover:border-accent/30"
          >
            Ver mais {relatedArticles.length - maxArticles} artigos relacionados
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </section>
  );
}