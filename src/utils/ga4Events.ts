// Enhanced GA4 event tracking for modoPAG Central de Ajuda

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

/**
 * Enhanced search event with more detailed parameters
 */
export const trackEnhancedSearch = (searchQuery: string, resultsCount: number, filters?: Record<string, any>) => {
  if (window.gtag) {
    window.gtag('event', 'search', {
      search_term: searchQuery,
      results_count: resultsCount,
      search_filters: filters ? JSON.stringify(filters) : undefined,
      engagement_time_msec: Date.now(),
      custom_parameter_1: 'central_ajuda'
    });
  }
};

/**
 * Track article engagement metrics
 */
export const trackArticleEngagement = (articleId: string, action: 'scroll_25' | 'scroll_50' | 'scroll_75' | 'scroll_100', timeOnPage?: number) => {
  if (window.gtag) {
    window.gtag('event', 'article_engagement', {
      article_id: articleId,
      engagement_type: action,
      time_on_page: timeOnPage,
      custom_parameter_1: 'article_reading'
    });
  }
};

/**
 * Track user journey through categories
 */
export const trackCategoryNavigation = (categorySlug: string, source: 'home' | 'search' | 'breadcrumb' | 'related') => {
  if (window.gtag) {
    window.gtag('event', 'category_navigation', {
      category_slug: categorySlug,
      navigation_source: source,
      timestamp: Date.now()
    });
  }
};

/**
 * Track feedback submission with sentiment
 */
export const trackFeedbackSubmission = (articleId: string, rating: number, hasComment: boolean) => {
  if (window.gtag) {
    window.gtag('event', 'feedback_submission', {
      article_id: articleId,
      rating: rating,
      has_comment: hasComment,
      feedback_sentiment: rating >= 4 ? 'positive' : rating >= 3 ? 'neutral' : 'negative'
    });
  }
};

/**
 * Track WhatsApp contact attempts
 */
export const trackWhatsAppContact = (source: string, intent: string) => {
  if (window.gtag) {
    window.gtag('event', 'whatsapp_contact', {
      contact_source: source,
      contact_intent: intent,
      conversion_funnel: 'support_request'
    });
  }
};

/**
 * Track site performance metrics
 */
export const trackPerformanceMetrics = (metrics: { lcp?: number; fid?: number; cls?: number; ttfb?: number }) => {
  if (window.gtag && Object.keys(metrics).length > 0) {
    window.gtag('event', 'web_vitals', {
      lcp: metrics.lcp,
      fid: metrics.fid,
      cls: metrics.cls,
      ttfb: metrics.ttfb,
      metric_source: 'performance_observer'
    });
  }
};

/**
 * Track user accessibility preferences
 */
export const trackAccessibilityUsage = (feature: 'high_contrast' | 'reduced_motion' | 'screen_reader' | 'keyboard_navigation') => {
  if (window.gtag) {
    window.gtag('event', 'accessibility_feature_used', {
      accessibility_feature: feature,
      user_preference: true
    });
  }
};

/**
 * Track error events for monitoring
 */
export const trackErrorEvent = (errorType: string, errorMessage: string, errorStack?: string) => {
  if (window.gtag) {
    window.gtag('event', 'exception', {
      description: errorMessage,
      fatal: false,
      error_type: errorType,
      error_stack: errorStack?.substring(0, 150) // Limit stack trace
    });
  }
};

/**
 * Initialize enhanced tracking
 */
export const initEnhancedTracking = () => {
  // Track scroll depth
  let scrollDepth = 0;
  const trackScrollDepth = () => {
    const scrolled = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
    
    if (scrolled >= 25 && scrollDepth < 25) {
      scrollDepth = 25;
      window.gtag?.('event', 'scroll', { percent_scrolled: 25 });
    } else if (scrolled >= 50 && scrollDepth < 50) {
      scrollDepth = 50;
      window.gtag?.('event', 'scroll', { percent_scrolled: 50 });
    } else if (scrolled >= 75 && scrollDepth < 75) {
      scrollDepth = 75;
      window.gtag?.('event', 'scroll', { percent_scrolled: 75 });
    } else if (scrolled >= 100 && scrollDepth < 100) {
      scrollDepth = 100;
      window.gtag?.('event', 'scroll', { percent_scrolled: 100 });
    }
  };

  // Throttled scroll tracking
  let ticking = false;
  const handleScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        trackScrollDepth();
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });

  // Track time on page when user leaves
  let startTime = Date.now();
  window.addEventListener('beforeunload', () => {
    const timeOnPage = Math.round((Date.now() - startTime) / 1000);
    window.gtag?.('event', 'timing_complete', {
      name: 'time_on_page',
      value: timeOnPage
    });
  });
};