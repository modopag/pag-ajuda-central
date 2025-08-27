import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function EmailConfirmSuccessPage() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Auto redirect authenticated users after a delay
    if (user && !loading) {
      const timer = setTimeout(() => {
        // Check if user has admin access
        if (profile?.role === 'admin' && profile?.status === 'approved') {
          navigate('/admin');
        } else {
          navigate('/auth'); // Redirect to login for further authentication
        }
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [user, profile, loading, navigate]);

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
        </div>

        <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4 text-center">
            <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <CardTitle className="text-xl">Email confirmado!</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Seu email foi confirmado com sucesso. Sua conta está ativa!
              </AlertDescription>
            </Alert>

            {user && (
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Bem-vindo, <span className="font-medium">{user.email}</span>!
                </p>
                
                <div className="space-y-2">
                  <Button 
                    asChild 
                    className="w-full"
                  >
                    <Link to="/auth">
                      Fazer login
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                  
                  <Button 
                    asChild 
                    variant="outline"
                    className="w-full"
                  >
                    <Link to="/">
                      Voltar ao site
                    </Link>
                  </Button>
                </div>
              </div>
            )}

            {!user && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Redirecionando para o login...
                </p>
                <Button 
                  asChild 
                  className="w-full"
                >
                  <Link to="/auth">
                    Ir para login
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}