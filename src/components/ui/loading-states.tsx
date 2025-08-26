import { cn } from '@/lib/utils';
import { LoaderCircle, Search, WifiOff } from 'lucide-react';
import { Button } from './button';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  message?: string;
}

export const LoadingSpinner = ({ 
  size = 'md', 
  className,
  message 
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-2", className)}>
      <LoaderCircle className={cn("animate-spin text-primary", sizeClasses[size])} />
      {message && (
        <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
      )}
    </div>
  );
};

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState = ({
  icon = <Search className="w-12 h-12 text-muted-foreground" />,
  title,
  description,
  action,
  className
}: EmptyStateProps) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center space-y-4 p-8",
      className
    )}>
      <div className="animate-fade-in">
        {icon}
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-muted-foreground max-w-md">{description}</p>
        )}
      </div>
      {action && (
        <Button onClick={action.onClick} className="animate-fade-in">
          {action.label}
        </Button>
      )}
    </div>
  );
};

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState = ({
  title = "Algo deu errado",
  description = "Não foi possível carregar o conteúdo. Tente novamente.",
  onRetry,
  className
}: ErrorStateProps) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center space-y-4 p-8",
      className
    )}>
      <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
        <WifiOff className="w-8 h-8 text-destructive" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-muted-foreground max-w-md">{description}</p>
      </div>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          Tentar novamente
        </Button>
      )}
    </div>
  );
};