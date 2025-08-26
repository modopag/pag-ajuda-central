import { LucideIcon } from "lucide-react";

interface CategoryCardProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  onClick?: () => void;
  articleCount?: number;
}

const CategoryCard = ({ title, description, icon: Icon, onClick, articleCount }: CategoryCardProps) => {
  return (
    <div 
      className="category-card"
      onClick={onClick}
    >
      <div className="category-icon">
        <Icon className="w-full h-full" />
      </div>
      
      <h3 className="category-title mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
          {description}
        </p>
      )}
      
      {articleCount && (
        <span className="text-xs text-muted-foreground">
          {articleCount} {articleCount === 1 ? 'artigo' : 'artigos'}
        </span>
      )}
    </div>
  );
};

export default CategoryCard;