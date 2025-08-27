import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Loader2, 
  AlertTriangle,
  CheckCircle 
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function ReauthPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  const token = searchParams.get('token');
  const accessToken = searchParams.get('access_token');
  const refreshToken = searchParams.get('refresh_token');
  const redirectTo = searchParams.get('redirect_to') || '/admin';

  useEffect(() => {
    // If we have tokens from URL, validate them
    if (accessToken && refreshToken) {
      validateTokens();
    } else if (!token) {
      // If no token or access tokens, redirect to auth
      navigate('/auth');
    }
  }, [accessToken, refreshToken, token, navigate]);

  const validateTokens = async () => {
    try {
      setIsLoading(true);
      
      // Set the session with the provided tokens
      const { error } = await supabase.auth.setSession({
        access_token: accessToken!,
        refresh_token: refreshToken!
      });

      if (error) {
        throw error;
      }

      setSuccess(true);
      toast.success('Reautenticação realizada com sucesso!');
      
      // Redirect after a delay
      setTimeout(() => {
        navigate(redirectTo);
      }, 2000);

    } catch (error: any) {
      console.error('Token validation error:', error);
      setError('Tokens inválidos ou expirados. Tente fazer login novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReauth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    try {
      setIsLoading(true);
      setError('');

      if (!user?.email) {
        throw new Error('Usuário não encontrado');
      }

      // Reauthenticate with password
      const { error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: password
      });

      if (error) {
        throw error;
      }

      setSuccess(true);
      toast.success('Reautenticação realizada com sucesso!');
      
      // Redirect after a delay
      setTimeout(() => {
        navigate(redirectTo);
      }, 1500);

    } catch (error: any) {
      console.error('Reauthentication error:', error);
      setError(error.message === 'Invalid login credentials' 
        ? 'Senha incorreta. Tente novamente.' 
        : error.message || 'Erro na reautenticação'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
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
            <CardHeader className="space-y-1 pb-4 text-center">
              <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <CardTitle className="text-xl">Reautenticação realizada!</CardTitle>
            </CardHeader>
            
            <CardContent className="text-center">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Você foi reautenticado com sucesso. Redirecionando...
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // If validating tokens from URL
  if (accessToken && refreshToken && isLoading) {
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
            <CardHeader className="space-y-1 pb-4 text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
              <CardTitle className="text-xl">Validando reautenticação...</CardTitle>
            </CardHeader>
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
            <div className="mx-auto w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-amber-500" />
            </div>
            <CardTitle className="text-xl">Reautenticação necessária</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <Alert className="border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                Por motivos de segurança, você precisa confirmar sua identidade antes de continuar.
              </AlertDescription>
            </Alert>

            {user && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Conectado como: <span className="font-medium">{user.email}</span>
                </p>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handlePasswordReauth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Confirme sua senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Digite sua senha atual"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || !password.trim()}
              >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Confirmar identidade
              </Button>
            </form>

            <div className="text-center space-y-2">
              <Link 
                to="/auth/reset-password" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Esqueci minha senha
              </Link>
              
              <div className="text-xs text-muted-foreground">
                <Link 
                  to="/auth" 
                  className="hover:text-foreground transition-colors"
                >
                  ← Voltar ao login
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}