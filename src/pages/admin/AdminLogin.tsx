import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { AuthService } from "@/lib/auth";
import { LogIn, Lock, Mail, KeyRound } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if already authenticated
  if (AuthService.isAuthenticated()) {
    navigate("/admin");
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await AuthService.login(email, password);
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao painel administrativo.",
      });
      navigate("/admin");
    } catch (err) {
      setError("Credenciais inválidas. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await AuthService.resetPassword(resetEmail);
      toast({
        title: "E-mail enviado!",
        description: "Verifique sua caixa de entrada para redefinir a senha.",
      });
      setIsResetMode(false);
      setResetEmail("");
    } catch (err) {
      setError("E-mail não encontrado no sistema.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-primary rounded-xl flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">modoPAG Admin</h1>
          <p className="text-muted-foreground">Central de Ajuda</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isResetMode ? (
                <>
                  <KeyRound className="w-5 h-5" />
                  Recuperar Senha
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Fazer Login
                </>
              )}
            </CardTitle>
            <CardDescription>
              {isResetMode
                ? "Digite seu e-mail para receber as instruções de recuperação"
                : "Acesse o painel administrativo com suas credenciais"
              }
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert className="mb-4 border-destructive">
                <AlertDescription className="text-destructive">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {isResetMode ? (
              <form onSubmit={handleReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="reset-email"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="pl-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Enviando..." : "Enviar Instruções"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@modopag.com.br"
                      className="pl-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            )}
          </CardContent>

          <CardFooter className="flex flex-col">
            <Separator className="mb-4" />
            
            <div className="text-center space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsResetMode(!isResetMode);
                  setError("");
                  setEmail("");
                  setPassword("");
                  setResetEmail("");
                }}
              >
                {isResetMode ? "Voltar ao login" : "Esqueceu sua senha?"}
              </Button>

              {!isResetMode && (
                <div className="text-xs text-muted-foreground mt-4 p-3 bg-muted rounded-lg">
                  <p className="font-medium mb-1">Demo Credentials:</p>
                  <p>Email: admin@modopag.com.br</p>
                  <p>Senha: admin123</p>
                </div>
              )}
            </div>
          </CardFooter>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            © 2024 modoPAG - Central de Ajuda
          </p>
        </div>
      </div>
    </div>
  );
}