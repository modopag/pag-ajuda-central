import { useState, useCallback } from 'react';
import { LazyImage } from '@/components/LazyImage';
import { cn } from '@/lib/utils';

interface ImageOptimizerProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
}

export const ImageOptimizer = ({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  sizes = "100vw"
}: ImageOptimizerProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Generate responsive image URLs if source supports it
  const generateResponsiveSrc = useCallback((originalSrc: string) => {
    // For modoPAG assets, return as-is since they're already optimized
    if (originalSrc.includes('modopag') || originalSrc.startsWith('/')) {
      return originalSrc;
    }
    
    // For external images, you could add query parameters for resizing
    // Example: return `${originalSrc}?w=${width}&h=${height}&q=80`;
    return originalSrc;
  }, [width, height]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Loading placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-muted animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      <LazyImage
        src={generateResponsiveSrc(src)}
        alt={alt}
        className={cn(
          "transition-all duration-500",
          isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105",
          className
        )}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={handleLoad}
      />
      
      {/* Aspect ratio container for layout stability */}
      {width && height && (
        <div
          className="absolute inset-0 -z-10"
          style={{ aspectRatio: `${width}/${height}` }}
          aria-hidden="true"
        />
      )}
    </div>
  );
};