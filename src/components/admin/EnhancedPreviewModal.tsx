import React, { useState } from 'react';
import { Eye, ExternalLink, Smartphone, Monitor, Tablet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type { Article, Category } from '@/types/admin';

interface EnhancedPreviewModalProps {
  article: Partial<Article>;
  categories: Category[];
  onPublish?: () => void;
  isPublishing?: boolean;
  disabled?: boolean;
}

type ViewportSize = 'mobile' | 'tablet' | 'desktop';

export function EnhancedPreviewModal({ 
  article, 
  categories, 
  onPublish, 
  isPublishing = false,
  disabled = false
}: EnhancedPreviewModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewport, setViewport] = useState<ViewportSize>('desktop');

  const category = categories.find(c => c.id === article.category_id);
  const articleUrl = category ? `/${category.slug}/${article.slug}` : `/artigo/${article.slug}`;

  const getViewportClasses = (size: ViewportSize) => {
    switch (size) {
      case 'mobile':
        return 'max-w-sm mx-auto';
      case 'tablet':
        return 'max-w-2xl mx-auto';
      case 'desktop':
        return 'max-w-4xl mx-auto';
    }
  };

  const ViewportButton = ({ size, icon: Icon, label }: { size: ViewportSize; icon: any; label: string }) => (
    <Button
      variant={viewport === size ? "default" : "outline"}
      size="sm"
      onClick={() => setViewport(size)}
      className="flex items-center gap-2"
    >
      <Icon className="w-4 h-4" />
      {label}
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline"
          disabled={disabled}
          className="flex items-center gap-2"
        >
          <Eye className="w-4 h-4" />
          Preview
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-7xl w-full h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Preview: {article.title || 'Sem título'}
              </DialogTitle>
              {article.slug && (
                <p className="text-sm text-muted-foreground mt-1">
                  {articleUrl}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant={
                article.status === 'published' ? 'default' :
                article.status === 'review' ? 'secondary' :
                'outline'
              }>
                {article.status}
              </Badge>
              
              {onPublish && (
                <Button 
                  onClick={onPublish}
                  disabled={isPublishing || disabled}
                  className="ml-4"
                >
                  {isPublishing ? 'Publicando...' : 'Publicar'}
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 flex flex-col">
          {/* Viewport Controls */}
          <div className="flex items-center justify-between px-6 py-3 border-b bg-muted/30">
            <div className="flex items-center gap-2">
              <ViewportButton size="mobile" icon={Smartphone} label="Mobile" />
              <ViewportButton size="tablet" icon={Tablet} label="Tablet" />
              <ViewportButton size="desktop" icon={Monitor} label="Desktop" />
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(articleUrl, '_blank')}
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Abrir em nova aba
            </Button>
          </div>

          {/* Preview Content */}
          <div className="flex-1 overflow-auto p-6 bg-muted/10">
            <div className={cn("transition-all duration-300", getViewportClasses(viewport))}>
              <Tabs defaultValue="article" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="article">Artigo</TabsTrigger>
                  <TabsTrigger value="seo">SEO Preview</TabsTrigger>
                </TabsList>
                
                <TabsContent value="article" className="mt-6">
                  <article className="bg-background rounded-lg border p-8 shadow-sm">
                    {/* Article Header */}
                    <header className="mb-8">
                      {category && (
                        <Badge variant="secondary" className="mb-4">
                          {category.name}
                        </Badge>
                      )}
                      
                      <h1 className="text-3xl font-bold mb-4 leading-tight">
                        {article.title || 'Título do artigo'}
                      </h1>
                      
                      {article.meta_description && (
                        <p className="text-lg text-muted-foreground leading-relaxed">
                          {article.meta_description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 mt-6 text-sm text-muted-foreground">
                        <span>Por {article.author || 'Admin'}</span>
                        {article.reading_time_minutes && (
                          <>
                            <span>•</span>
                            <span>{article.reading_time_minutes} min de leitura</span>
                          </>
                        )}
                      </div>
                    </header>

                    {/* Article Content */}
                    <div 
                      className="prose prose-lg max-w-none"
                      dangerouslySetInnerHTML={{ 
                        __html: article.content || '<p>Conteúdo do artigo será exibido aqui...</p>' 
                      }}
                    />
                  </article>
                </TabsContent>
                
                <TabsContent value="seo" className="mt-6">
                  <div className="space-y-6">
                    {/* Google Search Preview */}
                    <div className="bg-background rounded-lg border p-6">
                      <h3 className="font-semibold mb-4">Preview do Google</h3>
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">
                          {window.location.origin}{articleUrl}
                        </div>
                        <div className="text-blue-600 text-lg hover:underline cursor-pointer">
                          {article.meta_title || article.title || 'Título da página'}
                        </div>
                        <div className="text-sm text-muted-foreground line-clamp-2">
                          {article.meta_description || 'Meta descrição não definida'}
                        </div>
                      </div>
                    </div>

                    {/* Social Media Preview */}
                    <div className="bg-background rounded-lg border p-6">
                      <h3 className="font-semibold mb-4">Preview Social Media</h3>
                      <div className="border rounded-lg overflow-hidden max-w-md">
                        {article.og_image && (
                          <img 
                            src={article.og_image} 
                            alt="Preview" 
                            className="w-full h-40 object-cover"
                          />
                        )}
                        <div className="p-4">
                          <div className="text-sm text-muted-foreground mb-1">
                            {window.location.host}
                          </div>
                          <div className="font-semibold mb-1">
                            {article.og_title || article.meta_title || article.title || 'Título'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {article.og_description || article.meta_description || 'Descrição'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}