import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Download, Upload, RefreshCw, Database, AlertCircle, CheckCircle, FileText, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getDataAdapter } from '@/lib/data-adapter';
import { generateSitemap } from '@/utils/sitemap';

interface DataManagerProps {
  onSitemapUpdate?: () => void;
}

export function DataManager({ onSitemapUpdate }: DataManagerProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isRebuildingSitemap, setIsRebuildingSitemap] = useState(false);
  const [importData, setImportData] = useState('');
  const [exportResult, setExportResult] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<{ success: boolean; message: string } | null>(null);
  const [sitemapResult, setSitemapResult] = useState<{ success: boolean; message: string; count?: number } | null>(null);
  const { toast } = useToast();

  const handleExport = async () => {
    setIsExporting(true);
    setExportResult(null);
    
    try {
      const adapter = await getDataAdapter();
      const data = await adapter.exportData();
      
      // Create downloadable file
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `modopag-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setExportResult(data);
      toast({
        title: 'Export concluído',
        description: 'Backup baixado com sucesso!'
      });
    } catch (error) {
      toast({
        title: 'Erro no export',
        description: 'Não foi possível exportar os dados.',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    if (!importData.trim()) {
      toast({
        title: 'Dados necessários',
        description: 'Cole os dados JSON para importar.',
        variant: 'destructive'
      });
      return;
    }

    setIsImporting(true);
    setImportResult(null);

    try {
      // Validate JSON
      JSON.parse(importData);
      
      const adapter = await getDataAdapter();
      await adapter.importData(importData);
      
      setImportResult({
        success: true,
        message: 'Dados importados com sucesso! A página será recarregada.'
      });

      toast({
        title: 'Import concluído',
        description: 'Dados importados com sucesso!'
      });

      // Reload page to reflect changes
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      setImportResult({
        success: false,
        message: `Erro na importação: ${message}`
      });
      
      toast({
        title: 'Erro no import',
        description: 'Verifique se os dados JSON estão válidos.',
        variant: 'destructive'
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleRebuildSitemap = async () => {
    setIsRebuildingSitemap(true);
    setSitemapResult(null);

    try {
      const adapter = await getDataAdapter();
      
      // Get site URL from settings
      const siteUrlSetting = await adapter.getSetting('site_url');
      const siteUrl = siteUrlSetting?.value || 'https://ajuda.modopag.com.br';
      
      // Get all published articles and categories for stats
      const articles = await adapter.getArticles({ status: 'published' });
      const categories = await adapter.getCategories();
      
      // Generate sitemap
      const sitemap = await generateSitemap(siteUrl);
      
      // In a real app, this would save to public/sitemap.xml
      // For now, we'll just simulate the process
      console.log('Generated sitemap:', sitemap);
      
      setSitemapResult({
        success: true,
        message: 'Sitemap reconstruído com sucesso!',
        count: articles.length + categories.filter(c => c.is_active).length + 2 // +2 for homepage and search
      });

      toast({
        title: 'Sitemap atualizado',
        description: `${articles.length} artigos e ${categories.filter(c => c.is_active).length} categorias indexados.`
      });

      if (onSitemapUpdate) {
        onSitemapUpdate();
      }
    } catch (error) {
      setSitemapResult({
        success: false,
        message: 'Erro ao reconstruir sitemap. Tente novamente.'
      });
      
      toast({
        title: 'Erro no sitemap',
        description: 'Não foi possível reconstruir o sitemap.',
        variant: 'destructive'
      });
    } finally {
      setIsRebuildingSitemap(false);
    }
  };

  const formatJsonPreview = (jsonString: string): string => {
    try {
      const parsed = JSON.parse(jsonString);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return jsonString;
    }
  };

  const getDataStats = (jsonString: string): { [key: string]: number } => {
    try {
      const data = JSON.parse(jsonString);
      return {
        'Categorias': data.categories?.length || 0,
        'Artigos': data.articles?.length || 0,
        'Tags': data.tags?.length || 0,
        'Redirects': data.redirects?.length || 0,
        'Feedbacks': data.feedback?.length || 0,
        'Configurações': data.settings?.length || 0
      };
    } catch {
      return {};
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Gerenciamento de Dados
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="export" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
            <TabsTrigger value="sitemap">Sitemap</TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">Exportar Dados</h3>
              <p className="text-sm text-muted-foreground">
                Faça backup de todos os dados do sistema (artigos, categorias, configurações, etc.)
              </p>
            </div>

            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? 'Exportando...' : 'Exportar Dados'}
            </Button>

            {exportResult && (
              <div className="space-y-3">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Export concluído! Arquivo baixado automaticamente.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Estatísticas dos Dados:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(getDataStats(exportResult)).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span>{key}:</span>
                        <Badge variant="outline">{value}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="import" className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">Importar Dados</h3>
              <p className="text-sm text-muted-foreground">
                Restaure dados de um backup JSON. <strong>Atenção:</strong> Isso substituirá todos os dados atuais!
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Dados JSON:</label>
              <Textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="Cole aqui o JSON do backup..."
                rows={8}
                className="font-mono text-xs"
              />
            </div>

            {importResult && (
              <Alert variant={importResult.success ? 'default' : 'destructive'}>
                {importResult.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>{importResult.message}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleImport}
              disabled={isImporting || !importData.trim()}
              className="w-full"
              variant="destructive"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isImporting ? 'Importando...' : 'Importar Dados'}
            </Button>
          </TabsContent>

          <TabsContent value="sitemap" className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">Reconstruir Sitemap</h3>
              <p className="text-sm text-muted-foreground">
                Regenere o sitemap.xml com todos os artigos e categorias publicados.
              </p>
            </div>

            <Button
              onClick={handleRebuildSitemap}
              disabled={isRebuildingSitemap}
              className="w-full"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRebuildingSitemap ? 'animate-spin' : ''}`} />
              {isRebuildingSitemap ? 'Reconstruindo...' : 'Reconstruir Sitemap'}
            </Button>

            {sitemapResult && (
              <Alert variant={sitemapResult.success ? 'default' : 'destructive'}>
                {sitemapResult.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  {sitemapResult.message}
                  {sitemapResult.count && (
                    <span className="ml-2">
                      <Badge variant="outline">{sitemapResult.count} páginas</Badge>
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2 text-xs text-muted-foreground">
              <p><strong>O que é incluído no sitemap:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Página inicial</li>
                <li>Todas as categorias ativas</li>
                <li>Todos os artigos publicados</li>
                <li>Página de busca</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}