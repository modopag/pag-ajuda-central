import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Download, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getDataAdapter } from '@/lib/data-adapter';
import type { RedirectType } from '@/types/admin';

interface CSVRow {
  from_path: string;
  to_path: string;
  type: RedirectType;
  is_active: boolean;
  error?: string;
}

interface CSVImporterProps {
  onImportComplete: () => void;
}

export function CSVImporter({ onImportComplete }: CSVImporterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResults, setImportResults] = useState<{ success: number; errors: number; details: string[] }>({
    success: 0,
    errors: 0,
    details: []
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const downloadTemplate = () => {
    const csvContent = [
      'from_path,to_path,type,is_active',
      '/artigo/exemplo-antigo,/artigo/exemplo-novo,301,true',
      '/pagina-descontinuada,/410,301,true',
      'https://site-antigo.com/pagina,/nova-pagina,301,true'
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'redirects-template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const parseCSV = (csvText: string): CSVRow[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    const requiredHeaders = ['from_path', 'to_path', 'type', 'is_active'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      throw new Error(`Cabeçalhos obrigatórios ausentes: ${missingHeaders.join(', ')}`);
    }

    const rows: CSVRow[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row: CSVRow = {
        from_path: '',
        to_path: '',
        type: '301' as RedirectType,
        is_active: true
      };

      headers.forEach((header, index) => {
        const value = values[index] || '';
        
        switch (header) {
          case 'from_path':
            row.from_path = value;
            break;
          case 'to_path':
            row.to_path = value;
            break;
          case 'type':
            if (value !== '301' && value !== '302' && value !== '410') {
              row.error = `Tipo inválido: ${value}. Use 301, 302 ou 410`;
            } else {
              row.type = value as RedirectType;
            }
            break;
          case 'is_active':
            row.is_active = value.toLowerCase() === 'true';
            break;
        }
      });

      // Validações
      if (!row.from_path.trim()) {
        row.error = 'from_path é obrigatório';
      } else if (!row.to_path.trim()) {
        row.error = 'to_path é obrigatório';
      } else if (row.from_path === row.to_path) {
        row.error = 'from_path e to_path não podem ser iguais';
      }

      rows.push(row);
    }

    return rows;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: 'Erro',
        description: 'Por favor, selecione um arquivo CSV',
        variant: 'destructive'
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string;
        const parsedData = parseCSV(csvText);
        setCsvData(parsedData);
      } catch (error) {
        toast({
          title: 'Erro ao processar CSV',
          description: error instanceof Error ? error.message : 'Erro desconhecido',
          variant: 'destructive'
        });
      }
    };
    reader.readAsText(file);
  };

  const executeImport = async () => {
    if (csvData.length === 0) return;

    setIsProcessing(true);
    const results = { success: 0, errors: 0, details: [] as string[] };

    try {
      const adapter = await getDataAdapter();
      
      for (const row of csvData) {
        try {
          if (row.error) {
            results.errors++;
            results.details.push(`Linha ${csvData.indexOf(row) + 2}: ${row.error}`);
            continue;
          }

          await adapter.createRedirect({
            from_path: row.from_path,
            to_path: row.to_path,
            type: row.type,
            is_active: row.is_active
          });

          results.success++;
        } catch (error) {
          results.errors++;
          results.details.push(`Linha ${csvData.indexOf(row) + 2}: Erro ao criar redirecionamento`);
        }
      }

      setImportResults(results);
      
      if (results.success > 0) {
        toast({
          title: 'Importação concluída',
          description: `${results.success} redirecionamento(s) importado(s) com sucesso`
        });
        onImportComplete();
      }
    } catch (error) {
      toast({
        title: 'Erro na importação',
        description: 'Erro ao processar os redirecionamentos',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetImporter = () => {
    setCsvData([]);
    setImportResults({ success: 0, errors: 0, details: [] });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validRows = csvData.filter(row => !row.error);
  const errorRows = csvData.filter(row => row.error);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetImporter();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="w-4 h-4 mr-2" />
          Importar CSV
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Importar Redirecionamentos via CSV</DialogTitle>
          <DialogDescription>
            Importe múltiplos redirecionamentos de uma vez usando um arquivo CSV
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Template Download */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Formato do CSV
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Seu arquivo CSV deve conter as colunas: from_path, to_path, type, is_active
              </p>
              <Button variant="outline" size="sm" onClick={downloadTemplate}>
                <Download className="w-4 h-4 mr-2" />
                Baixar Template
              </Button>
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Upload do Arquivo</CardTitle>
            </CardHeader>
            <CardContent>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="mb-3"
              />
              
              {csvData.length > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {csvData.length} linha(s) encontrada(s). {validRows.length} válida(s), {errorRows.length} com erro(s).
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Preview */}
          {csvData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Preview dos Dados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {csvData.slice(0, 10).map((row, index) => (
                    <div key={index} className={`p-2 rounded border ${row.error ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <span className="font-mono">{row.from_path}</span> → <span className="font-mono">{row.to_path}</span>
                          <Badge variant={row.type === '301' ? 'default' : 'secondary'} className="ml-2">
                            {row.type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          {row.error ? (
                            <X className="w-4 h-4 text-red-500" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                      </div>
                      {row.error && (
                        <p className="text-xs text-red-600 mt-1">{row.error}</p>
                      )}
                    </div>
                  ))}
                  {csvData.length > 10 && (
                    <p className="text-xs text-muted-foreground text-center">
                      ... e mais {csvData.length - 10} linha(s)
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Import Results */}
          {importResults.success > 0 || importResults.errors > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Resultado da Importação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="text-green-600">✓ {importResults.success} importados com sucesso</span>
                  </p>
                  {importResults.errors > 0 && (
                    <p className="text-sm">
                      <span className="text-red-600">✗ {importResults.errors} com erro</span>
                    </p>
                  )}
                  
                  {importResults.details.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium mb-1">Detalhes dos erros:</p>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {importResults.details.map((detail, index) => (
                          <p key={index} className="text-xs text-red-600">{detail}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Fechar
          </Button>
          
          {csvData.length > 0 && validRows.length > 0 && importResults.success === 0 && (
            <Button 
              onClick={executeImport}
              disabled={isProcessing}
            >
              {isProcessing ? 'Importando...' : `Importar ${validRows.length} redirecionamento(s)`}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}