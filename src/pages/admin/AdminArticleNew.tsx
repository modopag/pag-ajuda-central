import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { getDataAdapter } from '@/lib/data-adapter';
import type { Category } from '@/types/admin';

export default function AdminArticleNew() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(true);

  useEffect(() => {
    createDraftArticle();
  }, []);

  const createDraftArticle = async () => {
    try {
      const adapter = await getDataAdapter();
      
      // Obter primeira categoria ativa para usar como padrão
      const categories = await adapter.getCategories();
      const firstCategory = categories.find(c => c.is_active);
      
      if (!firstCategory) {
        toast({
          title: "Erro ao criar artigo",
          description: "Nenhuma categoria ativa encontrada. Crie uma categoria primeiro.",
          variant: "destructive"
        });
        navigate('/admin/categories');
        return;
      }

      // Criar artigo rascunho imediatamente
      const draftArticle = await adapter.createArticle({
        title: 'Novo Artigo',
        slug: '', // Será gerado automaticamente pelo trigger
        content: '<p>Comece a escrever seu conteúdo aqui...</p>',
        status: 'draft',
        category_id: firstCategory.id,
        author: 'Admin',
        meta_title: '',
        meta_description: '',
        canonical_url: '',
        og_title: '',
        og_description: '',
        og_image: '',
        noindex: false,
        type: 'artigo',
        reading_time_minutes: 1,
        published_at: null
      });

      console.log('AdminArticleNew - created draft article:', draftArticle);

      toast({
        title: "Rascunho criado",
        description: "Artigo rascunho criado com sucesso. Agora você pode editá-lo."
      });

      // Redirecionar para o editor com o ID real
      navigate(`/admin/articles/${draftArticle.id}/edit`);
      
    } catch (error) {
      console.error('AdminArticleNew - error creating draft:', error);
      toast({
        title: "Erro ao criar artigo",
        description: "Não foi possível criar o rascunho. Tente novamente.",
        variant: "destructive"
      });
      navigate('/admin/articles');
    } finally {
      setIsCreating(false);
    }
  };

  if (isCreating) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Criando novo rascunho...</p>
        </div>
      </div>
    );
  }

  return null;
}