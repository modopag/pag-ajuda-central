import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Plus, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Comment {
  id: string;
  content: string;
  author: string;
  createdAt: string;
}

interface AdminCommentsProps {
  articleId: string;
  userRole?: string; // Will implement proper role checking later
}

const AdminComments = ({ articleId, userRole = 'admin' }: AdminCommentsProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Only show for admin users
  if (userRole !== 'admin') {
    return null;
  }

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
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Comentários Internos (Admin Only)
            <Badge variant="secondary" className="text-xs">
              {comments.length}
            </Badge>
          </CardTitle>
          {!showForm && (
            <Button
              size="sm"
              onClick={() => setShowForm(true)}
              className="bg-primary/10 text-primary hover:bg-primary/20"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
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
      </CardContent>
    </Card>
  );
};

export default AdminComments;