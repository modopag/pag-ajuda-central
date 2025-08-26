// Performance monitoring and optimization utilities

interface PerformanceMetrics {
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
}

interface ResourceTiming {
  name: string;
  size: number;
  duration: number;
  type: string;
}

/**
 * Performance monitoring class for tracking Core Web Vitals
 */
export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {};
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers() {
    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          this.metrics.lcp = lastEntry.startTime;
          this.evaluateMetric('LCP', lastEntry.startTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (error) {
        console.warn('LCP observer not supported:', error);
      }

      // First Input Delay
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            this.metrics.fid = entry.processingStart - entry.startTime;
            this.evaluateMetric('FID', this.metrics.fid);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (error) {
        console.warn('FID observer not supported:', error);
      }

      // Cumulative Layout Shift
      try {
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          this.metrics.cls = clsValue;
          this.evaluateMetric('CLS', clsValue);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (error) {
        console.warn('CLS observer not supported:', error);
      }

      // First Contentful Paint
      try {
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (entry.name === 'first-contentful-paint') {
              this.metrics.fcp = entry.startTime;
              this.evaluateMetric('FCP', entry.startTime);
            }
          });
        });
        fcpObserver.observe({ entryTypes: ['paint'] });
        this.observers.push(fcpObserver);
      } catch (error) {
        console.warn('FCP observer not supported:', error);
      }
    }
  }

  private evaluateMetric(name: string, value: number) {
    let status = 'good';
    let threshold = '';

    switch (name) {
      case 'LCP':
        if (value > 4000) status = 'poor';
        else if (value > 2500) status = 'needs-improvement';
        threshold = 'Good: ≤2.5s, Needs Improvement: ≤4.0s, Poor: >4.0s';
        break;
      case 'FID':
        if (value > 300) status = 'poor';
        else if (value > 100) status = 'needs-improvement';
        threshold = 'Good: ≤100ms, Needs Improvement: ≤300ms, Poor: >300ms';
        break;
      case 'CLS':
        if (value > 0.25) status = 'poor';
        else if (value > 0.1) status = 'needs-improvement';
        threshold = 'Good: ≤0.1, Needs Improvement: ≤0.25, Poor: >0.25';
        break;
      case 'FCP':
        if (value > 3000) status = 'poor';
        else if (value > 1800) status = 'needs-improvement';
        threshold = 'Good: ≤1.8s, Needs Improvement: ≤3.0s, Poor: >3.0s';
        break;
    }

    if (import.meta.env.DEV) {
      console.log(`%c${name}: ${value.toFixed(2)}${name === 'CLS' ? '' : 'ms'} (${status})`, 
        `color: ${status === 'good' ? 'green' : status === 'needs-improvement' ? 'orange' : 'red'}`);
      console.log(`Threshold: ${threshold}`);
    }
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    // Add navigation timing metrics
    if ('performance' in window && window.performance.timing) {
      const timing = window.performance.timing;
      this.metrics.ttfb = timing.responseStart - timing.requestStart;
    }

    return { ...this.metrics };
  }

  /**
   * Get resource timing information
   */
  getResourceTiming(): ResourceTiming[] {
    if (!('performance' in window)) return [];

    const resources = window.performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    return resources.map(resource => ({
      name: resource.name,
      size: resource.transferSize || 0,
      duration: resource.duration,
      type: this.getResourceType(resource.name)
    }));
  }

  private getResourceType(url: string): string {
    if (url.match(/\.(js|jsx|ts|tsx)$/)) return 'script';
    if (url.match(/\.(css)$/)) return 'stylesheet';
    if (url.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|eot)$/)) return 'font';
    return 'other';
  }

  /**
   * Generate performance report
   */
  generateReport(): string {
    const metrics = this.getMetrics();
    const resources = this.getResourceTiming();
    
    let report = '=== Performance Report ===\n\n';
    
    // Core Web Vitals
    report += 'Core Web Vitals:\n';
    if (metrics.lcp) report += `LCP: ${metrics.lcp.toFixed(2)}ms\n`;
    if (metrics.fid) report += `FID: ${metrics.fid.toFixed(2)}ms\n`;
    if (metrics.cls) report += `CLS: ${metrics.cls.toFixed(3)}\n`;
    if (metrics.fcp) report += `FCP: ${metrics.fcp.toFixed(2)}ms\n`;
    if (metrics.ttfb) report += `TTFB: ${metrics.ttfb.toFixed(2)}ms\n`;
    
    // Resource summary
    report += '\nResource Summary:\n';
    const resourcesByType = resources.reduce((acc, resource) => {
      if (!acc[resource.type]) {
        acc[resource.type] = { count: 0, totalSize: 0, totalDuration: 0 };
      }
      acc[resource.type].count++;
      acc[resource.type].totalSize += resource.size;
      acc[resource.type].totalDuration += resource.duration;
      return acc;
    }, {} as Record<string, { count: number; totalSize: number; totalDuration: number }>);

    Object.entries(resourcesByType).forEach(([type, stats]) => {
      report += `${type}: ${stats.count} files, ${(stats.totalSize / 1024).toFixed(2)}KB, ${stats.totalDuration.toFixed(2)}ms\n`;
    });

    return report;
  }

  /**
   * Clean up observers
   */
  disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

/**
 * Singleton performance monitor instance
 */
export const performanceMonitor = new PerformanceMonitor();

/**
 * Initialize performance monitoring
 */
export const initializePerformanceMonitoring = () => {
  if (typeof window === 'undefined') return;

  // Monitor page load performance
  window.addEventListener('load', () => {
    setTimeout(() => {
      const report = performanceMonitor.generateReport();
      if (import.meta.env.DEV) {
        console.log(report);
      }
      
      // Send to analytics in production (if needed)
      if (import.meta.env.PROD) {
        // analytics.track('performance_metrics', performanceMonitor.getMetrics());
      }
    }, 1000);
  });

  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    performanceMonitor.disconnect();
  });
};

/**
 * Preload critical resources
 */
export const preloadCriticalResources = (resources: string[]) => {
  resources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    
    if (resource.match(/\.(woff|woff2)$/)) {
      link.as = 'font';
      link.crossOrigin = 'anonymous';
    } else if (resource.match(/\.(css)$/)) {
      link.as = 'style';
    } else if (resource.match(/\.(js)$/)) {
      link.as = 'script';
    } else if (resource.match(/\.(png|jpg|jpeg|webp)$/)) {
      link.as = 'image';
    }
    
    link.href = resource;
    document.head.appendChild(link);
  });
};

/**
 * Critical CSS inlining utility
 */
export const inlineCriticalCSS = (css: string) => {
  const style = document.createElement('style');
  style.textContent = css;
  style.setAttribute('data-critical', 'true');
  document.head.insertBefore(style, document.head.firstChild);
};