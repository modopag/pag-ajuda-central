// Bundle analysis utilities for performance monitoring

/**
 * Analyzes the current bundle and logs performance metrics
 */
export const analyzeBundlePerformance = () => {
  if (typeof window === 'undefined') return;

  // Performance timing
  const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  
  if (perfData) {
    const metrics = {
      domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
      loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
      firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
      firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
      totalSize: 0,
      jsSize: 0,
      cssSize: 0,
      imageSize: 0
    };

    // Calculate resource sizes
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    resources.forEach(resource => {
      const size = resource.transferSize || 0;
      metrics.totalSize += size;
      
      if (resource.name.includes('.js')) {
        metrics.jsSize += size;
      } else if (resource.name.includes('.css')) {
        metrics.cssSize += size;
      } else if (resource.name.match(/\.(jpg|jpeg|png|gif|webp|svg)/)) {
        metrics.imageSize += size;
      }
    });

    console.group('📊 Bundle Performance Analysis');
    console.log('⏱️ Timing Metrics:', {
      'DOM Content Loaded': `${metrics.domContentLoaded}ms`,
      'Load Complete': `${metrics.loadComplete}ms`,
      'First Paint': `${metrics.firstPaint}ms`,
      'First Contentful Paint': `${metrics.firstContentfulPaint}ms`
    });
    
    console.log('📦 Bundle Size:', {
      'Total Size': `${(metrics.totalSize / 1024).toFixed(2)}KB`,
      'JavaScript': `${(metrics.jsSize / 1024).toFixed(2)}KB`,
      'CSS': `${(metrics.cssSize / 1024).toFixed(2)}KB`,
      'Images': `${(metrics.imageSize / 1024).toFixed(2)}KB`
    });
    
    console.log('🚀 Performance Score:', calculatePerformanceScore(metrics));
    console.groupEnd();

    return metrics;
  }
};

/**
 * Calculates a simple performance score based on key metrics
 */
const calculatePerformanceScore = (metrics: any): string => {
  let score = 100;
  
  // Penalize slow loading times
  if (metrics.firstContentfulPaint > 2000) score -= 20;
  if (metrics.domContentLoaded > 1500) score -= 15;
  if (metrics.loadComplete > 3000) score -= 15;
  
  // Penalize large bundle sizes
  if (metrics.totalSize > 500 * 1024) score -= 20; // 500KB
  if (metrics.jsSize > 200 * 1024) score -= 15; // 200KB
  
  if (score >= 90) return `🟢 Excellent (${score}/100)`;
  if (score >= 70) return `🟡 Good (${score}/100)`;
  if (score >= 50) return `🟠 Needs Improvement (${score}/100)`;
  return `🔴 Poor (${score}/100)`;
};

/**
 * Monitors Core Web Vitals
 */
export const monitorCoreWebVitals = () => {
  if (typeof window === 'undefined') return;

  // Largest Contentful Paint (LCP)
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    
    if (lastEntry.startTime < 2500) {
      console.log('🟢 LCP: Good', `${lastEntry.startTime}ms`);
    } else if (lastEntry.startTime < 4000) {
      console.log('🟡 LCP: Needs Improvement', `${lastEntry.startTime}ms`);
    } else {
      console.log('🔴 LCP: Poor', `${lastEntry.startTime}ms`);
    }
  });
  
  try {
    observer.observe({ entryTypes: ['largest-contentful-paint'] });
  } catch (e) {
    // Fallback if not supported
    console.log('Core Web Vitals monitoring not supported in this browser');
  }

  // Cumulative Layout Shift (CLS)
  let clsValue = 0;
  const clsObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!(entry as any).hadRecentInput) {
        clsValue += (entry as any).value;
      }
    }
    
    if (clsValue < 0.1) {
      console.log('🟢 CLS: Good', clsValue);
    } else if (clsValue < 0.25) {
      console.log('🟡 CLS: Needs Improvement', clsValue);
    } else {
      console.log('🔴 CLS: Poor', clsValue);
    }
  });
  
  try {
    clsObserver.observe({ entryTypes: ['layout-shift'] });
  } catch (e) {
    // Fallback if not supported
  }
};

// Auto-run analysis in development
if (import.meta.env.DEV) {
  // Wait for page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        analyzeBundlePerformance();
        monitorCoreWebVitals();
      }, 1000);
    });
  } else {
    setTimeout(() => {
      analyzeBundlePerformance();
      monitorCoreWebVitals();
    }, 1000);
  }
}