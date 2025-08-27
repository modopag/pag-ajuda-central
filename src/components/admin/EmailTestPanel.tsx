import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Mail, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function EmailTestPanel() {
  const { resendConfirmation, resetPassword, isAdmin } = useAuth();
  const [testEmail, setTestEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastTest, setLastTest] = useState<{
    type: string;
    email: string;
    success: boolean;
    timestamp: Date;
  } | null>(null);

  // Only show to admins
  if (!isAdmin()) {
    return null;
  }

  const handleTestConfirmationEmail = async () => {
    if (!testEmail) return;
    
    setIsLoading(true);
    console.log('🧪 Admin testing confirmation email to:', testEmail);

    try {
      const { error } = await resendConfirmation(testEmail);
      
      const testResult = {
        type: 'Confirmation Email',
        email: testEmail,
        success: !error,
        timestamp: new Date()
      };
      
      setLastTest(testResult);
      
      if (error) {
        console.error('❌ Test confirmation email failed:', error);
        toast.error(`Erro no teste: ${error.message}`, {
          description: 'Verifique os logs para mais detalhes'
        });
      } else {
        console.log('✅ Test confirmation email sent successfully');
        toast.success('Email de confirmação enviado!', {
          description: `Enviado para: ${testEmail}`
        });
      }
    } catch (err) {
      console.error('💥 Unexpected test email error:', err);
      toast.error('Erro inesperado no teste de email');
      
      setLastTest({
        type: 'Confirmation Email',
        email: testEmail,
        success: false,
        timestamp: new Date()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestPasswordResetEmail = async () => {
    if (!testEmail) return;
    
    setIsLoading(true);
    console.log('🧪 Admin testing password reset email to:', testEmail);

    try {
      const { error } = await resetPassword(testEmail);
      
      const testResult = {
        type: 'Password Reset Email',
        email: testEmail,
        success: !error,
        timestamp: new Date()
      };
      
      setLastTest(testResult);
      
      if (error) {
        console.error('❌ Test password reset email failed:', error);
        toast.error(`Erro no teste: ${error.message}`, {
          description: 'Verifique os logs para mais detalhes'
        });
      } else {
        console.log('✅ Test password reset email sent successfully');
        toast.success('Email de redefinição enviado!', {
          description: `Enviado para: ${testEmail}`
        });
      }
    } catch (err) {
      console.error('💥 Unexpected test password reset error:', err);
      toast.error('Erro inesperado no teste de email');
      
      setLastTest({
        type: 'Password Reset Email',
        email: testEmail,
        success: false,
        timestamp: new Date()
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Teste de Emails SMTP
          <Badge variant="secondary">Admin</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Esta funcionalidade permite testar o envio de emails do Supabase. 
            Use emails reais para verificar a entrega.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="testEmail">Email para teste</Label>
          <Input
            id="testEmail"
            type="email"
            placeholder="teste@exemplo.com"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button
            onClick={handleTestConfirmationEmail}
            disabled={!testEmail || isLoading}
            className="w-full"
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            <Send className="w-4 h-4 mr-2" />
            Testar Email de Confirmação
          </Button>

          <Button
            onClick={handleTestPasswordResetEmail}
            disabled={!testEmail || isLoading}
            variant="outline"
            className="w-full"
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            <Send className="w-4 h-4 mr-2" />
            Testar Email de Reset
          </Button>
        </div>

        {lastTest && (
          <Alert className={lastTest.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <div className="flex items-center gap-2">
              {lastTest.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={lastTest.success ? "text-green-800" : "text-red-800"}>
                <div className="space-y-1">
                  <div className="font-medium">
                    {lastTest.type} - {lastTest.success ? 'Sucesso' : 'Falha'}
                  </div>
                  <div className="text-sm">
                    Email: {lastTest.email}
                  </div>
                  <div className="text-sm">
                    Hora: {lastTest.timestamp.toLocaleString('pt-BR')}
                  </div>
                </div>
              </AlertDescription>
            </div>
          </Alert>
        )}

        <div className="text-sm text-muted-foreground space-y-1">
          <p>💡 <strong>Dicas:</strong></p>
          <p>• Verifique o console para logs detalhados</p>
          <p>• Teste com emails reais para verificar entrega</p>
          <p>• Verifique a pasta de spam do email de destino</p>
          <p>• Configure as URLs de redirecionamento no Supabase</p>
        </div>
      </CardContent>
    </Card>
  );
}