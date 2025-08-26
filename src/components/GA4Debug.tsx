import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGoogleAnalytics } from '@/hooks/useGoogleAnalytics';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import { useSettings } from '@/hooks/useSettings';
import { trackEnhancedSearch, trackArticleEngagement, trackFeedbackSubmission } from '@/utils/ga4Events';
import { BarChart3, Cookie, TestTube, Eye, EyeOff } from 'lucide-react';

export const GA4Debug = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { seo } = useSettings();
  const { canTrack, trackEvent } = useGoogleAnalytics(seo.google_analytics_id);
  const { hasConsented, preferences } = useCookieConsent();

  const testEvents = [
    {
      name: 'Test Search Event',
      action: () => trackEnhancedSearch('modoPAG test', 5, { source: 'debug' }),
    },
    {
      name: 'Test Article Event',
      action: () => trackArticleEngagement('test-article', 'scroll_50', 30),
    },
    {
      name: 'Test Feedback Event',
      action: () => trackFeedbackSubmission('test-article', 5, true),
    },
    {
      name: 'Test Custom Event',
      action: () => trackEvent('debug_test', { debug: true, timestamp: Date.now() }),
    },
  ];

  if (!import.meta.env.DEV) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(!isVisible)}
        className="mb-2 bg-background border shadow-lg"
      >
        {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        GA4 Debug
      </Button>

      {isVisible && (
        <Card className="w-80 shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <BarChart3 className="w-4 h-4" />
              GA4 Debug Panel
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 text-xs">
            {/* Status */}
            <div className="space-y-2">
              <h4 className="font-medium">Status</h4>
              <div className="grid grid-cols-2 gap-2">
                <Badge variant={seo.google_analytics_id ? 'default' : 'destructive'}>
                  ID: {seo.google_analytics_id ? 'OK' : 'Missing'}
                </Badge>
                <Badge variant={hasConsented ? 'default' : 'secondary'}>
                  Consent: {hasConsented ? 'Yes' : 'No'}
                </Badge>
                <Badge variant={preferences.analytics ? 'default' : 'secondary'}>
                  Analytics: {preferences.analytics ? 'On' : 'Off'}
                </Badge>
                <Badge variant={canTrack ? 'default' : 'secondary'}>
                  Tracking: {canTrack ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>

            {/* Configuration */}
            <div className="space-y-2">
              <h4 className="font-medium">Configuration</h4>
              <div className="bg-muted/50 p-2 rounded text-[10px] font-mono">
                <div>ID: {seo.google_analytics_id || 'Not set'}</div>
                <div>gtag: {typeof window !== 'undefined' && window.gtag ? 'Loaded' : 'Missing'}</div>
                <div>dataLayer: {typeof window !== 'undefined' && window.dataLayer ? `${window.dataLayer.length} events` : 'Missing'}</div>
              </div>
            </div>

            {/* Test Events */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <TestTube className="w-3 h-3" />
                Test Events
              </h4>
              <div className="grid gap-1">
                {testEvents.map((test, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={test.action}
                    disabled={!canTrack}
                    className="text-xs h-7 justify-start"
                  >
                    {test.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Cookie Preferences */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Cookie className="w-3 h-3" />
                Preferences
              </h4>
              <div className="bg-muted/50 p-2 rounded text-[10px]">
                <div>Necessary: ✓</div>
                <div>Analytics: {preferences.analytics ? '✓' : '✗'}</div>
                <div>Marketing: {preferences.marketing ? '✓' : '✗'}</div>
              </div>
            </div>

            {/* Instructions */}
            {!canTrack && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded text-[10px] text-yellow-700 dark:text-yellow-300">
                💡 Accept cookies to enable tracking
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};