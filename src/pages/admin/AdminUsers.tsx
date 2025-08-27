import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  Mail, 
  Calendar,
  Shield,
  User
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  role: 'admin' | 'editor' | 'pending';
  status: string; // Allow any string to match Supabase response
  created_at: string;
  approved_at: string | null;
  approved_by: string | null;
  updated_at: string;
}

export default function AdminUsers() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, statusFilter]);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    setFilteredUsers(filtered);
  };

  const approveUser = async (userId: string) => {
    try {
      const { error } = await supabase.rpc('approve_user', { user_id: userId });
      
      if (error) throw error;
      
      toast.success('Usuário aprovado com sucesso!');
      await loadUsers();
    } catch (error: any) {
      console.error('Error approving user:', error);
      toast.error(error.message || 'Erro ao aprovar usuário');
    }
  };

  const rejectUser = async (userId: string) => {
    try {
      const { error } = await supabase.rpc('reject_user', { user_id: userId });
      
      if (error) throw error;
      
      toast.success('Usuário rejeitado');
      await loadUsers();
    } catch (error: any) {
      console.error('Error rejecting user:', error);
      toast.error(error.message || 'Erro ao rejeitar usuário');
    }
  };

  const getStatusBadge = (status: string, role: string) => {
    if (status === 'approved') {
      return <Badge variant="default" className="bg-green-100 text-green-800">Aprovado</Badge>;
    }
    if (status === 'pending') {
      return <Badge variant="secondary" className="bg-amber-100 text-amber-800">Pendente</Badge>;
    }
    if (status === 'rejected') {
      return <Badge variant="destructive">Rejeitado</Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  const getRoleBadge = (role: string) => {
    if (role === 'admin') {
      return <Badge variant="default" className="bg-purple-100 text-purple-800">Admin</Badge>;
    }
    if (role === 'editor') {
      return <Badge variant="outline">Editor</Badge>;
    }
    return <Badge variant="secondary">Pendente</Badge>;
  };

  if (!isAdmin()) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert className="max-w-md">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Apenas administradores podem acessar esta página.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
        <p className="text-muted-foreground">
          Gerencie usuários e aprove novos cadastros
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Buscar usuários</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Digite email ou nome..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="sm:w-48">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">Todos</option>
                <option value="pending">Pendentes</option>
                <option value="approved">Aprovados</option>
                <option value="rejected">Rejeitados</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="grid gap-4">
        {filteredUsers.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum usuário encontrado</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Tente ajustar os filtros de busca'
                    : 'Ainda não há usuários cadastrados'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredUsers.map((user) => (
            <Card key={user.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{user.name || 'Sem nome'}</h3>
                      {user.email === 'contato@modopag.com.br' && (
                        <Badge variant="default" className="bg-purple-500 text-white">
                          ROOT ADMIN
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      {user.email}
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {getStatusBadge(user.status, user.role)}
                      {getRoleBadge(user.role)}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Cadastrado em {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </div>
                    
                    {user.approved_at && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4" />
                        Aprovado em {new Date(user.approved_at).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {user.status === 'pending' && user.email !== 'contato@modopag.com.br' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => approveUser(user.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Aprovar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => rejectUser(user.id)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Rejeitar
                      </Button>
                    </div>
                  )}

                  {user.status === 'rejected' && user.email !== 'contato@modopag.com.br' && (
                    <Button
                      size="sm"
                      onClick={() => approveUser(user.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Aprovar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}