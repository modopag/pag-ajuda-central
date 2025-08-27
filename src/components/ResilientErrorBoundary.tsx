import React, { Component, ReactNode } from 'react';
import { Button } from './ui/button';
import { AlertTriangle, RefreshCw, Home, MessageSquare } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  showRetry?: boolean;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  retryCount: number;
}

/**
 * Enhanced error boundary with retry functionality and better UX
 * Prevents complete homepage crashes by providing fallback UI
 */
export class ResilientErrorBoundary extends Component<Props, State> {
  private retryTimeout?: NodeJS.Timeout;

  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      retryCount: 0 
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    console.error('ErrorBoundary caught an error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary details:', error, errorInfo);
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Track error in analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: error.message,
        fatal: false
      });
    }
  }

  handleRetry = () => {
    // Prevent excessive retries
    if (this.state.retryCount >= 3) {
      return;
    }

    this.setState(prevState => ({
      hasError: false,
      error: undefined,
      retryCount: prevState.retryCount + 1
    }));

    // Auto-retry with exponential backoff
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
    
    this.retryTimeout = setTimeout(() => {
      if (this.state.hasError) {
        this.handleRetry();
      }
    }, Math.pow(2, this.state.retryCount) * 1000);
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleContactSupport = () => {
    window.open('https://wa.me/5571981470573?text=Venho%20do%20site%20e%20preciso%20de%20ajuda%20com%20um%20erro%20t%C3%A9cnico.', '_blank');
  };

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Minimal error UI that doesn't break the page
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="max-w-md mx-auto text-center space-y-6">
            <div className="flex justify-center">
              <AlertTriangle className="w-16 h-16 text-yellow-500" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">
                Ops! Algo deu errado
              </h2>
              <p className="text-muted-foreground">
                Ocorreu um erro inesperado. Você pode tentar recarregar a seção ou navegar para outra página.
              </p>
              
              {import.meta.env.DEV && this.state.error && (
                <details className="mt-4 text-left bg-muted p-4 rounded-lg text-sm">
                  <summary className="cursor-pointer font-medium mb-2">
                    Detalhes técnicos (desenvolvimento)
                  </summary>
                  <pre className="whitespace-pre-wrap text-xs text-red-600">
                    {this.state.error.name}: {this.state.error.message}
                    {this.state.error.stack && `\n\n${this.state.error.stack}`}
                  </pre>
                </details>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {this.props.showRetry !== false && this.state.retryCount < 3 && (
                <Button 
                  onClick={this.handleRetry}
                  variant="default"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Tentar Novamente
                </Button>
              )}
              
              <Button 
                onClick={this.handleGoHome}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Ir para Início
              </Button>
              
              <Button 
                onClick={this.handleContactSupport}
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Suporte
              </Button>
            </div>

            {this.state.retryCount >= 3 && (
              <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                Muitas tentativas. Tente recarregar a página ou entre em contato com o suporte.
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}