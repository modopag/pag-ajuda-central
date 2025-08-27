import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Mail, RefreshCw, Home, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function AuthErrorPage() {
  const [searchParams] = useSearchParams();
  const { resendConfirmation, resetPassword } = useAuth();
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);
  
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const type = searchParams.get('type'); // 'confirmation' | 'reset' | 'token_expired'

  const getErrorInfo = () => {
    if (error === 'access_denied') {
      return {
        title: 'Token Expirado ou Inválido',
        description: 'O link que você clicou expirou ou é inválido. Links de confirmação e redefinição de senha têm validade limitada por segurança.',
        icon: AlertTriangle,
        color: 'text-amber-500'
      };
    }
    
    if (errorDescription?.includes('expired') || type === 'token_expired') {
      return {
        title: 'Link Expirado',
        description: 'Este link de confirmação expirou. Por favor, solicite um novo link.',
        icon: AlertTriangle,
        color: 'text-amber-500'
      };
    }

    if (errorDescription?.includes('invalid') || error === 'invalid_request') {
      return {
        title: 'Link Inválido',
        description: 'Este link não é válido ou já foi usado. Solicite um novo link se necessário.',
        icon: AlertTriangle,
        color: 'text-red-500'
      };
    }

    // Default error
    return {
      title: 'Erro de Autenticação',
      description: 'Ocorreu um erro ao processar sua solicitação. Tente novamente ou solicite um novo link.',
      icon: AlertTriangle,
      color: 'text-red-500'
    };
  };

  const errorInfo = getErrorInfo();

  const handleResendConfirmation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setIsLoading(true);
    try {
      const { error } = await resendConfirmation(email);
      
      if (error) {
        toast.error('Erro ao reenviar confirmação', {
          description: error.message,
        });
      } else {
        toast.success('Email de confirmação reenviado!', {
          description: 'Verifique sua caixa de entrada e spam.',
        });
        setShowEmailInput(false);
        setEmail('');
      }
    } catch (err) {
      toast.error('Erro inesperado ao reenviar confirmação');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setIsLoading(true);
    try {
      const { error } = await resetPassword(email);
      
      if (error) {
        toast.error('Erro ao enviar redefinição de senha', {
          description: error.message,
        });
      } else {
        toast.success('Email de redefinição enviado!', {
          description: 'Verifique sua caixa de entrada e spam.',
        });
        setShowEmailInput(false);
        setEmail('');
      }
    } catch (err) {
      toast.error('Erro inesperado ao enviar redefinição');
    } finally {
      setIsLoading(false);
    }
  };

  const IconComponent = errorInfo.icon;

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
            <IconComponent className={`w-6 h-6 ${errorInfo.color}`} />
            <h1 className="text-2xl font-bold">{errorInfo.title}</h1>
          </div>
        </div>

        <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">Ops! Algo deu errado</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{errorInfo.description}</AlertDescription>
            </Alert>

            {/* Debug info for development */}
            {(error || errorDescription) && (
              <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded border">
                <strong>Detalhes técnicos:</strong>
                {error && <div>Erro: {error}</div>}
                {errorDescription && <div>Descrição: {errorDescription}</div>}
                {type && <div>Tipo: {type}</div>}
              </div>
            )}

            {showEmailInput ? (
              <form onSubmit={type === 'reset' ? handleResetPassword : handleResendConfirmation} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Seu email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    className="flex-1" 
                    disabled={isLoading || !email.trim()}
                  >
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {type === 'reset' ? 'Reenviar Redefinição' : 'Reenviar Confirmação'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowEmailInput(false)}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    O que você gostaria de fazer?
                  </p>
                </div>

                <div className="grid gap-2">
                  <Button
                    onClick={() => setShowEmailInput(true)}
                    variant="outline"
                    className="w-full"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Solicitar Novo Email
                  </Button>
                  
                  <Button
                    asChild
                    variant="outline"
                    className="w-full"
                  >
                    <Link to="/admin/login">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Tentar Login Novamente
                    </Link>
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
              </div>
            )}

            <div className="text-center pt-4 border-t border-border/50">
              <p className="text-xs text-muted-foreground">
                Precisa de ajuda? Entre em contato:
                <br />
                <a href="mailto:contato@modopag.com.br" className="text-primary hover:underline">
                  contato@modopag.com.br
                </a>
              </p>
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