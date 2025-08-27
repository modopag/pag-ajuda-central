import { useState, useCallback, useMemo } from 'react';
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
  quality?: number;
}

export const ImageOptimizer = ({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  sizes = "100vw",
  quality = 80
}: ImageOptimizerProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  // Generate WebP-optimized responsive sources
  const { webpSrc, fallbackSrc, srcSet } = useMemo(() => {
    const isExternal = !src.startsWith('/') && !src.includes(window.location.hostname);
    
    if (isExternal) {
      // For external images, return as-is (could integrate with image CDN here)
      return { webpSrc: src, fallbackSrc: src, srcSet: '' };
    }

    // For internal images, generate WebP variants
    const baseUrl = src.replace(/\.[^.]+$/, ''); // Remove extension
    const extension = src.split('.').pop()?.toLowerCase();
    
    // Generate WebP source with quality optimization
    const webpSrc = `${baseUrl}.webp?q=${quality}`;
    
    // Generate responsive srcSet for WebP
    const widths = width ? [width * 0.5, width, width * 1.5, width * 2] : [320, 640, 960, 1280];
    const webpSrcSet = widths
      .filter(w => !width || w <= width * 2) // Don't go beyond 2x the requested width
      .map(w => `${baseUrl}.webp?w=${Math.round(w)}&q=${quality} ${w}w`)
      .join(', ');
    
    return { 
      webpSrc, 
      fallbackSrc: src, 
      srcSet: webpSrcSet 
    };
  }, [src, quality, width]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setHasError(false);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoaded(true);
  }, []);

  return (
    <div 
      className={cn("relative overflow-hidden", className)}
      // Reserve layout space to prevent CLS - critical performance improvement
      style={width && height ? { 
        aspectRatio: `${width}/${height}`,
        minHeight: height,
        minWidth: width 
      } : undefined}
    >
      {/* Loading placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-muted animate-pulse flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center text-muted-foreground text-sm">
          <span>Imagem não disponível</span>
        </div>
      )}
      
      {/* Modern picture element for WebP support with fallback */}
      <picture>
        {/* WebP source for modern browsers */}
        <source 
          srcSet={srcSet || webpSrc} 
          sizes={sizes}
          type="image/webp" 
        />
        
        {/* Fallback for older browsers */}
        <LazyImage
          src={fallbackSrc}
          alt={alt}
          className={cn(
            "transition-all duration-500 w-full h-full object-cover",
            isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105",
            hasError && "hidden"
          )}
          loading={priority ? 'eager' : 'lazy'}
          onLoad={handleLoad}
        />
      </picture>
    </div>
  );
};