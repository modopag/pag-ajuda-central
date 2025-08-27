import { cn } from "@/lib/utils";
import { ProgressiveSkeleton } from "./ui/progressive-skeleton";

interface SmartLoadingProps {
  variant?: 'page' | 'section' | 'inline';
  className?: string;
  children?: React.ReactNode;
}

// Immediate content shell that renders instantly
export const ContentShell = ({ className, children }: SmartLoadingProps) => {
  return (
    <div className={cn("min-h-screen", className)}>
      {/* Header space - reserved but empty */}
      <div className="h-20" />
      
      {/* Main content area */}
      <main className="container mx-auto px-4">
        {children}
      </main>
      
      {/* Footer space - reserved but empty */}
      <div className="h-32" />
    </div>
  );
};

// Progressive loading for sections
export const ProgressiveSection = ({ 
  isLoading, 
  error, 
  retry, 
  children, 
  skeletonVariant = 'card',
  skeletonCount = 3,
  className 
}: {
  isLoading: boolean;
  error?: string | null;
  retry?: () => void;
  children: React.ReactNode;
  skeletonVariant?: 'card' | 'text' | 'category' | 'faq' | 'article';
  skeletonCount?: number;
  className?: string;
}) => {
  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <ProgressiveSkeleton 
          variant={skeletonVariant} 
          count={skeletonCount} 
        />
      </div>
    );
  }

  if (error && retry) {
    return (
      <div className={cn("text-center p-8", className)}>
        <p className="text-muted-foreground mb-4">{error}</p>
        <button 
          onClick={retry}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return <div className={className}>{children}</div>;
};