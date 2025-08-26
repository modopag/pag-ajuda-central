// Lighthouse optimization utilities

/**
 * Preload critical resources to improve performance
 */
export const preloadCriticalResources = () => {
  // Preload critical images
  const criticalImages = [
    '/modopag-logo-yellow.webp',
    '/modopag-logo-black.webp',
    '/og-default.jpg'
  ];

  criticalImages.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    link.type = src.endsWith('.webp') ? 'image/webp' : 'image/jpeg';
    document.head.appendChild(link);
  });
};

/**
 * Initialize performance optimizations
 */
export const initPerformanceOptimizations = () => {
  // Preload critical resources when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', preloadCriticalResources);
  } else {
    preloadCriticalResources();
  }

  // Add resource hints for external domains
  const addResourceHint = (href: string, rel: 'dns-prefetch' | 'preconnect') => {
    if (!document.querySelector(`link[rel="${rel}"][href="${href}"]`)) {
      const link = document.createElement('link');
      link.rel = rel;
      link.href = href;
      document.head.appendChild(link);
    }
  };

  // Prefetch external domains
  addResourceHint('https://www.google-analytics.com', 'dns-prefetch');
  addResourceHint('https://www.googletagmanager.com', 'dns-prefetch');
  addResourceHint('https://fonts.googleapis.com', 'preconnect');
  addResourceHint('https://fonts.gstatic.com', 'preconnect');
};

/**
 * Measure and log Core Web Vitals
 */
export const measureCoreWebVitals = () => {
  const vitals: Record<string, number> = {};

  // Largest Contentful Paint
  if ('PerformanceObserver' in window) {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          vitals.lcp = entry.startTime;
          console.log(`LCP: ${entry.startTime}ms`);
        }
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'first-input') {
          vitals.fid = (entry as any).processingStart - entry.startTime;
          console.log(`FID: ${vitals.fid}ms`);
        }
      }
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
          vitals.cls = (vitals.cls || 0) + (entry as any).value;
          console.log(`CLS: ${vitals.cls}`);
        }
      }
    }).observe({ entryTypes: ['layout-shift'] });
  }

  return vitals;
};

/**
 * Optimize images for better performance
 */
export const optimizeImages = () => {
  // Add intersection observer for lazy loading
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            observer.unobserve(img);
          }
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }
};

// Auto-initialize in browser environment
if (typeof window !== 'undefined') {
  initPerformanceOptimizations();
  measureCoreWebVitals();
}