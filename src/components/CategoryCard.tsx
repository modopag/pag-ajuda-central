import { LucideIcon } from "lucide-react";
import { ImageOptimizer } from "@/components/performance/ImageOptimizer";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

interface CategoryCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconUrl?: string;
  onClick?: () => void;
  articleCount?: number;
}

const CategoryCard = ({ title, description, icon: Icon, iconUrl, onClick, articleCount }: CategoryCardProps) => {
  const { elementRef, hasIntersected } = useIntersectionObserver<HTMLDivElement>({ 
    threshold: 0.1, 
    triggerOnce: true 
  });

  return (
    <div 
      ref={elementRef}
      className="category-card group"
      onClick={onClick}
    >
      <div className="category-icon group-hover:text-accent">
        {iconUrl ? (
          hasIntersected ? (
            <ImageOptimizer
              src={iconUrl} 
              alt={`Ícone da categoria ${title}`} 
              className="w-full h-full object-contain"
              width={64}
              height={64}
              priority={false}
            />
          ) : (
            <div className="w-full h-full bg-muted animate-pulse rounded" />
          )
        ) : Icon ? (
          <Icon className="w-full h-full" />
        ) : null}
      </div>
      
      <h3 className="category-title group-hover:text-accent mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
          {description}
        </p>
      )}
      
      <div className="flex items-center justify-between mt-auto">
        <span className="text-xs text-accent font-medium bg-accent/10 px-2 py-1 rounded-full">
          {articleCount || 0} {(articleCount || 0) === 1 ? 'artigo' : 'artigos'}
        </span>
        <div className="text-xs text-muted-foreground group-hover:text-accent transition-colors">
          →
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;