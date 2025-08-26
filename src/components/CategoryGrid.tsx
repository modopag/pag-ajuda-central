import CategoryCard from "./CategoryCard";
import { CategoryGridSkeleton } from '@/components/skeletons/CategoryGridSkeleton';
import { useCategories } from "@/hooks/useCategories";

interface CategoryGridProps {
  onCategoryClick?: (categoryId: string) => void;
}

const CategoryGrid = ({ onCategoryClick }: CategoryGridProps) => {
  const { categories, loading, error } = useCategories();

  if (loading) {
    return <CategoryGridSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center text-muted-foreground p-8">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((category) => (
        <CategoryCard
          key={category.id}
          title={category.name}
          description={category.description}
          iconUrl={category.icon_url || undefined}
          articleCount={0}
          onClick={() => onCategoryClick?.(category.slug)}
        />
      ))}
    </div>
  );
};

export default CategoryGrid;