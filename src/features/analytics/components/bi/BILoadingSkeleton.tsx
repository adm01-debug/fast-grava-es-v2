import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function BILoadingSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in p-1">
      {/* Top Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-black/40 border-white/5 backdrop-blur-xl">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="space-y-3 flex-1">
                  <Skeleton className="h-3 w-20 bg-white/5" />
                  <Skeleton className="h-10 w-24 bg-white/10" />
                  <Skeleton className="h-2 w-32 bg-white/5" />
                </div>
                <Skeleton className="h-12 w-12 rounded-xl bg-white/5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-black/40 border-white/5 backdrop-blur-xl">
          <CardHeader>
            <Skeleton className="h-6 w-48 bg-white/10" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[350px] w-full bg-white/5" />
          </CardContent>
        </Card>
        <Card className="bg-black/40 border-white/5 backdrop-blur-xl">
          <CardHeader>
            <Skeleton className="h-6 w-32 bg-white/10" />
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-6">
            <Skeleton className="h-48 w-48 rounded-full bg-white/5" />
            <div className="grid grid-cols-2 gap-4 w-full">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-4 w-full bg-white/5" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="bg-black/40 border-white/5 backdrop-blur-xl">
            <CardHeader>
              <Skeleton className="h-6 w-40 bg-white/10" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full bg-white/5" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
