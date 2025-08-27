import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Move } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { getDataAdapter } from '@/lib/data-adapter';
import type { ArticleFAQ } from '@/types/admin';

interface ArticleFAQManagerProps {
  articleId: string;
}

export function ArticleFAQManager({ articleId }: ArticleFAQManagerProps) {
  const [faqs, setFaqs] = useState<ArticleFAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<ArticleFAQ | null>(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    position: 0,
    is_active: true
  });
  const { toast } = useToast();

  useEffect(() => {
    loadFAQs();
  }, [articleId]);

  const loadFAQs = async () => {
    try {
      const adapter = await getDataAdapter();
      const data = await adapter.getArticleFAQs(articleId);
      setFaqs(data);
    } catch (error) {
      console.error('Error loading article FAQs:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as FAQs do artigo.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFAQ = async () => {
    try {
      const adapter = await getDataAdapter();
      const maxPosition = faqs.length > 0 ? Math.max(...faqs.map(f => f.position)) : -1;
      
      await adapter.createArticleFAQ({
        article_id: articleId,
        question: formData.question,
        answer: formData.answer,
        position: maxPosition + 1,
        is_active: formData.is_active
      });

      toast({
        title: 'Sucesso',
        description: 'FAQ criada com sucesso.',
      });

      resetForm();
      setIsDialogOpen(false);
      loadFAQs();
    } catch (error) {
      console.error('Error creating FAQ:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar a FAQ.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateFAQ = async () => {
    if (!editingFAQ) return;

    try {
      const adapter = await getDataAdapter();
      await adapter.updateArticleFAQ(editingFAQ.id, {
        question: formData.question,
        answer: formData.answer,
        is_active: formData.is_active
      });

      toast({
        title: 'Sucesso',
        description: 'FAQ atualizada com sucesso.',
      });

      resetForm();
      setIsDialogOpen(false);
      loadFAQs();
    } catch (error) {
      console.error('Error updating FAQ:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a FAQ.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteFAQ = async (id: string) => {
    try {
      const adapter = await getDataAdapter();
      await adapter.deleteArticleFAQ(id);

      toast({
        title: 'Sucesso',
        description: 'FAQ excluída com sucesso.',
      });

      loadFAQs();
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a FAQ.',
        variant: 'destructive',
      });
    }
  };

  const openCreateDialog = () => {
    resetForm();
    setEditingFAQ(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (faq: ArticleFAQ) => {
    setFormData({
      question: faq.question,
      answer: faq.answer,
      position: faq.position,
      is_active: faq.is_active
    });
    setEditingFAQ(faq);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      question: '',
      answer: '',
      position: 0,
      is_active: true
    });
    setEditingFAQ(null);
  };

  if (loading) {
    return <div>Carregando FAQs...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium">FAQs do Artigo</h3>
          <Badge variant="secondary">{faqs.length}</Badge>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nova FAQ
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingFAQ ? 'Editar FAQ' : 'Nova FAQ'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="question">Pergunta</Label>
                <Input
                  id="question"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="Digite a pergunta..."
                />
              </div>
              
              <div>
                <Label htmlFor="answer">Resposta</Label>
                <Textarea
                  id="answer"
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  placeholder="Digite a resposta..."
                  rows={4}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  id="is_active"
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <Label htmlFor="is_active">Ativa</Label>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={editingFAQ ? handleUpdateFAQ : handleCreateFAQ}
                disabled={!formData.question.trim() || !formData.answer.trim()}
              >
                {editingFAQ ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {faqs.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-muted-foreground">
                <p>Nenhuma FAQ encontrada para este artigo.</p>
                <p className="text-sm mt-1">Clique em "Nova FAQ" para adicionar a primeira.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          faqs.map((faq) => (
            <Card key={faq.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-base font-medium">
                      {faq.question}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={faq.is_active ? 'default' : 'secondary'}>
                        {faq.is_active ? 'Ativa' : 'Inativa'}
                      </Badge>
                      <Badge variant="outline">Posição {faq.position}</Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(faq)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir esta FAQ? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteFAQ(faq.id)}>
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {faq.answer}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}