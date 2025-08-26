import { useEffect } from 'react';

interface PerformanceTrackerProps {
  enabled?: boolean;
}

export const PerformanceTracker = ({ enabled = true }: PerformanceTrackerProps) => {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // Initialize SEO optimizations
    import('@/utils/seoOptimizer').then(({ initSEOOptimizations }) => {
      initSEOOptimizations();
    });

    // Track Core Web Vitals
    const trackWebVitals = async () => {
      if ('PerformanceObserver' in window) {
        // LCP (Largest Contentful Paint)
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          
          console.log('LCP:', lastEntry.startTime, 'ms');
          
          // Track in analytics if needed
          if (typeof window.gtag === 'function') {
            window.gtag('event', 'web_vitals', {
              name: 'LCP',
              value: Math.round(lastEntry.startTime),
              event_category: 'performance'
            });
          }
        });

        // FID (First Input Delay)
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const fidEntry = entry as any;
            const fid = fidEntry.processingStart - fidEntry.startTime;
            
            console.log('FID:', fid, 'ms');
            
            if (typeof window.gtag === 'function') {
              window.gtag('event', 'web_vitals', {
                name: 'FID',
                value: Math.round(fid),
                event_category: 'performance'
              });
            }
          }
        });

        // CLS (Cumulative Layout Shift)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          
          console.log('CLS:', clsValue);
          
          if (typeof window.gtag === 'function') {
            window.gtag('event', 'web_vitals', {
              name: 'CLS',
              value: Math.round(clsValue * 1000),
              event_category: 'performance'
            });
          }
        });

        try {
          lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
          fidObserver.observe({ type: 'first-input', buffered: true });
          clsObserver.observe({ type: 'layout-shift', buffered: true });
        } catch (error) {
          console.warn('Performance monitoring not supported');
        }

        // Cleanup on unmount
        return () => {
          lcpObserver.disconnect();
          fidObserver.disconnect();
          clsObserver.disconnect();
        };
      }
    };

    trackWebVitals();
  }, [enabled]);

  return null; // This is a tracking component, no UI
};

// Global performance optimization hook
export const usePerformanceOptimizations = () => {
  useEffect(() => {
    // Preload critical fonts
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap';
    link.onload = () => {
      link.rel = 'stylesheet';
    };
    document.head.appendChild(link);

    // Optimize images as they load
    const imageObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            const images = element.tagName === 'IMG' 
              ? [element as HTMLImageElement] 
              : Array.from(element.querySelectorAll('img'));
            
            images.forEach((img) => {
              if (!img.hasAttribute('loading')) {
                img.loading = 'lazy';
              }
              if (!img.hasAttribute('decoding')) {
                img.decoding = 'async';
              }
            });
          }
        });
      });
    });

    imageObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      imageObserver.disconnect();
    };
  }, []);
};