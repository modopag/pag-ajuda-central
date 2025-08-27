import CategoryCard from "./CategoryCard";
import { CategoryGridSkeleton } from '@/components/skeletons/CategoryGridSkeleton';
import { useResilientCategories } from "@/hooks/useResilientCategories";
import { AlertCircle, Wifi } from "lucide-react";
import { Button } from "./ui/button";

interface CategoryGridProps {
  onCategoryClick?: (categoryId: string) => void;
}

const CategoryGrid = ({ onCategoryClick }: CategoryGridProps) => {
  const { categories, loading, error, retry, isStale, isOffline } = useResilientCategories();

  // Show skeleton only on initial load
  if (loading && !categories.length) {
    return <CategoryGridSkeleton />;
  }

  // Show error only if we have no data at all
  if (error && !categories.length) {
    return (
      <div className="text-center text-muted-foreground p-8">
        <div className="flex flex-col items-center gap-4">
          <AlertCircle className="w-12 h-12 text-muted-foreground/50" />
          <div>
            <p className="font-medium mb-2">Erro ao carregar categorias</p>
            <p className="text-sm mb-4">Não foi possível carregar as categorias. Tente novamente.</p>
            <Button onClick={retry} variant="outline" size="sm">
              Tentar novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status indicator for stale/offline data */}
      {(isStale || isOffline || error) && (
        <div className="flex items-center justify-center gap-2 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
          {isOffline && <Wifi className="w-4 h-4" />}
          {isOffline ? (
            "Mostrando dados salvos (offline)"
          ) : isStale ? (
            "Dados podem estar desatualizados"
          ) : error ? (
            <span className="flex items-center gap-2">
              Erro ao atualizar dados
              <Button onClick={retry} variant="ghost" size="sm" className="h-6 px-2 text-xs">
                Tentar novamente
              </Button>
            </span>
          ) : null}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            title={category.name}
            description={category.description}
            iconUrl={category.icon_url || undefined}
            articleCount={category.article_count || 0}
            onClick={() => onCategoryClick?.(category.slug)}
          />
        ))}
      </div>
    </div>
  );
};

export default CategoryGrid;