// SEO Optimization utilities for modoPAG Central de Ajuda

export interface SEOConfig {
  title: string;
  description: string;
  keywords: string[];
  canonical?: string;
  image?: string;
  type?: 'website' | 'article';
}

// Core Web Vitals optimization helpers
export const preloadCriticalResources = () => {
  // Preload critical fonts
  const fontLinks = [
    'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap'
  ];

  fontLinks.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    link.onload = () => {
      link.rel = 'stylesheet';
    };
    document.head.appendChild(link);
  });

  // Preload critical images
  const criticalImages = [
    '/modopag-logo-yellow.webp',
    '/modopag-logo-black.webp'
  ];

  criticalImages.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });
};

// Generate optimized meta description
export const generateMetaDescription = (content: string, maxLength = 160): string => {
  // Remove HTML tags
  const cleanText = content.replace(/<[^>]*>/g, '');
  
  // Trim to maxLength while preserving word boundaries
  if (cleanText.length <= maxLength) return cleanText;
  
  const trimmed = cleanText.substring(0, maxLength);
  const lastSpace = trimmed.lastIndexOf(' ');
  
  return lastSpace > 0 
    ? trimmed.substring(0, lastSpace) + '...'
    : trimmed + '...';
};

// Generate SEO-friendly URL slug
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with single
};

// Extract keywords from content
export const extractKeywords = (content: string, title: string): string[] => {
  const stopWords = [
    'o', 'a', 'os', 'as', 'um', 'uma', 'uns', 'umas',
    'de', 'do', 'da', 'dos', 'das', 'em', 'no', 'na', 'nos', 'nas',
    'para', 'por', 'com', 'sem', 'sob', 'sobre', 'entre',
    'e', 'ou', 'mas', 'se', 'que', 'quando', 'onde', 'como', 'porque',
    'modopag', 'central', 'ajuda'
  ];

  const text = (content + ' ' + title).toLowerCase();
  const words = text
    .replace(/[^a-záàâãéèêíìîóòôõúùûç\s]/g, ' ')
    .split(/\s+/)
    .filter(word => 
      word.length > 3 && 
      !stopWords.includes(word) &&
      /[a-záàâãéèêíìîóòôõúùûç]/.test(word)
    );

  // Count word frequency
  const wordCount = words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Return top keywords
  return Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
};

// Optimize images for Core Web Vitals
export const optimizeImageLoading = (imgElement: HTMLImageElement) => {
  // Add loading="lazy" for non-critical images
  if (!imgElement.hasAttribute('loading')) {
    imgElement.loading = 'lazy';
  }

  // Add decoding="async" for better performance
  if (!imgElement.hasAttribute('decoding')) {
    imgElement.decoding = 'async';
  }

  // Ensure proper alt text for accessibility and SEO
  if (!imgElement.alt || imgElement.alt.trim() === '') {
    console.warn('Image missing alt text:', imgElement.src);
  }
};

// Monitor Core Web Vitals
export const trackWebVitals = () => {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

  // LCP (Largest Contentful Paint)
  const lcpObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    
    if (lastEntry.startTime > 2500) {
      console.warn('LCP is poor:', lastEntry.startTime, 'ms');
    }
  });

  // FID (First Input Delay)  
  const fidObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const fidEntry = entry as any; // PerformanceEventTiming
      const fid = fidEntry.processingStart - fidEntry.startTime;
      
      if (fid > 100) {
        console.warn('FID is poor:', fid, 'ms');
      }
    }
  });

  // CLS (Cumulative Layout Shift)
  let clsValue = 0;
  const clsObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!(entry as any).hadRecentInput) {
        clsValue += (entry as any).value;
        
        if (clsValue > 0.1) {
          console.warn('CLS is poor:', clsValue);
        }
      }
    }
  });

  try {
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    fidObserver.observe({ type: 'first-input', buffered: true });
    clsObserver.observe({ type: 'layout-shift', buffered: true });
  } catch (error) {
    console.warn('Performance monitoring not supported');
  }
};

// Initialize SEO optimizations
export const initSEOOptimizations = () => {
  if (typeof window === 'undefined') return;

  // Preload critical resources
  preloadCriticalResources();

  // Optimize all existing images
  document.querySelectorAll('img').forEach(optimizeImageLoading);

  // Monitor new images being added
  const imageObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          const images = element.tagName === 'IMG' 
            ? [element as HTMLImageElement] 
            : Array.from(element.querySelectorAll('img'));
          
          images.forEach(optimizeImageLoading);
        }
      });
    });
  });

  imageObserver.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Track Core Web Vitals
  trackWebVitals();
};