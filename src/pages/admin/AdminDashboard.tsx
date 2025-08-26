import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDataAdapter } from "@/lib/data-adapter";
import type { Article, Feedback, AnalyticsEvent } from "@/types/admin";
import {
  FileText,
  Eye,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  Users,
  Plus,
  ExternalLink,
} from "lucide-react";

interface DashboardStats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalViews: number;
  positiveFeedback: number;
  negativeFeedback: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    totalViews: 0,
    positiveFeedback: 0,
    negativeFeedback: 0,
  });
  
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [recentFeedback, setRecentFeedback] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const adapter = await getDataAdapter();
      
      // Load articles
      const articles = await adapter.getArticles();
      const published = articles.filter(a => a.status === 'published');
      const drafts = articles.filter(a => a.status === 'draft');
      const totalViews = articles.reduce((sum, article) => sum + article.view_count, 0);
      
      // Load feedback
      const feedback = await adapter.getFeedback();
      const positive = feedback.filter(f => f.is_helpful).length;
      const negative = feedback.filter(f => !f.is_helpful).length;
      
      // Recent articles (last 5)
      const recent = articles
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 5);
      
      // Recent feedback (last 5)  
      const recentFeedbackData = feedback.slice(0, 5);
      
      setStats({
        totalArticles: articles.length,
        publishedArticles: published.length,
        draftArticles: drafts.length,
        totalViews,
        positiveFeedback: positive,
        negativeFeedback: negative,
      });
      
      setRecentArticles(recent);
      setRecentFeedback(recentFeedbackData);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'published': return 'default';
      case 'draft': return 'secondary';
      case 'review': return 'outline';
      case 'archived': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published': return 'Publicado';
      case 'draft': return 'Rascunho';
      case 'review': return 'Revisão';
      case 'archived': return 'Arquivado';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-4"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral da Central de Ajuda modoPAG
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/admin/articles/new">
              <Plus className="w-4 h-4 mr-2" />
              Novo Artigo
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/" target="_blank">
              <ExternalLink className="w-4 h-4 mr-2" />
              Ver Site
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Artigos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalArticles}</div>
            <p className="text-xs text-muted-foreground">
              {stats.publishedArticles} publicados, {stats.draftArticles} rascunhos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visualizações</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Total de acessos aos artigos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Feedback Positivo</CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.positiveFeedback}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.positiveFeedback / (stats.positiveFeedback + stats.negativeFeedback)) * 100 || 0).toFixed(1)}% de satisfação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Feedback Negativo</CardTitle>
            <ThumbsDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.negativeFeedback}</div>
            <p className="text-xs text-muted-foreground">
              Oportunidades de melhoria
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Articles */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Artigos Recentes</CardTitle>
                <CardDescription>
                  Últimos artigos criados ou modificados
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/admin/articles">Ver Todos</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentArticles.length > 0 ? (
                recentArticles.map((article) => (
                  <div key={article.id} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/admin/articles/${article.id}/edit`}
                        className="font-medium text-foreground hover:text-primary truncate block"
                      >
                        {article.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={getStatusBadgeVariant(article.status)}>
                          {getStatusLabel(article.status)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {article.view_count} visualizações
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhum artigo encontrado</p>
                  <Button className="mt-2" size="sm" asChild>
                    <Link to="/admin/articles/new">Criar Primeiro Artigo</Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Feedback */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Feedback Recente</CardTitle>
                <CardDescription>
                  Últimos comentários dos usuários
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/admin/feedback">Ver Todos</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentFeedback.length > 0 ? (
                recentFeedback.map((feedback) => (
                  <div key={feedback.id} className="space-y-2">
                    <div className="flex items-center gap-2">
                      {feedback.is_helpful ? (
                        <ThumbsUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <ThumbsDown className="w-4 h-4 text-red-500" />
                      )}
                      <span className="text-sm font-medium">
                        {feedback.is_helpful ? 'Feedback Positivo' : 'Feedback Negativo'}
                      </span>
                    </div>
                    {feedback.comment && (
                      <p className="text-sm text-muted-foreground pl-6">
                        "{feedback.comment}"
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground pl-6">
                      {new Date(feedback.created_at).toLocaleDateString('pt-BR')} às{' '}
                      {new Date(feedback.created_at).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhum feedback recente</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Monitoring Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Performance & Acessibilidade</CardTitle>
              <CardDescription>
                Monitoramento de Core Web Vitals e otimizações
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/monitoring">Ver Detalhes</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <h4 className="font-medium text-green-600">✅ Implementações</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Service Worker ativo</li>
                <li>• Lazy loading de imagens</li>
                <li>• Otimização de bundles</li>
                <li>• Skip links para acessibilidade</li>
                <li>• Suporte a alto contraste</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-blue-600">📊 Core Web Vitals</h4>
              <p className="text-sm text-muted-foreground">
                Monitoramento automático de LCP, FID, CLS e outras métricas de performance em tempo real.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-purple-600">♿ Acessibilidade</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Navegação por teclado</li>
                <li>• Screen reader support</li>
                <li>• Contraste aprimorado</li>
                <li>• Focus management</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}