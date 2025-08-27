import { cn } from "@/lib/utils";
import { Skeleton } from "./skeleton";

interface ProgressiveSkeletonProps {
  className?: string;
  variant?: 'card' | 'text' | 'category' | 'faq' | 'article';
  count?: number;
}

export const ProgressiveSkeleton = ({ 
  className,
  variant = 'card',
  count = 1
}: ProgressiveSkeletonProps) => {
  
  const renderSkeletonContent = () => {
    switch (variant) {
      case 'category':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="p-6 border rounded-lg bg-card space-y-4">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        );
        
      case 'faq':
        return (
          <div className="space-y-4 max-w-4xl mx-auto">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="border rounded-lg bg-card p-6 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        );
        
      case 'article':
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
            </div>
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" style={{ width: `${Math.random() * 30 + 70}%` }} />
              ))}
            </div>
          </div>
        );
        
      case 'text':
        return (
          <div className="space-y-2">
            {Array.from({ length: count }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" style={{ width: `${Math.random() * 40 + 60}%` }} />
            ))}
          </div>
        );
        
      default:
        return (
          <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        );
    }
  };

  return (
    <div className={cn("animate-pulse", className)}>
      {renderSkeletonContent()}
    </div>
  );
};