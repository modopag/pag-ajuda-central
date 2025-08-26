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

  // Initialize Google Analytics
  const initGA = useCallback((id: string) => {
    if (typeof window === 'undefined' || !id) return;

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    
    // Define gtag function
    window.gtag = function gtag(...args: any[]) {
      window.dataLayer.push(args);
    };

    // Set initial consent state (denied by default)
    window.gtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      wait_for_update: 500,
    });

    // Load GA script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    document.head.appendChild(script);

    // Initialize GA after script loads
    script.onload = () => {
      window.gtag('js', new Date());
      window.gtag('config', id, {
        anonymize_ip: true,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
      });
    };

    return () => {
      // Cleanup script if needed
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

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

  // Initialize GA when measurement ID is available
  useEffect(() => {
    if (!measurementId) return;

    const cleanup = initGA(measurementId);
    return cleanup;
  }, [measurementId, initGA]);

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