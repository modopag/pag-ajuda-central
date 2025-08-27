import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Mail, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function EmailConfirmationPage() {
  const { resendConfirmation } = useAuth();
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleResendConfirmation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsResending(true);
    try {
      const { error } = await resendConfirmation(email);
      
      if (error) {
        console.error('❌ Resend confirmation failed:', error);
        toast.error(error.message || 'Erro ao reenviar email de confirmação');
      } else {
        setResendSuccess(true);
        toast.success('Email de confirmação reenviado com sucesso!');
      }
    } catch (err) {
      console.error('💥 Unexpected resend error:', err);
      toast.error('Erro inesperado ao reenviar email');
    } finally {
      setIsResending(false);
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
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-xl">Confirme seu email</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Enviamos um email de confirmação para seu endereço. 
                Clique no link do email para ativar sua conta.
              </AlertDescription>
            </Alert>

            <div className="text-sm text-muted-foreground space-y-2">
              <p>• Verifique sua caixa de entrada</p>
              <p>• Não esqueça de verificar a pasta de spam</p>
              <p>• O link de confirmação expira em 24 horas</p>
            </div>

            {/* Resend form */}
            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground mb-3">
                Não recebeu o email?
              </p>
              
              <form onSubmit={handleResendConfirmation} className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isResending}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isResending || !email}
                  variant={resendSuccess ? "secondary" : "default"}
                >
                  {isResending && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                  {resendSuccess ? 'Email reenviado!' : 'Reenviar email'}
                </Button>
              </form>
            </div>

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