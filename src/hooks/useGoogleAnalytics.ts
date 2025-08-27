import { useEffect, useCallback } from 'react';
import { useCookieConsent } from './useCookieConsent';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export const useGoogleAnalytics = (measurementId?: string) => {
  const { preferences, hasConsented } = useCookieConsent();

  // Initialize Google Analytics - CONSENT-GATED THIRD PARTIES
  const initGA = useCallback((id: string) => {
    if (typeof window === 'undefined' || !id) return;

    // Only load if consent is granted - consent-gated third parties
    if (!hasConsented || !preferences.analytics) {
      console.log('[GA4] Skipping GA4 load - no consent granted');
      return;
    }

    console.log('[GA4] Loading GA4 after consent granted');

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    
    // Define gtag function
    window.gtag = function gtag(...args: any[]) {
      window.dataLayer.push(args);
    };

    // Set consent state to granted since user already consented
    window.gtag('consent', 'default', {
      analytics_storage: 'granted',
      ad_storage: preferences.marketing ? 'granted' : 'denied',
      ad_user_data: preferences.marketing ? 'granted' : 'denied',
      ad_personalization: preferences.marketing ? 'granted' : 'denied',
      wait_for_update: 500,
    });

    // Load GA script only after consent - deferred loading
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    document.head.appendChild(script);

    // Initialize GA after script loads
    script.onload = () => {
      window.gtag('js', new Date());
      window.gtag('config', id, {
        anonymize_ip: true,
        allow_google_signals: preferences.marketing,
        allow_ad_personalization_signals: preferences.marketing,
      });
      console.log('[GA4] Successfully initialized');
    };

    return () => {
      // Cleanup script if needed
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [hasConsented, preferences.analytics, preferences.marketing]);

  // Update consent based on user preferences
  useEffect(() => {
    if (!measurementId || !hasConsented || typeof window === 'undefined') return;

    if (window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: preferences.analytics ? 'granted' : 'denied',
        ad_storage: preferences.marketing ? 'granted' : 'denied',
        ad_user_data: preferences.marketing ? 'granted' : 'denied',
        ad_personalization: preferences.marketing ? 'granted' : 'denied',
      });
    }
  }, [preferences, hasConsented, measurementId]);

  // Initialize GA when measurement ID is available and consent is granted
  useEffect(() => {
    if (!measurementId || !hasConsented || !preferences.analytics) return;

    // Only load GA4 after user consents - performance optimization
    const loadGA4AfterConsent = () => {
      const cleanup = initGA(measurementId);
      return cleanup;
    };

    // Use requestIdleCallback to defer GA4 loading - consent-gated third parties
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      requestIdleCallback(loadGA4AfterConsent, { timeout: 3000 });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(loadGA4AfterConsent, 100);
    }
  }, [measurementId, hasConsented, preferences.analytics, initGA]);

  // Track events (only if analytics consent is granted)
  const trackEvent = useCallback((eventName: string, parameters?: Record<string, any>) => {
    if (!measurementId || !hasConsented || !preferences.analytics || typeof window === 'undefined') return;

    if (window.gtag) {
      window.gtag('event', eventName, {
        ...parameters,
        timestamp: new Date().toISOString(),
      });
    }
  }, [measurementId, hasConsented, preferences.analytics]);

  // Track page views
  const trackPageView = useCallback((path: string, title?: string) => {
    if (!measurementId || !hasConsented || !preferences.analytics || typeof window === 'undefined') return;

    if (window.gtag) {
      window.gtag('config', measurementId, {
        page_path: path,
        page_title: title,
        anonymize_ip: true,
      });
    }
  }, [measurementId, hasConsented, preferences.analytics]);

  return {
    trackEvent,
    trackPageView,
    canTrack: hasConsented && preferences.analytics,
  };
};