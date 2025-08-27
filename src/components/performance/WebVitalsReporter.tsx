import { useEffect } from 'react';
import { useCookieConsent } from '@/hooks/useCookieConsent';

interface WebVitalsMetric {
  name: string;
  value: number;
  id: string;
  path: string;
  timestamp: number;
}

export const WebVitalsReporter = () => {
  const { preferences } = useCookieConsent();
  const canTrack = preferences.analytics;

  useEffect(() => {
    // Only run in production and with user consent
    if (!import.meta.env.PROD || !canTrack) return;

    // Dynamically import web-vitals to avoid bundling in development
    import('web-vitals').then(({ getCLS, getFCP, getFID, getLCP, getTTFB }) => {
      const sendMetric = (metric: any) => {
        const webVitalsData: WebVitalsMetric = {
          name: metric.name,
          value: metric.value,
          id: metric.id,
          path: window.location.pathname,
          timestamp: Date.now()
        };

        // Send to analytics endpoint (use beacon for reliability)
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/vitals', JSON.stringify(webVitalsData));
        } else {
          // Fallback for older browsers
          fetch('/api/vitals', {
            method: 'POST',
            body: JSON.stringify(webVitalsData),
            headers: { 'Content-Type': 'application/json' },
            keepalive: true
          }).catch(() => {
            // Silent fail - don't break user experience
          });
        }

        // Also log to console in development
        if (import.meta.env.DEV) {
          console.log('[Web Vitals]', webVitalsData);
        }
      };

      // Measure all Core Web Vitals
      getCLS(sendMetric);
      getFCP(sendMetric);
      getFID(sendMetric);
      getLCP(sendMetric);
      getTTFB(sendMetric);

    }).catch(() => {
      // Silent fail if web-vitals import fails
    });
  }, [canTrack]);

  // This component doesn't render anything
  return null;
};