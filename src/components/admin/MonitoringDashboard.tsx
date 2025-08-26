import { useEffect, useState } from 'react';
import { AlertTriangle, Search, ThumbsDown, FileX, TrendingUp, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { monitoring } from '@/utils/monitoring';
import { getHighPriorityContent, generateContentRoadmap } from '@/utils/contentBacklog';

export const MonitoringDashboard = () => {
  const [report, setReport] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    setRefreshing(true);
    // Simulate async data loading
    setTimeout(() => {
      const newReport = monitoring.getReport();
      setReport(newReport);
      setRefreshing(false);
    }, 500);
  };

  const highPriorityContent = getHighPriorityContent();
  const contentRoadmap = generateContentRoadmap();

  if (!report) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Monitoramento & Insights</h2>
          <p className="text-muted-foreground">
            Acompanhe problemas e oportunidades de melhoria (últimas 24h)
          </p>
        </div>
        <Button 
          onClick={loadReport} 
          disabled={refreshing}
          size="sm"
        >
          {refreshing ? 'Atualizando...' : 'Atualizar'}
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Erros</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.errors}</div>
            <p className="text-xs text-muted-foreground">
              Erros JavaScript/Rede
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Buscas Vazias</CardTitle>
            <Search className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.emptySearches}</div>
            <p className="text-xs text-muted-foreground">
              Oportunidades de conteúdo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Feedback Baixo</CardTitle>
            <ThumbsDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.lowFeedback}</div>
            <p className="text-xs text-muted-foreground">
              Artigos para revisar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">404s</CardTitle>
            <FileX className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.pageNotFound}</div>
            <p className="text-xs text-muted-foreground">
              Páginas não encontradas
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="searches" className="space-y-4">
        <TabsList>
          <TabsTrigger value="searches">Buscas Sem Resultado</TabsTrigger>
          <TabsTrigger value="articles">Artigos Problemáticos</TabsTrigger>
          <TabsTrigger value="404s">404s Comuns</TabsTrigger>
          <TabsTrigger value="content">Roadmap de Conteúdo</TabsTrigger>
        </TabsList>

        <TabsContent value="searches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Buscas Sem Resultado</CardTitle>
              <CardDescription>
                Termos mais buscados que não retornaram resultados - oportunidades de criar conteúdo
              </CardDescription>
            </CardHeader>
            <CardContent>
              {report.topEmptySearches.length > 0 ? (
                <div className="space-y-3">
                  {report.topEmptySearches.map((search: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{search.count}x</Badge>
                        <span className="font-medium">"{search.query}"</span>
                      </div>
                      <Button size="sm" variant="outline">
                        Criar Artigo
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  🎉 Todas as buscas retornaram resultados!
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="articles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Artigos com Mais Feedback Negativo</CardTitle>
              <CardDescription>
                Artigos que receberam mais "não foi útil" - precisam de revisão
              </CardDescription>
            </CardHeader>
            <CardContent>
              {report.mostProblematicArticles.length > 0 ? (
                <div className="space-y-3">
                  {report.mostProblematicArticles.map((article: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="destructive">{article.count} 👎</Badge>
                        <span className="font-medium">Artigo #{article.articleId}</span>
                      </div>
                      <Button size="sm" variant="outline">
                        Revisar
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  ✨ Todos os artigos estão com bom feedback!
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="404s" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>404s Mais Comuns</CardTitle>
              <CardDescription>
                URLs mais acessadas que resultaram em 404 - considere criar redirects
              </CardDescription>
            </CardHeader>
            <CardContent>
              {report.common404s.length > 0 ? (
                <div className="space-y-3">
                  {report.common404s.map((path: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{path.count}x</Badge>
                        <code className="text-sm bg-muted px-2 py-1 rounded">{path.path}</code>
                      </div>
                      <Button size="sm" variant="outline">
                        Criar Redirect
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  🎯 Nenhum 404 recorrente detectado!
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Conteúdo Prioritário
                </CardTitle>
                <CardDescription>
                  Artigos mais importantes para criar primeiro
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {highPriorityContent.map((item, index) => (
                    <div key={item.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="destructive" className="text-xs">ALTA</Badge>
                        <span className="text-xs text-muted-foreground">{item.estimatedReadingTime}min</span>
                      </div>
                      <h4 className="font-medium text-sm mb-1">{item.title}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{item.description}</p>
                      <Badge variant="outline" className="text-xs">{item.category}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Roadmap (4 Semanas)
                </CardTitle>
                <CardDescription>
                  Cronograma sugerido de criação de conteúdo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(contentRoadmap).slice(0, 4).map(([week, items]: [string, any[]]) => (
                    <div key={week} className="border-l-2 border-primary pl-4">
                      <h4 className="font-medium mb-2 capitalize">
                        {week.replace('week', 'Semana ')}
                      </h4>
                      <div className="space-y-1">
                        {items.slice(0, 3).map((item, index) => (
                          <div key={index} className="text-sm text-muted-foreground">
                            • {item.title}
                          </div>
                        ))}
                        {items.length > 3 && (
                          <div className="text-xs text-muted-foreground">
                            +{items.length - 3} mais...
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};