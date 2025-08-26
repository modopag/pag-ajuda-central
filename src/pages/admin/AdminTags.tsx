import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getDataAdapter } from "@/lib/data-adapter";
import type { Tag } from "@/types/admin";

export default function AdminTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [formData, setFormData] = useState({ name: "", slug: "" });
  const { toast } = useToast();

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const adapter = await getDataAdapter();
      const data = await adapter.getTags();
      setTags(data);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar tags",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      const adapter = await getDataAdapter();
      
      if (editingTag) {
        await adapter.updateTag(editingTag.id, {
          name: formData.name,
          slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
        });
        toast({ title: "Sucesso", description: "Tag atualizada com sucesso!" });
      } else {
        await adapter.createTag({
          name: formData.name,
          slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
        });
        toast({ title: "Sucesso", description: "Tag criada com sucesso!" });
      }
      
      setIsDialogOpen(false);
      setEditingTag(null);
      setFormData({ name: "", slug: "" });
      loadTags();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar tag",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    setFormData({ name: tag.name, slug: tag.slug });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta tag?")) return;
    
    try {
      const adapter = await getDataAdapter();
      await adapter.deleteTag(id);
      toast({ title: "Sucesso", description: "Tag excluída com sucesso!" });
      loadTags();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir tag",
        variant: "destructive",
      });
    }
  };

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Tags</h1>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tags</h1>
          <p className="text-muted-foreground">Gerencie as tags dos artigos</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingTag(null);
              setFormData({ name: "", slug: "" });
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Tag
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTag ? "Editar Tag" : "Nova Tag"}
              </DialogTitle>
              <DialogDescription>
                {editingTag ? "Edite os dados da tag" : "Adicione uma nova tag ao sistema"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome da tag"
                  required
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="slug-da-tag (opcional)"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingTag ? "Salvar" : "Criar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Tags</CardTitle>
          <CardDescription>
            Total: {tags.length} tags
          </CardDescription>
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Data de Criação</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTags.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell>
                    <Badge variant="secondary">{tag.name}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {tag.slug}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(tag.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(tag)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(tag.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}