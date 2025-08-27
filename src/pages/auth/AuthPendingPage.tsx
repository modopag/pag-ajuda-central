import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, Mail, Home } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function AuthPendingPage() {
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

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
            <Clock className="w-6 h-6 text-amber-500" />
            <h1 className="text-2xl font-bold">Conta Aguardando Aprovação</h1>
          </div>
        </div>

        <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">Sua conta foi criada com sucesso!</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Aguardando aprovação do administrador</strong>
                <br />
                Sua conta está sendo analisada pela nossa equipe. Você receberá um email quando sua conta for aprovada e você poderá acessar o sistema.
              </AlertDescription>
            </Alert>

            {user && (
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-medium text-sm mb-2">Detalhes da conta:</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><strong>Email:</strong> {user.email}</p>
                  {profile?.name && <p><strong>Nome:</strong> {profile.name}</p>}
                  <p><strong>Status:</strong> {profile?.status === 'pending' ? 'Aguardando aprovação' : profile?.status}</p>
                </div>
              </div>
            )}

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Tempo estimado de aprovação: até 24 horas
              </p>
              <p className="text-sm text-muted-foreground">
                Em caso de urgência, entre em contato pelo email: 
                <br />
                <a href="mailto:contato@modopag.com.br" className="text-primary hover:underline">
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
                  Voltar ao Site
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