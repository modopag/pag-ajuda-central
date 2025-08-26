import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, X, Eye, Download, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AssetFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
}

interface AssetUploaderProps {
  label: string;
  accept?: string;
  maxSize?: number; // in MB
  currentAsset?: string;
  onUpload: (url: string) => void;
  onRemove?: () => void;
  description?: string;
  showPreview?: boolean;
  compress?: boolean;
}

export function AssetUploader({
  label,
  accept = 'image/*',
  maxSize = 5,
  currentAsset,
  onUpload,
  onRemove,
  description,
  showPreview = true,
  compress = true
}: AssetUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAsset || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Compress image if needed
  const compressImage = (file: File, maxWidth = 1920, quality = 0.8): Promise<File> => {
    return new Promise((resolve) => {
      if (!compress || !file.type.startsWith('image/')) {
        resolve(file);
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          file.type,
          quality
        );
      };

      img.src = URL.createObjectURL(file);
    });
  };

  // Simulate file upload (in real app, this would upload to server/storage)
  const uploadFile = async (file: File): Promise<string> => {
    // Compress image if applicable
    const processedFile = await compressImage(file);
    
    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      setUploadProgress(i);
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // In real implementation, upload to server and return URL
    // For now, create a blob URL for preview
    const fileId = Math.random().toString(36).substring(7);
    const url = `/lovable-uploads/${fileId}-${processedFile.name}`;
    
    // Store file in browser cache for demo
    const reader = new FileReader();
    reader.onload = () => {
      const blobUrl = URL.createObjectURL(processedFile);
      // In real app, this would be the server URL
      setPreviewUrl(blobUrl);
    };
    reader.readAsDataURL(processedFile);

    return url;
  };

  const handleFileSelect = async (file: File) => {
    setError(null);

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`Arquivo muito grande. Máximo ${maxSize}MB.`);
      return;
    }

    // Validate file type
    if (accept && !file.type.match(accept.replace('*', '.*'))) {
      setError(`Tipo de arquivo não suportado. Aceito: ${accept}`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const url = await uploadFile(file);
      onUpload(url);
      
      toast({
        title: 'Upload concluído',
        description: `${file.name} foi enviado com sucesso!`
      });
    } catch (error) {
      setError('Erro no upload. Tente novamente.');
      toast({
        title: 'Erro no upload',
        description: 'Não foi possível enviar o arquivo.',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    if (onRemove) {
      onRemove();
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Upload className="w-4 h-4" />
          {label}
        </CardTitle>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Asset Preview */}
        {showPreview && previewUrl && (
          <div className="relative border rounded-lg p-2">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="outline" className="text-xs">
                Asset Atual
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
            
            {previewUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-full h-32 object-contain mx-auto rounded"
              />
            ) : (
              <div className="h-32 bg-muted rounded flex items-center justify-center">
                <span className="text-xs text-muted-foreground">Preview não disponível</span>
              </div>
            )}
          </div>
        )}

        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive 
              ? 'border-primary bg-primary/10' 
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
          onDragEnter={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragActive(false);
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          {isUploading ? (
            <div className="space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground">Enviando arquivo...</p>
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-xs text-muted-foreground">{uploadProgress}%</p>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
              <div>
                <p className="text-sm font-medium">
                  Arraste e solte um arquivo aqui
                </p>
                <p className="text-xs text-muted-foreground">
                  ou clique para selecionar
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Máximo {maxSize}MB • {accept}
              </p>
            </div>
          )}
        </div>

        {/* File Input */}
        <Input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          className="cursor-pointer"
          disabled={isUploading}
        />

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Upload Button */}
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full"
          variant="outline"
        >
          <Upload className="w-4 h-4 mr-2" />
          {isUploading ? 'Enviando...' : 'Selecionar Arquivo'}
        </Button>
      </CardContent>
    </Card>
  );
}