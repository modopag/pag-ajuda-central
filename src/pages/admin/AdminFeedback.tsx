import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getDataAdapter } from "@/lib/data-adapter";
import type { Feedback, Article } from "@/types/admin";

export default function AdminFeedback() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const adapter = await getDataAdapter();
      const [feedbackData, articlesData] = await Promise.all([
        adapter.getFeedback(),
        adapter.getArticles()
      ]);
      setFeedback(feedbackData);
      setArticles(articlesData);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar feedback",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getArticleTitle = (articleId: string) => {
    const article = articles.find(a => a.id === articleId);
    return article?.title || "Artigo não encontrado";
  };

  const filteredFeedback = feedback.filter(item => {
    const articleTitle = getArticleTitle(item.article_id);
    const matchesSearch = articleTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.comment && item.comment.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTab = activeTab === "all" ||
                      (activeTab === "positive" && item.is_helpful) ||
                      (activeTab === "negative" && !item.is_helpful) ||
                      (activeTab === "with_comment" && item.comment);
    
    return matchesSearch && matchesTab;
  });

  const stats = {
    total: feedback.length,
    positive: feedback.filter(f => f.is_helpful).length,
    negative: feedback.filter(f => !f.is_helpful).length,
    with_comment: feedback.filter(f => f.comment).length,
  };

  const positivePercentage = stats.total > 0 ? (stats.positive / stats.total * 100).toFixed(1) : '0';

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Feedback</h1>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Feedback</h1>
        <p className="text-muted-foreground">Acompanhe o feedback dos usuários sobre os artigos</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Avaliações</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avaliações Positivas</CardTitle>
            <ThumbsUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.positive}</div>
            <p className="text-xs text-muted-foreground">
              {positivePercentage}% do total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avaliações Negativas</CardTitle>
            <ThumbsDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.negative}</div>
            <p className="text-xs text-muted-foreground">
              {(100 - parseFloat(positivePercentage)).toFixed(1)}% do total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Com Comentários</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.with_comment}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? (stats.with_comment / stats.total * 100).toFixed(1) : '0'}% do total
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Feedback</CardTitle>
          <CardDescription>
            Visualize todas as avaliações dos usuários
          </CardDescription>
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por artigo ou comentário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">Todos ({stats.total})</TabsTrigger>
              <TabsTrigger value="positive">Positivos ({stats.positive})</TabsTrigger>
              <TabsTrigger value="negative">Negativos ({stats.negative})</TabsTrigger>
              <TabsTrigger value="with_comment">Com Comentário ({stats.with_comment})</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Artigo</TableHead>
                    <TableHead>Avaliação</TableHead>
                    <TableHead>Comentário</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFeedback.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {getArticleTitle(item.article_id)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.is_helpful ? "default" : "destructive"}>
                          {item.is_helpful ? (
                            <><ThumbsUp className="w-3 h-3 mr-1" /> Útil</>
                          ) : (
                            <><ThumbsDown className="w-3 h-3 mr-1" /> Não útil</>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        {item.comment ? (
                          <div className="truncate" title={item.comment}>
                            {item.comment}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(item.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.user_ip || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredFeedback.length === 0 && (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {searchTerm || activeTab !== "all" ? 'Nenhum feedback encontrado' : 'Nenhum feedback recebido ainda'}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}