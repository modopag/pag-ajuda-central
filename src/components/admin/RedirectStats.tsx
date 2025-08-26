import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, ExternalLink, Activity, AlertTriangle } from 'lucide-react';
import { getDataAdapter } from '@/lib/data-adapter';
import type { Redirect } from '@/types/admin';

interface RedirectStatsProps {
  refreshTrigger?: number;
}

export function RedirectStats({ refreshTrigger }: RedirectStatsProps) {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    permanent: 0,
    temporary: 0,
    recent: [] as Redirect[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [refreshTrigger]);

  const loadStats = async () => {
    try {
      const adapter = await getDataAdapter();
      const redirects = await adapter.getRedirects();
      
      const recent = redirects
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);

      setStats({
        total: redirects.length,
        active: redirects.filter(r => r.is_active).length,
        permanent: redirects.filter(r => r.type === '301').length,
        temporary: redirects.filter(r => r.type === '302').length,
        recent
      });
    } catch (error) {
      console.error('Error loading redirect stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-xs text-muted-foreground">Ativos</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ExternalLink className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-xs text-muted-foreground">301 (Permanente)</p>
                <p className="text-2xl font-bold">{stats.permanent}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <div>
                <p className="text-xs text-muted-foreground">302 (Temporário)</p>
                <p className="text-2xl font-bold text-orange-600">{stats.temporary}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Redirects */}
      {stats.recent.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Redirecionamentos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Origem</TableHead>
                  <TableHead className="w-[40%]">Destino</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Criado em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recent.map((redirect) => (
                  <TableRow key={redirect.id}>
                    <TableCell className="font-mono text-xs">
                      {redirect.from_path}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      <div className="flex items-center space-x-1">
                        <span>{redirect.to_path}</span>
                        {redirect.to_path.startsWith('http') && (
                          <ExternalLink className="w-3 h-3 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={redirect.type === '301' ? "default" : "secondary"} className="text-xs">
                        {redirect.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(redirect.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}