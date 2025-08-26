import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, AlertCircle, CheckCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { canPublish, type SEOData } from '@/utils/seoValidations';
import type { Article, Category } from '@/types/admin';

interface PreviewModalProps {
  article: Partial<Article>;
  categories?: Category[];
  onPublish: () => Promise<void>;
  isPublishing: boolean;
  disabled?: boolean;
}

export function PreviewModal({ article, categories = [], onPublish, isPublishing, disabled }: PreviewModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [publishValidation, setPublishValidation] = useState<{ canPublish: boolean; blockingErrors: string[] }>({
    canPublish: false,
    blockingErrors: []
  });

  // Gerar URL SILO correta
  const generateSiloUrl = (): string => {
    if (!article.slug || !article.category_id) return '/';
    
    const category = categories.find(c => c.id === article.category_id);
    return category ? `/${category.slug}/${article.slug}` : `/${article.slug}`;
  };

  useEffect(() => {
    if (article.title && article.content) {
      const seoData: SEOData = {
        title: article.title,
        metaTitle: article.meta_title,
        metaDescription: article.meta_description,
        slug: article.slug || '',
        content: article.content
      };
      
      setPublishValidation(canPublish(seoData));
    }
  }, [article]);

  const handlePublish = async () => {
    if (publishValidation.canPublish) {
      await onPublish();
      setIsOpen(false);
    }
  };

  // Remove HTML tags for preview
  const getPlainText = (html: string) => {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  };

  const contentPreview = getPlainText(article.content || '').substring(0, 300) + '...';
  const metaTitle = article.meta_title || article.title || '';
  const metaDescription = article.meta_description || '';

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          disabled={disabled}
          className="bg-green-600 hover:bg-green-700"
        >
          <Eye className="w-4 h-4 mr-2" />
          Preview & Publicar
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Preview - Como aparecerá no Google</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-6">
            {/* Google Preview */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="space-y-2">
                <div className="text-xs text-green-700">
                  https://ajuda.modopag.com.br{generateSiloUrl()}
                </div>
                <h3 className="text-xl text-blue-600 hover:underline cursor-pointer line-clamp-2">
                  {metaTitle}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {metaDescription}
                </p>
              </div>
            </div>

            {/* Article Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Informações do Artigo</h4>
                <div className="text-sm space-y-1">
                  <p><strong>Título:</strong> {article.title}</p>
                  <p><strong>Tipo:</strong> {article.type}</p>
                  <p><strong>Tempo de leitura:</strong> {article.reading_time_minutes} min</p>
                  <p><strong>Status:</strong> 
                    <Badge className="ml-2" variant={article.status === 'published' ? 'default' : 'outline'}>
                      {article.status}
                    </Badge>
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">SEO</h4>
                <div className="text-sm space-y-1">
                  <p><strong>Meta Título:</strong> {metaTitle} ({metaTitle.length}/60)</p>
                  <p><strong>Meta Descrição:</strong> {metaDescription.length}/160 chars</p>
                  <p><strong>Slug:</strong> {article.slug}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Content Preview */}
            <div className="space-y-2">
              <h4 className="font-medium">Preview do Conteúdo</h4>
              <div className="border rounded-lg p-4 bg-gray-50">
                <p className="text-sm text-gray-700">
                  {contentPreview}
                </p>
              </div>
            </div>

            <Separator />

            {/* Validation Status */}
            <div className="space-y-4">
              <h4 className="font-medium">Status de Validação</h4>
              
              {publishValidation.canPublish ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Artigo pronto para publicação!</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">Erros impedem a publicação:</span>
                  </div>
                  <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                    {publishValidation.blockingErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Continuar Editando
          </Button>
          
          <Button 
            onClick={handlePublish}
            disabled={!publishValidation.canPublish || isPublishing}
            className="bg-green-600 hover:bg-green-700"
          >
            {isPublishing ? 'Publicando...' : 'Confirmar Publicação'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}