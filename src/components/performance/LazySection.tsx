import { ReactNode } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { cn } from '@/lib/utils';

interface LazySectionProps {
  children: ReactNode;
  className?: string;
  fallback?: ReactNode;
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export const LazySection = ({
  children,
  className,
  fallback = <div className="animate-pulse bg-muted h-32 rounded" />,
  threshold = 0.1,
  rootMargin = '100px',
  triggerOnce = true
}: LazySectionProps) => {
  const { elementRef, hasIntersected } = useIntersectionObserver<HTMLDivElement>({
    threshold,
    rootMargin,
    triggerOnce
  });

  return (
    <div ref={elementRef} className={cn("transition-all duration-300", className)}>
      {hasIntersected ? children : fallback}
    </div>
  );
};