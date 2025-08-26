import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Eye, Send, Copy, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { getDataAdapter } from '@/lib/data-adapter';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { useAutoSave } from '@/hooks/useAutoSave';
import { validateSEO, calculateReadingTime, generateSlug } from '@/utils/seoValidations';
import type { Article, Category, Tag, ArticleStatus } from '@/types/admin';

export default function AdminArticleEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = id !== 'new';

  // Estados principais
  const [article, setArticle] = useState<Partial<Article>>({
    title: '',
    slug: '',
    content: '', // Sempre inicializar como string vazia
    status: 'draft',
    category_id: '',
    author: 'Admin',
    meta_title: '',
    meta_description: '',
    canonical_url: '',
    og_title: '',
    og_description: '',
    og_image: '',
    noindex: false,
    type: 'artigo',
    reading_time_minutes: 1
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('content');

  // Validações SEO
  const seoValidations = useMemo(() => {
    return validateSEO({
      title: article.title || '',
      metaTitle: article.meta_title,
      metaDescription: article.meta_description,
      slug: article.slug || '',
      content: article.content || ''
    });
  }, [article.title, article.meta_title, article.meta_description, article.slug, article.content]);

  // Tempo de leitura calculado
  const readingTime = useMemo(() => {
    return calculateReadingTime(article.content || '');
  }, [article.content]);

  // Auto-save
  useAutoSave({
    data: article,
    onSave: async (data) => {
      if (isEditing && data.title?.trim()) {
        const adapter = await getDataAdapter();
        await adapter.updateArticle(id!, { ...data, reading_time_minutes: readingTime });
      }
    },
    enabled: isEditing && !!article.title?.trim()
  });

  // Carregar dados iniciais
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const adapter = await getDataAdapter();
        
        // Carregar categorias e tags
        const [categoriesData, tagsData] = await Promise.all([
          adapter.getCategories(),
          adapter.getTags()
        ]);
        
        console.log('AdminArticleEdit - loaded initial data:', { categoriesData, tagsData });
        
        setCategories(categoriesData);
        setTags(tagsData);

        // Se estiver editando, carregar o artigo
        if (isEditing) {
          console.log('AdminArticleEdit - loading article for editing:', id);
          const articleData = await adapter.getArticleById(id!);
          
          if (articleData) {
            console.log('AdminArticleEdit - loaded article data:', articleData);
            
            // Garantir que o conteúdo nunca seja undefined
            const safeArticleData = {
              ...articleData,
              content: articleData.content || '',
              meta_title: articleData.meta_title || '',
              meta_description: articleData.meta_description || '',
              canonical_url: articleData.canonical_url || '',
              og_title: articleData.og_title || '',
              og_description: articleData.og_description || '',
              og_image: articleData.og_image || ''
            };
            
            console.log('AdminArticleEdit - setting safe article data:', safeArticleData);
            setArticle(safeArticleData);
            
            // Carregar tags do artigo
            const articleTags = await adapter.getArticleTags(id!);
            console.log('AdminArticleEdit - loaded article tags:', articleTags);
            setSelectedTags(articleTags.map(tag => tag.id));
          } else {
            console.error('AdminArticleEdit - article not found:', id);
            toast({
              title: "Artigo não encontrado",
              variant: "destructive"
            });
            navigate('/admin/articles');
          }
        } else {
          console.log('AdminArticleEdit - creating new article, using default state');
        }
      } catch (error) {
        console.error('AdminArticleEdit - error loading data:', error);
        toast({
          title: "Erro ao carregar dados",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, isEditing, navigate, toast]);

  // Atualizar slug automaticamente
  useEffect(() => {
    if (article.title && !isEditing) {
      const newSlug = generateSlug(article.title);
      setArticle(prev => ({ ...prev, slug: newSlug }));
    }
  }, [article.title, isEditing]);

  // Atualizar tempo de leitura
  useEffect(() => {
    setArticle(prev => ({ ...prev, reading_time_minutes: readingTime }));
  }, [readingTime]);

  const handleInputChange = (field: keyof Article, value: any) => {
    console.log('AdminArticleEdit - handleInputChange:', { field, value, type: typeof value });
    setArticle(prev => {
      const newState = { ...prev, [field]: value };
      console.log('AdminArticleEdit - new article state:', newState);
      return newState;
    });
  };

  const handleImageUpload = async (file: File, altText: string): Promise<string> => {
    // Simular upload de imagem
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        resolve(url);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSave = async (newStatus?: ArticleStatus) => {
    if (!article.title?.trim()) {
      toast({
        title: "Título é obrigatório",
        variant: "destructive"
      });
      return;
    }

    if (!article.category_id) {
      toast({
        title: "Categoria é obrigatória",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const adapter = await getDataAdapter();
      const articleData = {
        ...article,
        status: newStatus || article.status || 'draft',
        reading_time_minutes: readingTime,
        published_at: newStatus === 'published' ? new Date().toISOString() : article.published_at
      } as Article;

      let savedArticle: Article;
      
      if (isEditing) {
        savedArticle = await adapter.updateArticle(id!, articleData);
      } else {
        savedArticle = await adapter.createArticle(articleData);
      }

      // Atualizar tags
      if (isEditing) {
        // Remover todas as tags atuais
        const currentTags = await adapter.getArticleTags(savedArticle.id);
        for (const tag of currentTags) {
          await adapter.removeTagFromArticle(savedArticle.id, tag.id);
        }
      }

      // Adicionar novas tags
      for (const tagId of selectedTags) {
        await adapter.addTagToArticle(savedArticle.id, tagId);
      }

      toast({
        title: isEditing ? "Artigo atualizado" : "Artigo criado",
        description: `Status: ${savedArticle.status}`
      });

      if (!isEditing) {
        navigate(`/admin/articles/edit/${savedArticle.id}`);
      }
    } catch (error) {
      console.error('Erro ao salvar artigo:', error);
      toast({
        title: "Erro ao salvar",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDuplicate = async () => {
    if (!isEditing) return;
    
    const duplicatedArticle = {
      ...article,
      title: `${article.title} (Cópia)`,
      slug: `${article.slug}-copia`,
      status: 'draft' as ArticleStatus,
      published_at: undefined
    };
    
    setArticle(duplicatedArticle);
    navigate('/admin/articles/edit/new');
    
    toast({
      title: "Artigo duplicado",
      description: "Você pode editar a cópia agora"
    });
  };

  const getValidationIcon = (field: string) => {
    const validation = seoValidations.find(v => v.field === field);
    if (!validation) return null;
    
    switch (validation.type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/admin/articles')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {isEditing ? 'Editar Artigo' : 'Novo Artigo'}
            </h1>
            {article.slug && (
              <p className="text-sm text-muted-foreground">
                /artigo/{article.slug}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={
            article.status === 'published' ? 'default' :
            article.status === 'review' ? 'secondary' :
            'outline'
          }>
            {article.status}
          </Badge>
          
          {readingTime > 0 && (
            <Badge variant="outline">
              {readingTime} min de leitura
            </Badge>
          )}
        </div>
      </div>

      {/* Ações */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button 
          variant="outline" 
          onClick={() => handleSave()}
          disabled={isSaving}
        >
          <Save className="w-4 h-4 mr-2" />
          Salvar Rascunho
        </Button>
        
        <Button 
          variant="outline"
          onClick={() => handleSave('review')}
          disabled={isSaving || !article.title?.trim()}
        >
          <Send className="w-4 h-4 mr-2" />
          Enviar para Revisão
        </Button>
        
        <Button 
          onClick={() => handleSave('published')}
          disabled={isSaving || !article.title?.trim() || !article.category_id}
        >
          <Eye className="w-4 h-4 mr-2" />
          Publicar
        </Button>
        
        {isEditing && (
          <Button variant="outline" onClick={handleDuplicate}>
            <Copy className="w-4 h-4 mr-2" />
            Duplicar
          </Button>
        )}
      </div>

      {/* Validações SEO */}
      {seoValidations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Validações SEO</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {seoValidations.map((validation, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  {getValidationIcon(validation.field)}
                  <span className={
                    validation.type === 'error' ? 'text-red-600' :
                    validation.type === 'warning' ? 'text-yellow-600' :
                    'text-green-600'
                  }>
                    {validation.message}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Editor */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="content">Conteúdo</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={article.title || ''}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Digite o título do artigo..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria *</Label>
                  <Select 
                    value={article.category_id || ''} 
                    onValueChange={(value) => handleInputChange('category_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedTags(prev => 
                          prev.includes(tag.id) 
                            ? prev.filter(id => id !== tag.id)
                            : [...prev, tag.id]
                        );
                      }}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tipo de Artigo</Label>
                <Select 
                  value={article.type || 'guide'} 
                  onValueChange={(value) => handleInputChange('type', value)}
                >
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="artigo">Artigo</SelectItem>
                    <SelectItem value="tutorial">Tutorial</SelectItem>
                    <SelectItem value="aviso">Aviso</SelectItem>
                    <SelectItem value="atualização">Atualização</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

            <Card>
            <CardHeader>
              <CardTitle>Conteúdo do Artigo</CardTitle>
            </CardHeader>
            <CardContent>
              <RichTextEditor
                value={article.content || ''}
                onChange={(value) => handleInputChange('content', value || '')}
                onImageUpload={handleImageUpload}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="slug">Slug *</Label>
                    {getValidationIcon('slug')}
                  </div>
                  <Input
                    id="slug"
                    value={article.slug || ''}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    placeholder="url-do-artigo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="canonical">URL Canônica</Label>
                  <Input
                    id="canonical"
                    value={article.canonical_url || ''}
                    onChange={(e) => handleInputChange('canonical_url', e.target.value)}
                    placeholder="https://exemplo.com/artigo"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="metaTitle">Meta Título</Label>
                  {getValidationIcon('metaTitle')}
                </div>
                <Input
                  id="metaTitle"
                  value={article.meta_title || ''}
                  onChange={(e) => handleInputChange('meta_title', e.target.value)}
                  placeholder="Deixe vazio para usar o título do artigo"
                />
                <p className="text-xs text-muted-foreground">
                  {(article.meta_title || article.title || '').length}/60 caracteres
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="metaDescription">Meta Descrição</Label>
                  {getValidationIcon('metaDescription')}
                </div>
                <Textarea
                  id="metaDescription"
                  value={article.meta_description || ''}
                  onChange={(e) => handleInputChange('meta_description', e.target.value)}
                  placeholder="Descrição que aparecerá nos resultados de busca..."
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  {(article.meta_description || '').length}/160 caracteres
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Open Graph</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="ogTitle">OG Título</Label>
                  <Input
                    id="ogTitle"
                    value={article.og_title || ''}
                    onChange={(e) => handleInputChange('og_title', e.target.value)}
                    placeholder="Título para redes sociais"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ogDescription">OG Descrição</Label>
                  <Textarea
                    id="ogDescription"
                    value={article.og_description || ''}
                    onChange={(e) => handleInputChange('og_description', e.target.value)}
                    placeholder="Descrição para redes sociais"
                    rows={2}
                  />
                </div>

                <ImageUploader
                  label="OG Image"
                  currentImage={article.og_image}
                  onUpload={async (file, altText) => {
                    const url = await handleImageUpload(file, altText);
                    handleInputChange('og_image', url);
                    return url;
                  }}
                  onRemove={() => handleInputChange('og_image', '')}
                />
              </div>

              <Separator />

              <div className="flex items-center space-x-2">
                <Switch
                  id="noindex"
                  checked={article.noindex || false}
                  onCheckedChange={(checked) => handleInputChange('noindex', checked)}
                />
                <Label htmlFor="noindex">Não indexar (noindex)</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}