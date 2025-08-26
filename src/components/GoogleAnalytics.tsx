import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useGoogleAnalytics } from '@/hooks/useGoogleAnalytics';
import { useCookieConsent } from '@/hooks/useCookieConsent';

interface GoogleAnalyticsProps {
  measurementId?: string;
}

export const GoogleAnalytics = ({ measurementId }: GoogleAnalyticsProps) => {
  const location = useLocation();
  const { trackPageView, canTrack } = useGoogleAnalytics(measurementId);
  const { hasConsented, preferences } = useCookieConsent();

  // Track page views when location changes and consent is granted
  useEffect(() => {
    if (canTrack && measurementId) {
      trackPageView(location.pathname, document.title);
    }
  }, [location.pathname, canTrack, trackPageView, measurementId]);

  // Show consent status in development
  useEffect(() => {
    if (import.meta.env.DEV && measurementId) {
      console.log('GA4 Status:', {
        measurementId,
        hasConsented,
        analyticsAllowed: preferences.analytics,
        canTrack,
        currentPath: location.pathname
      });
    }
  }, [measurementId, hasConsented, preferences.analytics, canTrack, location.pathname]);

  return null; // This component doesn't render anything
};