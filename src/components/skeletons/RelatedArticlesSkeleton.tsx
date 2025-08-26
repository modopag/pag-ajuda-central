import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface RelatedArticlesSkeletonProps {
  maxArticles?: number;
}

export const RelatedArticlesSkeleton = ({ maxArticles = 3 }: RelatedArticlesSkeletonProps) => {
  return (
    <section className="mt-12 pt-8 border-t">
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: maxArticles }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-8 text-center">
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>
    </section>
  );
};