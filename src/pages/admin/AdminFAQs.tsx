import { useState } from 'react';
import { Plus, Edit, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFAQs } from '@/hooks/useFAQs';
import { getDataAdapter } from '@/lib/data-adapter';
import { toast } from 'sonner';
import type { FAQ } from '@/types/admin';

const faqSchema = z.object({
  question: z.string().min(10, 'A pergunta deve ter pelo menos 10 caracteres'),
  answer: z.string().min(20, 'A resposta deve ter pelo menos 20 caracteres'),
  category: z.string().min(1, 'Selecione uma categoria'),
  position: z.number().min(0, 'A posição deve ser um número positivo'),
  is_active: z.boolean()
});

type FAQFormData = z.infer<typeof faqSchema>;

const FAQ_CATEGORIES = [
  { value: 'geral', label: 'Geral' },
  { value: 'taxas', label: 'Taxas' },
  { value: 'maquininha', label: 'Maquininha' },
  { value: 'seguranca', label: 'Segurança' },
  { value: 'conta-digital', label: 'Conta Digital' },
  { value: 'suporte', label: 'Suporte' }
];

export default function AdminFAQs() {
  const { faqs, loading, refetch } = useFAQs();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);

  const form = useForm<FAQFormData>({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      question: '',
      answer: '',
      category: 'geral',
      position: 0,
      is_active: true
    }
  });

  const handleCreateFAQ = async (data: FAQFormData) => {
    try {
      const adapter = await getDataAdapter();
      // Ensure all required fields are provided
      const faqData: Omit<FAQ, 'id' | 'created_at' | 'updated_at'> = {
        question: data.question,
        answer: data.answer,
        category: data.category,
        position: data.position,
        is_active: data.is_active
      };
      await adapter.createFAQ(faqData);
      toast.success('FAQ criado com sucesso!');
      setIsDialogOpen(false);
      form.reset();
      refetch();
    } catch (error) {
      console.error('Error creating FAQ:', error);
      toast.error('Erro ao criar FAQ');
    }
  };

  const handleUpdateFAQ = async (data: FAQFormData) => {
    if (!editingFAQ) return;
    
    try {
      const adapter = await getDataAdapter();
      await adapter.updateFAQ(editingFAQ.id, data);
      toast.success('FAQ atualizado com sucesso!');
      setIsDialogOpen(false);
      setEditingFAQ(null);
      form.reset();
      refetch();
    } catch (error) {
      console.error('Error updating FAQ:', error);
      toast.error('Erro ao atualizar FAQ');
    }
  };

  const handleDeleteFAQ = async (id: string) => {
    try {
      const adapter = await getDataAdapter();
      await adapter.deleteFAQ(id);
      toast.success('FAQ excluído com sucesso!');
      refetch();
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      toast.error('Erro ao excluir FAQ');
    }
  };

  const openEditDialog = (faq: FAQ) => {
    setEditingFAQ(faq);
    form.reset({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      position: faq.position,
      is_active: faq.is_active
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingFAQ(null);
    form.reset({
      question: '',
      answer: '',
      category: 'geral',
      position: faqs.length,
      is_active: true
    });
    setIsDialogOpen(true);
  };

  const getCategoryLabel = (value: string) => {
    return FAQ_CATEGORIES.find(cat => cat.value === value)?.label || value;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">FAQs</h1>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Carregando FAQs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">FAQs</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Novo FAQ
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingFAQ ? 'Editar FAQ' : 'Criar Novo FAQ'}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(editingFAQ ? handleUpdateFAQ : handleCreateFAQ)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="question"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pergunta</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite a pergunta..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="answer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resposta</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Digite a resposta..." 
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma categoria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {FAQ_CATEGORIES.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Posição</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          FAQ Ativo
                        </FormLabel>
                        <p className="text-sm text-muted-foreground">
                          FAQs inativos não aparecerão no site
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingFAQ ? 'Atualizar' : 'Criar'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {faqs.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">Nenhum FAQ encontrado.</p>
            </CardContent>
          </Card>
        ) : (
          faqs.map((faq) => (
            <Card key={faq.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="secondary">{getCategoryLabel(faq.category)}</Badge>
                    <Badge variant={faq.is_active ? "default" : "secondary"}>
                      {faq.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Posição: {faq.position}
                    </span>
                  </div>
                  <CardTitle className="text-lg leading-tight">
                    {faq.question}
                  </CardTitle>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(faq)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir este FAQ? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteFAQ(faq.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
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