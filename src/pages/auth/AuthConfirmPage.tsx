import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export default function AuthConfirmPage() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [processing, setProcessing] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const processAuth = async () => {
      try {
        // First, check if we have token_hash or access_token in URL params
        const tokenHash = searchParams.get('token_hash');
        const accessToken = searchParams.get('access_token');
        const type = searchParams.get('type');
        
        if (tokenHash || accessToken) {
          console.log('🔗 Processing auth from URL params');
          
          // Let Supabase handle the token verification
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('❌ Error verifying session:', error);
            setError('Erro ao verificar confirmação de email');
          } else if (data.session) {
            console.log('✅ Email confirmed successfully');
            setSuccess(true);
          } else {
            console.log('⚠️ No session found');
            setError('Token de confirmação inválido ou expirado');
          }
        } else {
          // Check current auth state
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            console.log('✅ User already authenticated');
            setSuccess(true);
          } else {
            console.log('❌ No authentication found');
            setError('Não foi possível confirmar o email');
          }
        }
      } catch (err) {
        console.error('💥 Unexpected error:', err);
        setError('Erro inesperado ao processar confirmação');
      } finally {
        setProcessing(false);
      }
    };

    processAuth();
  }, [searchParams]);

  useEffect(() => {
    // Auto redirect authenticated users after a delay
    if (success && user && !loading) {
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
  }, [success, user, profile, loading, navigate]);

  if (processing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
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
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mb-4" />
              <p className="text-sm text-muted-foreground">
                Processando confirmação de email...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              success ? 'bg-green-500/10' : 'bg-destructive/10'
            }`}>
              {success ? (
                <CheckCircle className="w-8 h-8 text-green-500" />
              ) : (
                <AlertCircle className="w-8 h-8 text-destructive" />
              )}
            </div>
            <CardTitle className="text-xl">
              {success ? 'Email confirmado!' : 'Erro na confirmação'}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {success ? (
              <>
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
              </>
            ) : (
              <>
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {error || 'Não foi possível confirmar seu email.'}
                  </AlertDescription>
                </Alert>

                <div className="text-center space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Tente fazer login novamente ou solicite um novo email de confirmação.
                  </p>
                  
                  <div className="space-y-2">
                    <Button 
                      asChild 
                      className="w-full"
                    >
                      <Link to="/auth">
                        Tentar fazer login
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                    
                    <Button 
                      asChild 
                      variant="outline"
                      className="w-full"
                    >
                      <Link to="/auth/email-confirmation">
                        Reenviar confirmação
                      </Link>
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}