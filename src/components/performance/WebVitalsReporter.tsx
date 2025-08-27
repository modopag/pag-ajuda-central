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
    import('web-vitals').then(({ onCLS, onFCP, onINP, onLCP, onTTFB }) => {
      const sendMetric = (metric: any) => {
        const webVitalsData: WebVitalsMetric = {
          name: metric.name,
          value: metric.value,
          id: metric.id,
          path: window.location.pathname,
          timestamp: Date.now()
        };

        // Send to analytics endpoint (use beacon for reliability)
        const sendToEndpoint = () => {
          if (navigator.sendBeacon) {
            return navigator.sendBeacon('/api/vitals', JSON.stringify(webVitalsData));
          } else {
            // Fallback for older browsers
            return fetch('/api/vitals', {
              method: 'POST',
              body: JSON.stringify(webVitalsData),
              headers: { 'Content-Type': 'application/json' },
              keepalive: true
            }).catch(() => false);
          }
        };

        // Try real endpoint first, fallback to mock for development
        if (!sendToEndpoint()) {
          // Import mock endpoint dynamically to avoid bundling in production
          import('@/utils/webVitalsMock').then(({ mockWebVitalsEndpoint }) => {
            mockWebVitalsEndpoint(webVitalsData);
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
      onCLS(sendMetric);
      onFCP(sendMetric);
      onINP(sendMetric); // INP replaced FID in web-vitals v4+
      onLCP(sendMetric);
      onTTFB(sendMetric);

    }).catch(() => {
      // Silent fail if web-vitals import fails
    });
  }, [canTrack]);

  // This component doesn't render anything
  return null;
};