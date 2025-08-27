import { Skeleton } from '@/components/ui/skeleton';

export const CategoryGridSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
      {Array.from({ length: 9 }).map((_, index) => (
        <div key={index} className="category-card">
          <Skeleton className="w-16 h-16 mx-auto mb-4 rounded-full" />
          <Skeleton className="h-6 w-32 mx-auto mb-2" />
          <Skeleton className="h-4 w-24 mx-auto" />
        </div>
      ))}
    </div>
  );
};