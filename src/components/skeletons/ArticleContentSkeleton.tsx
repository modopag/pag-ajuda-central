import { Skeleton } from '@/components/ui/skeleton';

export const ArticleContentSkeleton = () => {
  return (
    <>
      {/* Breadcrumbs Skeleton */}
      <div className="py-4 px-4 border-b border-border">
        <div className="container mx-auto">
          <div className="flex items-center space-x-2 text-sm">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>

      {/* Article Content Skeleton */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button Skeleton */}
          <Skeleton className="h-6 w-32 mb-6" />

          {/* Article Header */}
          <header className="mb-8">
            <Skeleton className="h-6 w-20 mb-4 rounded-full" />
            <Skeleton className="h-10 w-3/4 mb-4" />
            
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex items-center gap-1">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex items-center gap-1">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </header>

          {/* Article Content */}
          <article className="prose prose-lg max-w-none mb-12">
            <div className="space-y-6">
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>

              <Skeleton className="h-48 w-full rounded-lg" />

              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>

              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </div>
          </article>

          {/* Feedback Section Skeleton */}
          <div className="mb-12 pt-8 border-t">
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="h-4 w-64 mb-6" />
            <div className="flex gap-4">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-20" />
            </div>
          </div>

          {/* Related Articles Skeleton */}
          <section className="mt-12 pt-8 border-t">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border rounded-lg">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Skeleton className="h-4 w-16 rounded-full" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                    <Skeleton className="h-5 w-full mb-3" />
                    <div className="space-y-2 mb-3">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Skeleton className="h-4 w-64 mx-auto" />
            </div>
          </section>
        </div>
      </main>
    </>
  );
};