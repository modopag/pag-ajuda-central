import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Eye, EyeOff, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PerformanceMetrics {
  lcp?: number;
  fid?: number;
  cls?: number;
  ttfb?: number;
  fcp?: number;
}

export const PerformanceMonitor = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});

  useEffect(() => {
    if (!import.meta.env.DEV) return;

    // Web Vitals measurement
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        switch (entry.entryType) {
          case 'largest-contentful-paint':
            setMetrics(prev => ({ ...prev, lcp: entry.startTime }));
            break;
          case 'first-input':
            setMetrics(prev => ({ ...prev, fid: (entry as any).processingStart - entry.startTime }));
            break;
          case 'layout-shift':
            if (!(entry as any).hadRecentInput) {
              setMetrics(prev => ({ ...prev, cls: (prev.cls || 0) + (entry as any).value }));
            }
            break;
          case 'navigation':
            const navEntry = entry as PerformanceNavigationTiming;
            setMetrics(prev => ({
              ...prev,
              ttfb: navEntry.responseStart - navEntry.requestStart,
              fcp: navEntry.loadEventEnd - navEntry.fetchStart
            }));
            break;
        }
      }
    });

    observer.observe({ type: 'largest-contentful-paint', buffered: true });
    observer.observe({ type: 'first-input', buffered: true });
    observer.observe({ type: 'layout-shift', buffered: true });
    observer.observe({ type: 'navigation', buffered: true });

    return () => observer.disconnect();
  }, []);

  const getScoreColor = (metric: keyof PerformanceMetrics, value?: number) => {
    if (!value) return 'secondary';
    
    const thresholds = {
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
      ttfb: { good: 800, poor: 1800 },
      fcp: { good: 1800, poor: 3000 }
    };

    const threshold = thresholds[metric];
    if (value <= threshold.good) return 'default';
    if (value <= threshold.poor) return 'destructive';
    return 'destructive';
  };

  const formatMetric = (value?: number) => {
    if (!value) return '-';
    return value < 1000 ? `${Math.round(value)}ms` : `${(value / 1000).toFixed(1)}s`;
  };

  if (!import.meta.env.DEV) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(!isVisible)}
        className="mb-2 bg-background border shadow-lg"
      >
        {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        Performance
      </Button>

      {isVisible && (
        <Card className="w-80 shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Activity className="w-4 h-4" />
              Core Web Vitals
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 text-xs">
            {/* Performance Metrics */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">LCP</span>
                  <Badge variant={getScoreColor('lcp', metrics.lcp)} className="text-[10px]">
                    {formatMetric(metrics.lcp)}
                  </Badge>
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Largest Contentful Paint
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">FID</span>
                  <Badge variant={getScoreColor('fid', metrics.fid)} className="text-[10px]">
                    {formatMetric(metrics.fid)}
                  </Badge>
                </div>
                <div className="text-[10px] text-muted-foreground">
                  First Input Delay
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">CLS</span>
                  <Badge variant={getScoreColor('cls', metrics.cls)} className="text-[10px]">
                    {metrics.cls ? metrics.cls.toFixed(3) : '-'}
                  </Badge>
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Cumulative Layout Shift
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">TTFB</span>
                  <Badge variant={getScoreColor('ttfb', metrics.ttfb)} className="text-[10px]">
                    {formatMetric(metrics.ttfb)}
                  </Badge>
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Time to First Byte
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="bg-muted/50 p-2 rounded text-[10px] space-y-1">
              <div className="font-medium">Score Guide:</div>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Good
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  Needs Work
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  Poor
                </span>
              </div>
            </div>

            {/* Performance Tips */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-[10px]">
              <div className="flex items-center gap-1 font-medium mb-1">
                <Zap className="w-3 h-3" />
                Performance Tips
              </div>
              <ul className="space-y-1 text-blue-700 dark:text-blue-300">
                <li>• Images are lazy-loaded</li>
                <li>• Code is split by routes</li>
                <li>• Skeleton loaders prevent CLS</li>
                <li>• GA4 loads with consent</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};