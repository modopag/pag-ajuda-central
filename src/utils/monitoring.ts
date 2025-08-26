// Real-time monitoring utilities for post-launch tracking

interface MonitoringEvent {
  type: 'error' | 'search_no_results' | 'feedback_low' | 'page_not_found';
  data: Record<string, any>;
  timestamp: number;
  url: string;
  userAgent: string;
}

class AppMonitoring {
  private events: MonitoringEvent[] = [];
  private isEnabled = true;

  constructor() {
    this.setupErrorMonitoring();
    this.setupPerformanceMonitoring();
    
    // Auto-report every 5 minutes in production
    if (!import.meta.env.DEV) {
      setInterval(() => this.reportEvents(), 5 * 60 * 1000);
    }
  }

  /**
   * Track 404 errors and missing content
   */
  track404Error(path: string, referrer?: string) {
    this.addEvent({
      type: 'page_not_found',
      data: { path, referrer },
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent
    });

    // Log for immediate debugging
    console.warn('📊 404 Tracked:', { path, referrer });
  }

  /**
   * Track search queries that return no results
   */
  trackEmptySearch(query: string, filters?: Record<string, any>) {
    this.addEvent({
      type: 'search_no_results',
      data: { query, filters, queryLength: query.length },
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent
    });

    console.warn('📊 Empty Search Tracked:', { query, filters });
  }

  /**
   * Track articles with consistently low ratings
   */
  trackLowFeedback(articleId: string, rating: 'helpful' | 'not_helpful', category?: string) {
    this.addEvent({
      type: 'feedback_low',
      data: { articleId, rating, category },
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent
    });

    if (rating === 'not_helpful') {
      console.warn('📊 Low Feedback Tracked:', { articleId, category });
    }
  }

  /**
   * Track JavaScript errors
   */
  private setupErrorMonitoring() {
    window.addEventListener('error', (event) => {
      this.addEvent({
        type: 'error',
        data: {
          message: event.message,
          filename: event.filename,
          line: event.lineno,
          column: event.colno,
          stack: event.error?.stack
        },
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent
      });
    });

    // Promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.addEvent({
        type: 'error',
        data: {
          message: 'Unhandled Promise Rejection',
          reason: event.reason?.toString(),
          stack: event.reason?.stack
        },
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent
      });
    });
  }

  /**
   * Monitor Core Web Vitals and performance issues
   */
  private setupPerformanceMonitoring() {
    // Track slow pages (>3s load time)
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      if (loadTime > 3000) {
        console.warn('📊 Slow Page Load:', { loadTime, url: window.location.href });
      }
    });

    // Track large layout shifts
    if ('PerformanceObserver' in window) {
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        
        if (clsValue > 0.25) {
          console.warn('📊 High CLS Detected:', { clsValue, url: window.location.href });
        }
      });

      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        // Browser doesn't support layout-shift
      }
    }
  }

  private addEvent(event: MonitoringEvent) {
    if (!this.isEnabled) return;
    
    this.events.push(event);
    
    // Keep only last 100 events to prevent memory issues
    if (this.events.length > 100) {
      this.events = this.events.slice(-100);
    }
  }

  /**
   * Get monitoring report for admin dashboard
   */
  getReport() {
    const now = Date.now();
    const last24h = now - (24 * 60 * 60 * 1000);
    
    const recentEvents = this.events.filter(e => e.timestamp > last24h);
    
    return {
      totalEvents: recentEvents.length,
      errors: recentEvents.filter(e => e.type === 'error').length,
      emptySearches: recentEvents.filter(e => e.type === 'search_no_results').length,
      lowFeedback: recentEvents.filter(e => e.type === 'feedback_low').length,
      pageNotFound: recentEvents.filter(e => e.type === 'page_not_found').length,
      topEmptySearches: this.getTopEmptySearches(recentEvents),
      mostProblematicArticles: this.getMostProblematicArticles(recentEvents),
      common404s: this.getCommon404s(recentEvents)
    };
  }

  private getTopEmptySearches(events: MonitoringEvent[]) {
    const searches = events
      .filter(e => e.type === 'search_no_results')
      .reduce((acc, e) => {
        acc[e.data.query] = (acc[e.data.query] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(searches)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([query, count]) => ({ query, count }));
  }

  private getMostProblematicArticles(events: MonitoringEvent[]) {
    const articles = events
      .filter(e => e.type === 'feedback_low' && e.data.rating === 'not_helpful')
      .reduce((acc, e) => {
        acc[e.data.articleId] = (acc[e.data.articleId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(articles)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([articleId, count]) => ({ articleId, count }));
  }

  private getCommon404s(events: MonitoringEvent[]) {
    const paths = events
      .filter(e => e.type === 'page_not_found')
      .reduce((acc, e) => {
        acc[e.data.path] = (acc[e.data.path] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(paths)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([path, count]) => ({ path, count }));
  }

  private reportEvents() {
    const report = this.getReport();
    
    if (report.totalEvents > 0) {
      console.group('📊 Monitoring Report (Last 24h)');
      console.log('Total Events:', report.totalEvents);
      console.log('Errors:', report.errors);
      console.log('Empty Searches:', report.emptySearches);
      console.log('Low Feedback:', report.lowFeedback);
      console.log('404s:', report.pageNotFound);
      
      if (report.topEmptySearches.length > 0) {
        console.log('Top Empty Searches:', report.topEmptySearches);
      }
      
      if (report.mostProblematicArticles.length > 0) {
        console.log('Articles Needing Improvement:', report.mostProblematicArticles);
      }
      
      if (report.common404s.length > 0) {
        console.log('Common 404s:', report.common404s);
      }
      
      console.groupEnd();
    }
  }

  // Public API
  enable() { this.isEnabled = true; }
  disable() { this.isEnabled = false; }
  getEvents() { return [...this.events]; }
  clearEvents() { this.events = []; }
}

// Export singleton instance
export const monitoring = new AppMonitoring();

// Make available globally for debugging
if (import.meta.env.DEV) {
  (window as any).__monitoring = monitoring;
}
