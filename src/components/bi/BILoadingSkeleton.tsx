import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function BILoadingSkeleton() {
  return (
    <div className="space-y-10 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-card/40 backdrop-blur-md border-border/40 shadow-xl rounded-3xl overflow-hidden ring-1 ring-white/5 h-32" style={{ animationDelay: `${i * 100}ms` }}>
            <CardContent className="p-8 h-full flex flex-col justify-center gap-3">
              <Skeleton className="h-4 w-24 rounded-full opacity-60" />
              <Skeleton className="h-10 w-32 rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="bg-card/40 backdrop-blur-md border-border/40 shadow-2xl rounded-3xl overflow-hidden ring-1 ring-white/5" style={{ animationDelay: `${(i + 4) * 100}ms` }}>
            <CardHeader className="p-8 pb-0">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-2xl opacity-40" />
                <Skeleton className="h-8 w-48 rounded-lg" />
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-6">
              <Skeleton className="h-[350px] w-full rounded-2xl opacity-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
