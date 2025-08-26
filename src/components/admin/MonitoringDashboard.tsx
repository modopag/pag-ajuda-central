import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { performanceMonitor, PerformanceMonitor } from '@/utils/performance';
import { Activity, Clock, Zap, TrendingUp, Download, RefreshCw } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  status: 'good' | 'needs-improvement' | 'poor';
  threshold: string;
  icon: React.ReactNode;
}

const MetricCard = ({ title, value, status, threshold, icon }: MetricCardProps) => {
  const statusColors = {
    good: 'bg-green-100 text-green-800 border-green-200',
    'needs-improvement': 'bg-yellow-100 text-yellow-800 border-yellow-200', 
    poor: 'bg-red-100 text-red-800 border-red-200'
  };

  const statusLabels = {
    good: 'Bom',
    'needs-improvement': 'Precisa Melhorar',
    poor: 'Ruim'
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <Badge className={`mt-2 ${statusColors[status]}`}>
          {statusLabels[status]}
        </Badge>
        <p className="text-xs text-muted-foreground mt-2">
          {threshold}
        </p>
      </CardContent>
    </Card>
  );
};

export const MonitoringDashboard = () => {
  const [metrics, setMetrics] = useState<any>({});
  const [resources, setResources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const refreshMetrics = () => {
    setIsLoading(true);
    
    // Get current metrics
    const currentMetrics = performanceMonitor.getMetrics();
    const resourceTiming = performanceMonitor.getResourceTiming();
    
    setMetrics(currentMetrics);
    setResources(resourceTiming);
    setLastUpdated(new Date());
    setIsLoading(false);
  };

  useEffect(() => {
    refreshMetrics();
  }, []);

  const getMetricStatus = (metric: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
    switch (metric) {
      case 'lcp':
        if (value <= 2500) return 'good';
        if (value <= 4000) return 'needs-improvement';
        return 'poor';
      case 'fid':
        if (value <= 100) return 'good';
        if (value <= 300) return 'needs-improvement';
        return 'poor';
      case 'cls':
        if (value <= 0.1) return 'good';
        if (value <= 0.25) return 'needs-improvement';
        return 'poor';
      case 'fcp':
        if (value <= 1800) return 'good';
        if (value <= 3000) return 'needs-improvement';
        return 'poor';
      case 'ttfb':
        if (value <= 800) return 'good';
        if (value <= 1800) return 'needs-improvement';
        return 'poor';
      default:
        return 'good';
    }
  };

  const downloadReport = () => {
    const report = performanceMonitor.generateReport();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resourcesByType = resources.reduce((acc, resource) => {
    if (!acc[resource.type]) {
      acc[resource.type] = { count: 0, totalSize: 0, totalDuration: 0 };
    }
    acc[resource.type].count++;
    acc[resource.type].totalSize += resource.size;
    acc[resource.type].totalDuration += resource.duration;
    return acc;
  }, {} as Record<string, { count: number; totalSize: number; totalDuration: number }>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Performance Monitoring</h2>
          <p className="text-muted-foreground">
            Monitoramento de Core Web Vitals e performance da aplicação
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={refreshMetrics}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button
            onClick={downloadReport}
            variant="outline"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Baixar Relatório
          </Button>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Última atualização: {lastUpdated.toLocaleString('pt-BR')}
      </div>

      {/* Core Web Vitals */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {metrics.lcp && (
          <MetricCard
            title="Largest Contentful Paint"
            value={`${metrics.lcp.toFixed(0)}ms`}
            status={getMetricStatus('lcp', metrics.lcp)}
            threshold="Bom: ≤2.5s, Precisa Melhorar: ≤4.0s"
            icon={<Clock className="h-4 w-4 text-muted-foreground" />}
          />
        )}
        
        {metrics.fid && (
          <MetricCard
            title="First Input Delay"
            value={`${metrics.fid.toFixed(0)}ms`}
            status={getMetricStatus('fid', metrics.fid)}
            threshold="Bom: ≤100ms, Precisa Melhorar: ≤300ms"
            icon={<Zap className="h-4 w-4 text-muted-foreground" />}
          />
        )}
        
        {metrics.cls && (
          <MetricCard
            title="Cumulative Layout Shift"
            value={metrics.cls.toFixed(3)}
            status={getMetricStatus('cls', metrics.cls)}
            threshold="Bom: ≤0.1, Precisa Melhorar: ≤0.25"
            icon={<Activity className="h-4 w-4 text-muted-foreground" />}
          />
        )}
        
        {metrics.fcp && (
          <MetricCard
            title="First Contentful Paint"
            value={`${metrics.fcp.toFixed(0)}ms`}
            status={getMetricStatus('fcp', metrics.fcp)}
            threshold="Bom: ≤1.8s, Precisa Melhorar: ≤3.0s"
            icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          />
        )}
        
        {metrics.ttfb && (
          <MetricCard
            title="Time to First Byte"
            value={`${metrics.ttfb.toFixed(0)}ms`}
            status={getMetricStatus('ttfb', metrics.ttfb)}
            threshold="Bom: ≤800ms, Precisa Melhorar: ≤1.8s"
            icon={<Clock className="h-4 w-4 text-muted-foreground" />}
          />
        )}
      </div>

      {/* Resource Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Análise de Recursos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Object.entries(resourcesByType).map(([type, stats]) => {
              const typedStats = stats as { count: number; totalSize: number; totalDuration: number };
              return (
                <div key={type} className="space-y-2">
                  <h4 className="font-medium capitalize">{type}</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div>Arquivos: {typedStats.count}</div>
                    <div>Tamanho: {(typedStats.totalSize / 1024).toFixed(2)}KB</div>
                    <div>Tempo: {typedStats.totalDuration.toFixed(2)}ms</div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Performance Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Dicas de Performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium text-green-600">✅ Implementado</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Service Worker para cache</li>
                <li>• Lazy loading de imagens</li>
                <li>• Otimização de bundles</li>
                <li>• Compressão de imagens</li>
                <li>• Preload de recursos críticos</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-blue-600">💡 Recomendações</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Otimize imagens para WebP</li>
                <li>• Use CDN para assets estáticos</li>
                <li>• Implemente prefetch para navegação</li>
                <li>• Minimize JavaScript não crítico</li>
                <li>• Configure compressão gzip/brotli</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};