import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, Mail, Home, Shield, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function AdminPendingPage() {
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const getStatusMessage = () => {
    if (profile?.status === 'rejected') {
      return {
        title: 'Acesso Negado',
        message: 'Sua solicitação de acesso ao painel administrativo foi negada. Entre em contato com o administrador para mais informações.',
        icon: Shield,
        variant: 'destructive' as const,
        color: 'text-red-500'
      };
    }
    
    return {
      title: 'Aguardando Aprovação Administrativa',
      message: 'Sua conta foi criada, mas você precisa de aprovação do administrador para acessar o painel. Você receberá um email quando sua conta for aprovada.',
      icon: Clock,
      variant: 'default' as const,
      color: 'text-amber-500'
    };
  };

  const statusInfo = getStatusMessage();
  const IconComponent = statusInfo.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <Link to="/" className="inline-block">
            <img 
              src="/modopag-logo-black.webp"
              alt="ModoPag" 
              className="h-12 mx-auto mb-4"
            />
          </Link>
          <div className="flex items-center justify-center gap-2 mb-2">
            <IconComponent className={`w-6 h-6 ${statusInfo.color}`} />
            <h1 className="text-2xl font-bold">Painel Administrativo</h1>
          </div>
          <p className="text-muted-foreground">{statusInfo.title}</p>
        </div>

        <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl flex items-center justify-center gap-2">
              <User className="w-5 h-5" />
              Acesso Restrito
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Alert variant={statusInfo.variant}>
              <Mail className="h-4 w-4" />
              <AlertDescription>{statusInfo.message}</AlertDescription>
            </Alert>

            {user && (
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-medium text-sm mb-2">Informações da conta:</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><strong>Email:</strong> {user.email}</p>
                  {profile?.name && <p><strong>Nome:</strong> {profile.name}</p>}
                  <p><strong>Função:</strong> {profile?.role || 'Não definida'}</p>
                  <p><strong>Status:</strong> {
                    profile?.status === 'pending' ? 'Aguardando aprovação' :
                    profile?.status === 'approved' ? 'Aprovado' :
                    profile?.status === 'rejected' ? 'Acesso negado' :
                    profile?.status || 'Desconhecido'
                  }</p>
                </div>
              </div>
            )}

            {profile?.status === 'pending' && (
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  <strong>Tempo estimado:</strong> até 24 horas
                </p>
                <p className="text-sm text-muted-foreground">
                  Você receberá um email de confirmação quando sua conta for aprovada.
                </p>
              </div>
            )}

            <div className="text-center pt-2">
              <p className="text-sm text-muted-foreground">
                Precisa de ajuda ou tem urgência?
                <br />
                Entre em contato: 
                <a href="mailto:contato@modopag.com.br" className="text-primary hover:underline ml-1">
                  contato@modopag.com.br
                </a>
              </p>
            </div>

            <div className="space-y-3 pt-4">
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="w-full"
              >
                Sair da Conta
              </Button>
              
              <Button
                asChild
                className="w-full"
              >
                <Link to="/">
                  <Home className="w-4 h-4 mr-2" />
                  Voltar ao Site Principal
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <footer className="text-center text-xs text-muted-foreground">
          <p>&copy; 2024 ModoPag. Todos os direitos reservados.</p>
        </footer>
      </div>
    </div>
  );
}