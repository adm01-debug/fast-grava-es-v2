import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} className="glass-card overflow-hidden">
          <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
            <div className="flex justify-between items-start mb-2">
              <Skeleton className="h-4 w-16" />
              <div className="flex gap-1">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-14" />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
            <Skeleton className="h-3 w-full mt-2" />
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <Skeleton className="h-3 w-16 mb-2" />
                <Skeleton className="h-10 w-24" />
              </div>
              <div className="text-right">
                <Skeleton className="h-3 w-16 mb-2" />
                <Skeleton className="h-4 w-12 ml-auto" />
              </div>
            </div>
            <Skeleton className="h-1.5 w-full rounded-full" />
            <div className="flex gap-2">
              <Skeleton className="h-8 flex-1 rounded-md" />
              <Skeleton className="h-8 flex-1 rounded-md" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
