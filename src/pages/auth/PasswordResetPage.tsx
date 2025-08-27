import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { KeyRound, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function PasswordResetPage() {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasValidSession, setHasValidSession] = useState(false);

  // Check if we have a valid session from the hash fragment tokens
  useEffect(() => {
    const checkSession = async () => {
      const hash = window.location.hash;
      
      // Check if there are auth tokens in the hash
      if (hash && (hash.includes('access_token=') || hash.includes('refresh_token='))) {
        console.log('🔗 Processing password reset tokens from hash fragment');
        
        try {
          // Wait a bit for Supabase to process the hash fragment automatically
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Let Supabase handle the tokens from the hash fragment
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('❌ Session error:', error);
            setError('Erro ao validar link de recuperação: ' + error.message);
            return;
          }
          
          if (!session) {
            console.log('⚠️ No session found, attempting to refresh...');
            
            // Try to refresh session using the tokens in the hash
            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
            
            if (refreshError || !refreshData.session) {
              console.error('❌ Failed to establish session:', refreshError);
              setError('Link de recuperação inválido ou expirado');
              setTimeout(() => navigate('/auth'), 3000);
              return;
            }
            
            console.log('✅ Session refreshed successfully');
            setHasValidSession(true);
          } else {
            console.log('✅ Valid password reset session found');
            setHasValidSession(true);
          }
          
          // Clean the hash from URL for better UX
          window.history.replaceState(null, '', window.location.pathname);
          
        } catch (err) {
          console.error('💥 Error processing reset tokens:', err);
          setError('Erro inesperado ao processar link de recuperação');
          setTimeout(() => navigate('/auth'), 3000);
        }
      } else {
        console.error('❌ No reset tokens found in URL');
        setError('Link de redefinição inválido ou não encontrado');
        setTimeout(() => navigate('/auth'), 3000);
      }
    };
    
    checkSession();
  }, [navigate]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔄 Updating password...');
      const { error } = await updatePassword(password);
      
      if (error) {
        console.error('❌ Password update failed:', error);
        setError(error.message || 'Erro ao redefinir senha');
      } else {
        console.log('✅ Password updated successfully');
        toast.success('Senha redefinida com sucesso!');
        navigate('/auth');
      }
    } catch (err) {
      console.error('💥 Unexpected password reset error:', err);
      setError('Erro inesperado ao redefinir senha');
    } finally {
      setIsLoading(false);
    }
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
        </div>

        <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4 text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <KeyRound className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-xl">Nova senha</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handlePasswordReset} className="space-y-4">
              {!hasValidSession && (
                <Alert>
                  <AlertDescription>
                    {error ? error : 'Verificando link de redefinição de senha...'}
                  </AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="password">Nova senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                    minLength={6}
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  minLength={6}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || !password || !confirmPassword || !hasValidSession}
              >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Redefinir senha
              </Button>
            </form>

            <div className="text-center pt-4 border-t">
              <Link 
                to="/auth" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Voltar ao login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}