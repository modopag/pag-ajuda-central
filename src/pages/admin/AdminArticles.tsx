import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getDataAdapter } from "@/lib/data-adapter";
import type { Article, Category, ArticleStatus } from "@/types/admin";
import { AdminArticlesSkeleton } from "@/components/skeletons/AdminArticlesSkeleton";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Copy,
  Trash2,
  FileText,
} from "lucide-react";

export default function AdminArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<ArticleStatus | "all">("all");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [articles, searchTerm, selectedCategory, selectedStatus]);

  const loadData = async () => {
    try {
      const adapter = await getDataAdapter();
      const [articlesData, categoriesData] = await Promise.all([
        adapter.getArticles(),
        adapter.getCategories(),
      ]);
      
      setArticles(articlesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error loading articles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDuplicate = async (article: Article) => {
    try {
      const adapter = await getDataAdapter();
      
      // Criar novo artigo baseado no atual
      const duplicatedArticle = await adapter.createArticle({
        title: `${article.title} (Cópia)`,
        slug: '', // Será gerado automaticamente
        content: article.content || '',
        status: 'draft',
        category_id: article.category_id,
        author: article.author || 'Admin',
        meta_title: article.meta_title || '',
        meta_description: article.meta_description || '',
        canonical_url: article.canonical_url || '',
        og_title: article.og_title || '',
        og_description: article.og_description || '',
        og_image: article.og_image || '',
        noindex: !!article.noindex,
        type: article.type || 'artigo',
        reading_time_minutes: article.reading_time_minutes || 1,
        published_at: null
      });

      // Recarregar lista
      await loadData();
      
      console.log('AdminArticles - duplicated article:', duplicatedArticle);
    } catch (error) {
      console.error('AdminArticles - error duplicating article:', error);
    }
  };

  const generateViewUrl = (article: Article): string => {
    const category = categories.find(c => c.id === article.category_id);
    return category ? `/${category.slug}/${article.slug}` : `#`;
  };

  const applyFilters = () => {
    let filtered = articles;

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (article) =>
          article.title.toLowerCase().includes(search) ||
          article.content.toLowerCase().includes(search)
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((article) => article.category_id === selectedCategory);
    }

    // Status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter((article) => article.status === selectedStatus);
    }

    setFilteredArticles(filtered);
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || "Sem categoria";
  };

  const getStatusBadgeVariant = (status: ArticleStatus) => {
    switch (status) {
      case "published": return "default";
      case "draft": return "secondary";
      case "review": return "outline";
      case "archived": return "destructive";
      default: return "secondary";
    }
  };

  const getStatusLabel = (status: ArticleStatus) => {
    switch (status) {
      case "published": return "Publicado";
      case "draft": return "Rascunho";
      case "review": return "Revisão";
      case "archived": return "Arquivado";
      default: return status;
    }
  };

  const handleDeleteArticle = async (articleId: string) => {
    if (!confirm("Tem certeza que deseja excluir este artigo?")) return;
    
    try {
      const adapter = await getDataAdapter();
      await adapter.deleteArticle(articleId);
      await loadData();
    } catch (error) {
      console.error("Error deleting article:", error);
    }
  };

  if (isLoading) {
    return <AdminArticlesSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Artigos</h1>
          <p className="text-muted-foreground">
            Gerencie todos os artigos da Central de Ajuda
          </p>
        </div>
        
        <Button asChild>
          <Link to="/admin/articles/new">
            <Plus className="w-4 h-4 mr-2" />
            Novo Artigo
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filtros
          </CardTitle>
          <CardDescription>
            Use os filtros para encontrar artigos específicos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Título ou conteúdo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as ArticleStatus | "all")}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="published">Publicado</SelectItem>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="review">Em Revisão</SelectItem>
                  <SelectItem value="archived">Arquivado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setSelectedStatus("all");
                }}
                className="w-full"
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Articles Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {filteredArticles.length} {filteredArticles.length === 1 ? "artigo encontrado" : "artigos encontrados"}
              </CardTitle>
              <CardDescription>
                Lista completa de artigos com opções de edição
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredArticles.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Visualizações</TableHead>
                    <TableHead>Atualizado</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredArticles.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell>
                        <div>
                          <Link
                            to={`/admin/articles/${article.id}/edit`}
                            className="font-medium text-foreground hover:text-primary"
                          >
                            {article.title}
                          </Link>
                          <p className="text-sm text-muted-foreground mt-1">
                            /{article.slug}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getCategoryName(article.category_id)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(article.status)}>
                          {getStatusLabel(article.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>{article.view_count.toLocaleString()}</TableCell>
                      <TableCell>
                        {new Date(article.updated_at).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover border">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                               <Link to={generateViewUrl(article)} target="_blank">
                                 <Eye className="w-4 h-4 mr-2" />
                                 Ver Artigo
                               </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/admin/articles/${article.id}/edit`}>
                                <Edit className="w-4 h-4 mr-2" />
                                Editar
                              </Link>
                            </DropdownMenuItem>
                             <DropdownMenuItem 
                               onClick={() => handleDuplicate(article)}
                             >
                               <Copy className="w-4 h-4 mr-2" />
                               Duplicar
                             </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteArticle(article.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Nenhum artigo encontrado
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedCategory !== "all" || selectedStatus !== "all"
                  ? "Tente ajustar os filtros para encontrar o que procura."
                  : "Comece criando seu primeiro artigo para a Central de Ajuda."}
              </p>
              <Button asChild>
                <Link to="/admin/articles/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Artigo
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}