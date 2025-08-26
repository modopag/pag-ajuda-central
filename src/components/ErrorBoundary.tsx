import React, { Component, ReactNode } from 'react';
import { Button } from './ui/button';
import { AlertTriangle, RefreshCw, MessageCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleContactSupport = () => {
    window.open(
      'https://wa.me/5571981470573?text=Venho%20do%20site%20e%20encontrei%20um%20erro%20t%C3%A9cnico.%20%5BErrorBoundary%5D',
      '_blank'
    );
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md mx-auto text-center">
            {/* Logo */}
            <div className="mb-8">
              <img 
                src="/modopag-logo-yellow.webp" 
                alt="modoPAG" 
                className="h-12 mx-auto"
                width="150"
                height="48"
              />
            </div>

            {/* Error Icon */}
            <div className="mb-6">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
            </div>

            {/* Error Message */}
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Oops! Algo deu errado
            </h1>
            <p className="text-muted-foreground mb-8">
              Encontramos um erro técnico inesperado. Nossa equipe foi notificada e está trabalhando para resolver.
            </p>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button 
                onClick={this.handleReload}
                className="w-full"
                size="lg"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Recarregar página
              </Button>
              
              <Button
                variant="outline"
                onClick={this.handleContactSupport}
                className="w-full"
                size="lg"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Falar com suporte
              </Button>

              <Button
                variant="ghost"
                onClick={() => window.location.href = '/'}
                className="w-full text-muted-foreground"
              >
                Voltar ao início
              </Button>
            </div>

            {/* Technical Details (Development only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-8 text-left bg-muted p-4 rounded-lg">
                <summary className="cursor-pointer text-sm font-medium">
                  Detalhes técnicos (dev only)
                </summary>
                <pre className="mt-2 text-xs overflow-x-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}