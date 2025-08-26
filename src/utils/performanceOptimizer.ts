// Performance optimization utilities for PageSpeed/Lighthouse

/**
 * Delay non-critical operations until after initial render
 */
export const scheduleAfterPaint = (callback: () => void, delay = 0) => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(callback, { timeout: 1000 });
  } else {
    setTimeout(callback, delay);
  }
};

/**
 * Preload critical resources
 */
export const preloadCriticalResources = () => {
  const criticalResources = [
    { href: '/modopag-logo-yellow.webp', as: 'image', type: 'image/webp' },
    { href: '/modopag-logo-black.webp', as: 'image', type: 'image/webp' },
  ];

  criticalResources.forEach(({ href, as, type }) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    if (type) link.type = type;
    document.head.appendChild(link);
  });
};

/**
 * Initialize performance optimizations
 */
export const initPerformanceOptimizations = () => {
  // Only run in production or when needed
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

  // Schedule after initial paint
  scheduleAfterPaint(() => {
    addResourceHint('https://www.google-analytics.com', 'dns-prefetch');
    addResourceHint('https://www.googletagmanager.com', 'dns-prefetch');
  });
};

// Auto-initialize in production
if (import.meta.env.PROD && typeof window !== 'undefined') {
  initPerformanceOptimizations();
}