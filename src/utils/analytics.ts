// Analytics tracking utilities for modoPAG Central de Ajuda

interface AnalyticsEvent {
  event_name: string;
  parameters: Record<string, any>;
}

// Track FAQ search event
export const trackFAQSearch = (query: string, resultsCount: number) => {
  const event: AnalyticsEvent = {
    event_name: 'faq_search',
    parameters: {
      q: query.trim(),
      results_count: resultsCount,
      timestamp: Date.now(),
      source: 'central_ajuda'
    }
  };
  
  // Console log for development/debugging
  console.log('Analytics Event:', event);
  
  // In production, this would send to your analytics provider
  // Example: gtag('event', event.event_name, event.parameters);
  // Example: analytics.track(event.event_name, event.parameters);
  
  return event;
};

// Track article view event
export const trackFAQViewArticle = (articleId: string, categoryId: string, articleTitle?: string) => {
  const event: AnalyticsEvent = {
    event_name: 'faq_view_article',
    parameters: {
      article_id: articleId,
      category_id: categoryId,
      article_title: articleTitle,
      timestamp: Date.now(),
      source: 'central_ajuda'
    }
  };
  
  console.log('Analytics Event:', event);
  return event;
};

// Track article feedback event
export const trackFAQFeedback = (articleId: string, isHelpful: boolean, categoryId?: string) => {
  const event: AnalyticsEvent = {
    event_name: 'faq_feedback',
    parameters: {
      article_id: articleId,
      is_helpful: isHelpful,
      category_id: categoryId,
      timestamp: Date.now(),
      source: 'central_ajuda'
    }
  };
  
  console.log('Analytics Event:', event);
  return event;
};

// Track WhatsApp CTA clicks
export const trackWhatsAppCTA = (source: string, context?: string) => {
  const event: AnalyticsEvent = {
    event_name: 'whatsapp_cta_click',
    parameters: {
      source: source, // 'search_empty', 'article_feedback', 'category_empty', etc.
      context: context,
      timestamp: Date.now()
    }
  };
  
  console.log('Analytics Event:', event);
  return event;
};