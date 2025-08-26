import { cn } from '@/lib/utils';
import logoYellow from '@/assets/modopag-logo-yellow.webp';

interface PageLoaderProps {
  className?: string;
  message?: string;
}

export const PageLoader = ({ 
  className,
  message = "Carregando..."
}: PageLoaderProps) => {
  return (
    <div className={cn(
      "min-h-[400px] flex flex-col items-center justify-center space-y-4",
      className
    )}>
      <div className="relative">
        <img 
          src={logoYellow}
          alt="modoPAG"
          className="w-16 h-16 animate-pulse"
          width={64}
          height={64}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
      </div>
      
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground animate-fade-in">
          {message}
        </p>
        <div className="flex justify-center space-x-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};