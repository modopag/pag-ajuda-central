import { Skeleton } from '@/components/ui/skeleton';

export const CategoryGridSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
      {Array.from({ length: 9 }).map((_, index) => (
        <div key={index} className="category-card" style={{ minHeight: '200px' }}>
          <div className="flex flex-col items-center">
            <Skeleton 
              className="rounded-lg mb-4" 
              style={{ width: '64px', height: '64px', aspectRatio: '1/1' }} 
            />
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-24 mb-3" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
};