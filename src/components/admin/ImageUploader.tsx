import { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { optimizeImage } from '@/utils/imageOptimization';

interface ImageUploaderProps {
  onUpload: (file: File, altText: string) => Promise<string>;
  currentImage?: string;
  currentAltText?: string;
  onRemove?: () => void;
  label: string;
  className?: string;
}

export const ImageUploader = ({
  onUpload,
  currentImage,
  currentAltText,
  onRemove,
  label,
  className
}: ImageUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [altText, setAltText] = useState(currentAltText || '');
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!altText.trim()) {
      alert('Por favor, adicione um texto alternativo para a imagem');
      return;
    }

    setIsUploading(true);
    try {
      // Optimize image to WEBP format
      const { file: optimizedFile, originalSize, newSize } = await optimizeImage(file);
      
      // Create a File object from the optimized blob
      const optimizedFileObj = new File([optimizedFile], file.name.replace(/\.[^/.]+$/, '.webp'), {
        type: 'image/webp',
        lastModified: Date.now()
      });
      
      console.log(`Image optimized: ${originalSize} → ${newSize} bytes (${Math.round((1 - newSize/originalSize) * 100)}% reduction)`);
      
      await onUpload(optimizedFileObj, altText);
    } catch (error) {
      console.error('Erro no upload:', error);
      alert('Erro ao fazer upload da imagem');
    } finally {
      setIsUploading(false);
    }
  }, [onUpload, altText]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      handleFileUpload(imageFiles[0]);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  return (
    <div className={cn("space-y-4", className)}>
      <Label className="text-sm font-medium">{label}</Label>
      
      {currentImage ? (
        <Card className="p-4">
          <div className="flex items-start gap-4">
            <img 
              src={currentImage} 
              alt={currentAltText} 
              className="w-32 h-32 object-cover rounded-lg border"
            />
            <div className="flex-1 space-y-2">
              <div>
                <Label htmlFor="alt-text" className="text-xs">Texto Alternativo *</Label>
                <Input
                  id="alt-text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Descreva a imagem..."
                  className="mt-1"
                />
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={onRemove}
                className="w-fit"
              >
                <X className="w-4 h-4 mr-2" />
                Remover
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          <Input
            placeholder="Texto alternativo da imagem *"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            className="mb-2"
          />
          
          <Card 
            className={cn(
              "border-2 border-dashed p-8 text-center cursor-pointer transition-colors",
              dragActive && "border-primary bg-primary/5",
              !altText.trim() && "opacity-50 cursor-not-allowed"
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleInputChange}
              className="hidden"
              id={`file-upload-${label}`}
              disabled={!altText.trim() || isUploading}
            />
            <label 
              htmlFor={`file-upload-${label}`}
              className={cn(
                "flex flex-col items-center gap-2",
                (!altText.trim() || isUploading) && "cursor-not-allowed"
              )}
            >
              {isUploading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              ) : (
                <ImageIcon className="w-8 h-8 text-muted-foreground" />
              )}
              <div className="text-sm text-muted-foreground">
                {isUploading ? 'Fazendo upload...' : 'Clique ou arraste uma imagem'}
              </div>
              <div className="text-xs text-muted-foreground">
                PNG, JPG até 5MB (será convertido para WEBP)
              </div>
            </label>
          </Card>
        </div>
      )}
    </div>
  );
};