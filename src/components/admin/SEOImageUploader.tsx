import React, { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { Upload, X, Image as ImageIcon, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SEOImage {
  url: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
}

interface SEOImageUploaderProps {
  value?: SEOImage | null;
  onChange: (image: SEOImage | null) => void;
  className?: string;
}

export const SEOImageUploader: React.FC<SEOImageUploaderProps> = ({
  value,
  onChange,
  className
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  const validateImage = async (file: File): Promise<{ valid: boolean; warnings: string[] }> => {
    const warnings: string[] = [];
    
    // Size validation
    if (file.size > 512 * 1024) {
      warnings.push(`Arquivo muito grande (${(file.size / 1024 / 1024).toFixed(1)}MB). Recomendado: ≤ 512KB`);
    }

    // Format validation
    if (!['image/jpeg', 'image/webp', 'image/png'].includes(file.type)) {
      return { valid: false, warnings: ['Formato inválido. Use WebP, JPEG ou PNG.'] };
    }

    // Dimension validation
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        
        // Preferred: 1200x630 (1.91:1) or similar landscape
        if (aspectRatio < 1.5) {
          warnings.push('Recomendado: imagem paisagem (1200×630px ou similar)');
        }
        
        if (img.width < 600 || img.height < 315) {
          warnings.push(`Resolução baixa (${img.width}×${img.height}). Recomendado: ≥ 1200×630px`);
        }

        resolve({ valid: true, warnings });
      };
      
      img.onerror = () => resolve({ valid: false, warnings: ['Não foi possível ler a imagem'] });
      img.src = URL.createObjectURL(file);
    });
  };

  const uploadImage = async (file: File): Promise<SEOImage | null> => {
    try {
      setUploading(true);
      setUploadProgress(0);

      // Validate image first
      const validation = await validateImage(file);
      if (!validation.valid) {
        toast({
          title: "Erro de validação",
          description: validation.warnings.join('. '),
          variant: "destructive"
        });
        return null;
      }

      // Show warnings but continue
      if (validation.warnings.length > 0) {
        toast({
          title: "Avisos de otimização",
          description: validation.warnings.join('. '),
          variant: "default"
        });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `seo-images/${timestamp}-${sanitizedName}`;

      // Progress simulation (Supabase doesn't provide real progress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('post-assets')
        .upload(fileName, file, {
          cacheControl: '31536000', // 1 year cache
          upsert: false
        });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (error) {
        throw new Error(`Erro no upload: ${error.message}`);
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('post-assets')
        .getPublicUrl(data.path);

      if (!publicUrlData.publicUrl) {
        throw new Error('Erro ao gerar URL pública');
      }

      // Get image dimensions
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const seoImage: SEOImage = {
            url: publicUrlData.publicUrl,
            alt: '', // Will be filled by user
            width: img.width,
            height: img.height
          };
          resolve(seoImage);
        };
        img.onerror = () => reject(new Error('Erro ao carregar dimensões da imagem'));
        img.src = publicUrlData.publicUrl;
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Erro no upload",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
      return null;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileSelect = async (file: File) => {
    const seoImage = await uploadImage(file);
    if (seoImage) {
      onChange(seoImage);
      toast({
        title: "Upload concluído",
        description: "Imagem carregada com sucesso. Não se esqueça de adicionar o texto alternativo.",
        variant: "default"
      });
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const removeImage = async () => {
    if (value?.url) {
      // Optionally delete from storage
      try {
        const path = value.url.split('/').pop();
        if (path) {
          await supabase.storage
            .from('post-assets')
            .remove([`seo-images/${path}`]);
        }
      } catch (error) {
        console.warn('Error deleting file from storage:', error);
      }
    }
    onChange(null);
    toast({
      title: "Imagem removida",
      description: "A imagem SEO foi removida do artigo.",
      variant: "default"
    });
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Imagem SEO (Open Graph / Twitter)
        </Label>
        <p className="text-xs text-muted-foreground">
          Imagem exibida quando o artigo é compartilhado nas redes sociais. 
          Recomendado: 1200×630px, formato WebP, ≤ 512KB.
        </p>
      </div>

      {!value ? (
        <Card className={cn(
          "border-2 border-dashed transition-colors cursor-pointer",
          dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
          uploading && "pointer-events-none opacity-50"
        )}>
          <CardContent 
            className="p-8 text-center"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                <Upload className="w-6 h-6 text-muted-foreground" />
              </div>
              
              {uploading ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Fazendo upload...</p>
                  <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-sm font-medium mb-1">
                      Arraste uma imagem ou clique para selecionar
                    </p>
                    <p className="text-xs text-muted-foreground">
                      WebP, JPEG ou PNG • Máx. 512KB
                    </p>
                  </div>
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/jpeg,image/webp,image/png';
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) handleFileSelect(file);
                      };
                      input.click();
                    }}
                  >
                    Selecionar arquivo
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Image Preview */}
              <div className="relative group">
                <img
                  src={value.url}
                  alt={value.alt || 'SEO preview'}
                  className="w-full max-w-md h-auto rounded-lg border shadow-sm"
                  style={{ aspectRatio: `${value.width}/${value.height}` }}
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={removeImage}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Image Info */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">
                  {value.width} × {value.height}px
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Aspect ratio: {(value.width / value.height).toFixed(2)}:1
                </Badge>
                {value.width >= 1200 && value.height >= 630 ? (
                  <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Dimensões ideais
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Considere usar 1200×630px
                  </Badge>
                )}
              </div>

              {/* Alt Text Input */}
              <div className="space-y-2">
                <Label htmlFor="seo-alt" className="text-sm font-medium text-red-600">
                  Texto alternativo (obrigatório) *
                </Label>
                <Input
                  id="seo-alt"
                  placeholder="Descreva a imagem para acessibilidade e SEO..."
                  value={value.alt}
                  onChange={(e) => onChange({ ...value, alt: e.target.value })}
                  className={cn(!value.alt && "border-red-200 focus:border-red-500")}
                />
                <p className="text-xs text-muted-foreground">
                  Exemplo: "Dashboard do modoPAG mostrando vendas do mês"
                </p>
              </div>

              {/* Caption Input */}
              <div className="space-y-2">
                <Label htmlFor="seo-caption" className="text-sm font-medium">
                  Legenda (opcional)
                </Label>
                <Input
                  id="seo-caption"
                  placeholder="Legenda da imagem..."
                  value={value.caption || ''}
                  onChange={(e) => onChange({ ...value, caption: e.target.value })}
                />
              </div>

              {/* Public URL Display */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">URL pública</Label>
                <div className="flex gap-2">
                  <Input
                    value={value.url}
                    readOnly
                    className="font-mono text-xs bg-muted"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(value.url);
                      toast({
                        title: "URL copiada",
                        description: "URL da imagem copiada para a área de transferência.",
                      });
                    }}
                  >
                    Copiar
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};