import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Plus, User, MessageCircle, ThumbsDown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { AuthService } from '@/lib/auth';
import type { Feedback } from '@/types/admin';

interface Comment {
  id: string;
  content: string;
  author: string;
  createdAt: string;
}

interface AdminCommentsProps {
  articleId: string;
}

const AdminComments = ({ articleId }: AdminCommentsProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [userFeedback, setUserFeedback] = useState<Feedback[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'comments' | 'feedback'>('comments');

  // Only show for authenticated admin users
  const currentUser = AuthService.getCurrentUser();
  if (!currentUser || currentUser.role !== 'admin') {
    return null;
  }

  // Load user feedback
  useEffect(() => {
    const loadUserFeedback = async () => {
      try {
        const { getDataAdapter } = await import('@/lib/data-adapter');
        const adapter = await getDataAdapter();
        const feedback = await adapter.getFeedback(articleId);
        setUserFeedback(feedback.filter(f => f.comment && f.comment.trim() && !f.is_helpful));
      } catch (error) {
        console.error('Error loading user feedback:', error);
      }
    };

    if (articleId) {
      loadUserFeedback();
    }
  }, [articleId]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setIsAddingComment(true);
    try {
      // Mock implementation - replace with real API call
      const comment: Comment = {
        id: Date.now().toString(),
        content: newComment,
        author: 'Admin',
        createdAt: new Date().toISOString()
      };

      setComments([comment, ...comments]);
      setNewComment('');
      setShowForm(false);
      
      toast({
        title: "Comentário adicionado",
        description: "O comentário interno foi salvo com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar o comentário.",
        variant: "destructive"
      });
    } finally {
      setIsAddingComment(false);
    }
  };

  return (
    <Card className="border-dashed border-primary/30 bg-primary/5">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          Painel Administrativo
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'comments' | 'feedback')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="comments" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Comentários Internos
              <Badge variant="secondary" className="text-xs ml-1">
                {comments.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center gap-2">
              <ThumbsDown className="w-4 h-4" />
              Feedback de Usuários
              <Badge variant="secondary" className="text-xs ml-1">
                {userFeedback.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="comments" className="mt-6">
            {!showForm && (
              <Button
                size="sm"
                onClick={() => setShowForm(true)}
                className="bg-primary/10 text-primary hover:bg-primary/20 mb-4"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Comentário
              </Button>
            )}

            {showForm && (
              <div className="mb-6 space-y-3 p-4 bg-background/50 rounded-lg border border-border">
                <Textarea
                  placeholder="Adicionar comentário interno sobre este artigo..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[80px]"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || isAddingComment}
                    size="sm"
                  >
                    {isAddingComment ? 'Salvando...' : 'Salvar'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setNewComment('');
                    }}
                    size="sm"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            {comments.length > 0 ? (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-3 bg-background/30 rounded-lg border border-border/50"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{comment.author}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleDateString('pt-BR')} às{' '}
                        {new Date(comment.createdAt).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{comment.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum comentário interno ainda. Use comentários para observações internas sobre este artigo.
              </p>
            )}
          </TabsContent>

          <TabsContent value="feedback" className="mt-6">
            {userFeedback.length > 0 ? (
              <div className="space-y-4">
                {userFeedback.map((feedback) => (
                  <div
                    key={feedback.id}
                    className="p-4 bg-destructive/5 rounded-lg border border-destructive/20"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <ThumbsDown className="w-4 h-4 text-destructive" />
                      <span className="text-sm font-medium text-destructive">
                        Feedback Negativo
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(feedback.created_at).toLocaleDateString('pt-BR')} às{' '}
                        {new Date(feedback.created_at).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-foreground bg-background/50 p-3 rounded border">{feedback.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum feedback com comentário ainda. Os usuários podem deixar comentários quando avaliam negativamente o artigo.
              </p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AdminComments;