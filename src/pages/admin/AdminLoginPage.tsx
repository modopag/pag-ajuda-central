import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLoginPage() {
  const { signIn, resetPassword, user, profile, loading } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isResetMode, setIsResetMode] = useState(false);

  // Redirect logic for authenticated users
  useEffect(() => {
    if (user && profile && !loading) {
      if (profile.role === 'admin' && profile.status === 'approved') {
        navigate('/admin');
      } else if (profile.status !== 'approved') {
        navigate('/admin/pending');
      }
    }
  }, [user, profile, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { error, data } = await signIn(email, password);
      
      if (error) {
        console.error('❌ Admin login failed:', error);
        
        if (error.name === 'ACCOUNT_PENDING_APPROVAL') {
          navigate('/admin/pending');
          return;
        }
        
        setError(error.message || 'Erro ao fazer login');
        toast.error('Erro no login', {
          description: error.message,
        });
      } else {
        console.log('✅ Admin login successful');
        toast.success('Login realizado com sucesso!');
        navigate('/admin');
      }
    } catch (err) {
      console.error('💥 Unexpected admin login error:', err);
      setError('Erro inesperado ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { error } = await resetPassword(resetEmail);
      
      if (error) {
        console.error('❌ Password reset failed:', error);
        setError(error.message || 'Erro ao enviar email de redefinição');
      } else {
        console.log('✅ Password reset email sent');
        toast.success('Email de redefinição enviado!', {
          description: 'Verifique sua caixa de entrada e spam.',
        });
        setIsResetMode(false);
        setResetEmail('');
      }
    } catch (err) {
      console.error('💥 Unexpected password reset error:', err);
      setError('Erro inesperado ao redefinir senha');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Admin Logo */}
        <div className="text-center">
          <Link to="/" className="inline-block">
            <img 
              src="/modopag-logo-black.webp"
              alt="ModoPag" 
              className="h-12 mx-auto mb-4"
            />
          </Link>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Painel Administrativo</h1>
          </div>
          <p className="text-muted-foreground">Acesso restrito para administradores</p>
        </div>

        <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl text-center">
              {isResetMode ? 'Redefinir Senha' : 'Login de Administrador'}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isResetMode ? (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resetEmail">Email</Label>
                  <Input
                    id="resetEmail"
                    type="email"
                    placeholder="admin@exemplo.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Enviar Email de Redefinição
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => setIsResetMode(false)}
                    disabled={isLoading}
                  >
                    Voltar ao Login
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 text-sm"
                    onClick={() => setIsResetMode(true)}
                    disabled={isLoading}
                  >
                    Esqueceu a senha?
                  </Button>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Entrar no Painel
                </Button>
              </form>
            )}

            <div className="pt-4 border-t border-border/50">
              <p className="text-xs text-muted-foreground text-center">
                Não tem uma conta? Entre em contato com o administrador para solicitar acesso.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link 
            to="/" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Voltar ao site
          </Link>
        </div>

        <footer className="text-center text-xs text-muted-foreground">
          <p>&copy; 2024 ModoPag. Todos os direitos reservados.</p>
        </footer>
      </div>
    </div>
  );
}