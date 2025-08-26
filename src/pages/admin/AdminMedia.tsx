import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Upload, Search, Trash2, Download, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getDataAdapter } from "@/lib/data-adapter";
import type { Media } from "@/types/admin";

export default function AdminMedia() {
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    try {
      const adapter = await getDataAdapter();
      const data = await adapter.getMediaList();
      setMediaList(data);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar mídia",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Apenas imagens são suportadas",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      // Create a fake URL for demo purposes
      const fakeUrl = URL.createObjectURL(file);
      
      const adapter = await getDataAdapter();
      await adapter.createMedia({
        file_url: fakeUrl,
        alt_text: file.name,
        width: 800, // Default values for demo
        height: 600,
        file_size: file.size,
        mime_type: file.type,
      });

      toast({ 
        title: "Sucesso", 
        description: "Imagem enviada com sucesso!" 
      });
      
      setIsDialogOpen(false);
      loadMedia();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao enviar arquivo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta mídia?")) return;
    
    try {
      const adapter = await getDataAdapter();
      await adapter.deleteMedia(id);
      toast({ title: "Sucesso", description: "Mídia excluída com sucesso!" });
      loadMedia();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir mídia",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ 
      title: "Copiado!", 
      description: "URL copiada para a área de transferência" 
    });
  };

  const filteredMedia = mediaList.filter(media =>
    media.alt_text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Mídia</h1>
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
          <h1 className="text-3xl font-bold text-foreground">Mídia</h1>
          <p className="text-muted-foreground">Gerencie imagens e arquivos</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="w-4 h-4 mr-2" />
              Enviar Arquivo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enviar Arquivo</DialogTitle>
              <DialogDescription>
                Selecione uma imagem para enviar
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="file">Arquivo</Label>
                <Input
                  id="file"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  disabled={uploading}
                />
              </div>
              {uploading && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground mt-2">Enviando...</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Biblioteca de Mídia</CardTitle>
          <CardDescription>
            Total: {mediaList.length} arquivos
          </CardDescription>
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar arquivos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredMedia.map((media) => (
              <Card key={media.id} className="overflow-hidden">
                <div className="aspect-video relative bg-muted">
                  <img
                    src={media.file_url}
                    alt={media.alt_text}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                </div>
                <CardContent className="p-3">
                  <p className="text-sm font-medium truncate mb-1">
                    {media.alt_text}
                  </p>
                  <p className="text-xs text-muted-foreground mb-2">
                    {media.width}×{media.height} • {formatFileSize(media.file_size)}
                  </p>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(media.file_url)}
                      className="flex-1"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(media.file_url, '_blank')}
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(media.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredMedia.length === 0 && (
            <div className="text-center py-8">
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'Nenhum arquivo encontrado' : 'Nenhum arquivo enviado ainda'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}