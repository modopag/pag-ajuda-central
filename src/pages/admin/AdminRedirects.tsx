import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Search, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getDataAdapter } from "@/lib/data-adapter";
import { CSVImporter } from "@/components/admin/CSVImporter";
import { RedirectStats } from "@/components/admin/RedirectStats";
import type { Redirect, RedirectType } from "@/types/admin";

export default function AdminRedirects() {
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRedirect, setEditingRedirect] = useState<Redirect | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [formData, setFormData] = useState({
    from_path: "",
    to_path: "",
    type: '301' as RedirectType,
    is_active: true
  });
  const { toast } = useToast();

  useEffect(() => {
    loadRedirects();
  }, []);

  const loadRedirects = async () => {
    try {
      const adapter = await getDataAdapter();
      const data = await adapter.getRedirects();
      setRedirects(data);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar redirecionamentos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.from_path.trim() || !formData.to_path.trim()) return;

    try {
      const adapter = await getDataAdapter();
      
      if (editingRedirect) {
        await adapter.updateRedirect(editingRedirect.id, formData);
        toast({ title: "Sucesso", description: "Redirecionamento atualizado com sucesso!" });
      } else {
        await adapter.createRedirect(formData);
        toast({ title: "Sucesso", description: "Redirecionamento criado com sucesso!" });
      }
      
      setIsDialogOpen(false);
      setEditingRedirect(null);
      setFormData({ from_path: "", to_path: "", type: 301, is_active: true });
      loadRedirects();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar redirecionamento",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (redirect: Redirect) => {
    setEditingRedirect(redirect);
    setFormData({
      from_path: redirect.from_path,
      to_path: redirect.to_path,
      type: redirect.type,
      is_active: redirect.is_active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este redirecionamento?")) return;
    
    try {
      const adapter = await getDataAdapter();
      await adapter.deleteRedirect(id);
      toast({ title: "Sucesso", description: "Redirecionamento excluído com sucesso!" });
      loadRedirects();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir redirecionamento",
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (redirect: Redirect) => {
    try {
      const adapter = await getDataAdapter();
      await adapter.updateRedirect(redirect.id, { 
        is_active: !redirect.is_active 
      });
      loadRedirects();
      toast({ 
        title: "Sucesso", 
        description: `Redirecionamento ${!redirect.is_active ? 'ativado' : 'desativado'} com sucesso!` 
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao alterar status do redirecionamento",
        variant: "destructive",
      });
    }
  };

  const filteredRedirects = redirects.filter(redirect =>
    redirect.from_path.toLowerCase().includes(searchTerm.toLowerCase()) ||
    redirect.to_path.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPath = (path: string) => {
    if (path.startsWith('http')) return path;
    return path.startsWith('/') ? path : `/${path}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Redirecionamentos</h1>
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
          <h1 className="text-3xl font-bold text-foreground">Redirecionamentos</h1>
          <p className="text-muted-foreground">Gerencie redirecionamentos 301 e 302</p>
        </div>
        
        <div className="flex gap-2">
          <CSVImporter onImportComplete={loadRedirects} />
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingRedirect(null);
                setFormData({ from_path: "", to_path: "", type: '301' as RedirectType, is_active: true });
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Redirecionamento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingRedirect ? "Editar Redirecionamento" : "Novo Redirecionamento"}
                </DialogTitle>
                <DialogDescription>
                  {editingRedirect ? "Edite o redirecionamento" : "Crie um novo redirecionamento"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="from_path">Caminho de Origem</Label>
                  <Input
                    id="from_path"
                    value={formData.from_path}
                    onChange={(e) => setFormData({ ...formData, from_path: e.target.value })}
                    placeholder="/pagina-antiga ou https://exemplo.com/pagina"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="to_path">Caminho de Destino</Label>
                  <Input
                    id="to_path"
                    value={formData.to_path}
                    onChange={(e) => setFormData({ ...formData, to_path: e.target.value })}
                    placeholder="/nova-pagina ou https://exemplo.com/nova-pagina"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">Tipo de Redirecionamento</Label>
                  <Select
                    value={formData.type.toString()}
                    onValueChange={(value) => setFormData({ ...formData, type: value as RedirectType })}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border z-50">
                      <SelectItem value="301">301 - Permanente</SelectItem>
                      <SelectItem value="302">302 - Temporário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label>Ativo</Label>
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
                    {editingRedirect ? "Salvar" : "Criar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Section */}
      <RedirectStats refreshTrigger={refreshTrigger} />

      <Card>
        <CardHeader>
          <CardTitle>Lista de Redirecionamentos</CardTitle>
          <CardDescription>
            Total: {redirects.length} redirecionamentos ({redirects.filter(r => r.is_active).length} ativos)
          </CardDescription>
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar redirecionamentos..."
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
                <TableHead>Origem</TableHead>
                <TableHead>Destino</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data de Criação</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRedirects.map((redirect) => (
                <TableRow key={redirect.id}>
                  <TableCell className="font-mono text-sm">
                    {formatPath(redirect.from_path)}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    <div className="flex items-center space-x-1">
                      <span>{formatPath(redirect.to_path)}</span>
                      {redirect.to_path.startsWith('http') && (
                        <ExternalLink className="w-3 h-3 text-muted-foreground" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={redirect.type === '301' ? "default" : "secondary"}>
                      {redirect.type} - {redirect.type === '301' ? "Permanente" : "Temporário"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={redirect.is_active}
                        onCheckedChange={() => toggleActive(redirect)}
                      />
                      <Badge variant={redirect.is_active ? "default" : "secondary"}>
                        {redirect.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(redirect.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(redirect)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(redirect.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredRedirects.length === 0 && (
            <div className="text-center py-8">
              <ExternalLink className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'Nenhum redirecionamento encontrado' : 'Nenhum redirecionamento configurado ainda'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}