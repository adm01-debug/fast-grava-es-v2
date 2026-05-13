import { memo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Base skeleton wrapper with consistent styling
interface PageSkeletonProps {
  className?: string;
  children: React.ReactNode;
}

export const PageSkeleton = memo(function PageSkeleton({ className, children }: PageSkeletonProps) {
  return (
    <div className={cn("min-h-screen bg-background p-4 md:p-6 lg:p-8 animate-in fade-in duration-300", className)}>
      {children}
    </div>
  );
});

// Header skeleton for page titles
export const HeaderSkeleton = memo(function HeaderSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6", className)}>
      <div className="space-y-2">
        <Skeleton className="h-8 w-48 md:w-64" />
        <Skeleton className="h-4 w-32 md:w-48" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-10" />
      </div>
    </div>
  );
});

// Stats cards skeleton (for dashboards)
interface StatsSkeletonProps {
  count?: number;
  className?: string;
}

export const StatsSkeleton = memo(function StatsSkeleton({ count = 4, className }: StatsSkeletonProps) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-12 w-12 rounded-xl" />
          </div>
        </Card>
      ))}
    </div>
  );
});

// Card skeleton for widgets
interface CardSkeletonProps {
  hasHeader?: boolean;
  headerWidth?: string;
  contentHeight?: string;
  className?: string;
}

export const CardSkeleton = memo(function CardSkeleton({
  hasHeader = true,
  headerWidth = "w-40",
  contentHeight = "h-48",
  className
}: CardSkeletonProps) {
  return (
    <Card className={cn("glass-card", className)}>
      {hasHeader && (
        <CardHeader className="pb-2">
          <Skeleton className={cn("h-6", headerWidth)} />
        </CardHeader>
      )}
      <CardContent>
        <Skeleton className={cn("w-full", contentHeight)} />
      </CardContent>
    </Card>
  );
});

// Table skeleton
interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export const TableSkeleton = memo(function TableSkeleton({ rows = 5, columns = 6, className }: TableSkeletonProps) {
  return (
    <Card className={cn("glass-card overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Header row */}
          <div className="flex gap-4 pb-2 border-b border-border/30">
            {Array.from({ length: columns }).map((_, i) => (
              <Skeleton key={i} className="h-4 flex-1" />
            ))}
          </div>
          {/* Data rows */}
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex gap-4 py-2">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton key={colIndex} className="h-6 flex-1" />
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

// Timeline skeleton (for calendar views)
interface TimelineSkeletonProps {
  rows?: number;
  className?: string;
}

export const TimelineSkeleton = memo(function TimelineSkeleton({ rows = 6, className }: TimelineSkeletonProps) {
  return (
    <Card className={cn("glass-card", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-32" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Hours header */}
          <div className="flex gap-2 border-b border-border/30 pb-2">
            <Skeleton className="w-16 h-4" />
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="flex-1 h-4" />
            ))}
          </div>
          {/* Timeline rows */}
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="w-16 h-4" />
              <Skeleton className="flex-1 h-10 rounded-lg" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

// Kanban skeleton
interface KanbanSkeletonProps {
  columns?: number;
  cardsPerColumn?: number;
  className?: string;
}

export const KanbanSkeleton = memo(function KanbanSkeleton({
  columns = 5,
  cardsPerColumn = 3,
  className
}: KanbanSkeletonProps) {
  return (
    <div className={cn("flex gap-4 overflow-x-auto pb-4", className)}>
      {Array.from({ length: columns }).map((_, colIndex) => (
        <div key={colIndex} className="flex-shrink-0 w-72">
          <div className="bg-secondary/30 rounded-lg p-3 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-8 rounded-full" />
            </div>
            {Array.from({ length: cardsPerColumn }).map((_, cardIndex) => (
              <Card key={cardIndex} className="p-3 space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <div className="flex gap-2 pt-1">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-12 rounded-full" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
});

// List skeleton (for pending queue, etc)
interface ListSkeletonProps {
  items?: number;
  className?: string;
}

export const ListSkeleton = memo(function ListSkeleton({ items = 8, className }: ListSkeletonProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <Card key={i} className="p-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        </Card>
      ))}
    </div>
  );
});

// Chart skeleton
interface ChartSkeletonProps {
  type?: 'bar' | 'pie' | 'line';
  className?: string;
}

export const ChartSkeleton = memo(function ChartSkeleton({ type = 'bar', className }: ChartSkeletonProps) {
  return (
    <Card className={cn("glass-card", className)}>
      <CardHeader className="pb-2">
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent>
        {type === 'bar' && (
          <div className="h-64 flex items-end gap-2 pt-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton
                key={i}
                className="flex-1 rounded-t-md"
                style={{ height: `${Math.random() * 60 + 30}%` }}
              />
            ))}
          </div>
        )}
        {type === 'pie' && (
          <div className="h-64 flex items-center justify-center">
            <Skeleton className="h-48 w-48 rounded-full" />
          </div>
        )}
        {type === 'line' && (
          <div className="h-64">
            <Skeleton className="h-full w-full" />
          </div>
        )}
      </CardContent>
    </Card>
  );
});

// Widget grid skeleton (for dashboards)
interface WidgetGridSkeletonProps {
  layout?: 'dashboard' | 'efficiency' | 'kpi';
  className?: string;
}

export const WidgetGridSkeleton = memo(function WidgetGridSkeleton({ layout = 'dashboard', className }: WidgetGridSkeletonProps) {
  if (layout === 'dashboard') {
    return (
      <div className={cn("grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6", className)}>
        <CardSkeleton contentHeight="h-64" className="lg:col-span-2" />
        <CardSkeleton contentHeight="h-64" />
        <CardSkeleton contentHeight="h-48" />
        <CardSkeleton contentHeight="h-48" />
        <CardSkeleton contentHeight="h-48" />
      </div>
    );
  }

  if (layout === 'efficiency') {
    return (
      <div className={cn("grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6", className)}>
        <CardSkeleton contentHeight="h-80" />
        <CardSkeleton contentHeight="h-80" />
        <CardSkeleton contentHeight="h-80" />
        <CardSkeleton contentHeight="h-64" className="lg:col-span-2" />
        <CardSkeleton contentHeight="h-64" />
      </div>
    );
  }

  if (layout === 'kpi') {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} contentHeight="h-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartSkeleton type="bar" />
          <ChartSkeleton type="line" />
        </div>
      </div>
    );
  }

  return null;
});

// Complete page skeletons for specific page types
export const DashboardPageSkeleton = memo(function DashboardPageSkeleton() {
  return (
    <PageSkeleton>
      <HeaderSkeleton />
      <StatsSkeleton count={4} />
      <WidgetGridSkeleton layout="dashboard" />
    </PageSkeleton>
  );
});

export const CalendarPageSkeleton = memo(function CalendarPageSkeleton() {
  return (
    <PageSkeleton>
      <HeaderSkeleton />
      <TimelineSkeleton rows={8} />
    </PageSkeleton>
  );
});

export const KanbanPageSkeleton = memo(function KanbanPageSkeleton() {
  return (
    <PageSkeleton>
      <HeaderSkeleton />
      <KanbanSkeleton columns={5} cardsPerColumn={3} />
    </PageSkeleton>
  );
});

export const ListPageSkeleton = memo(function ListPageSkeleton() {
  return (
    <PageSkeleton>
      <HeaderSkeleton />
      <div className="flex gap-2 mb-4">
        <Skeleton className="h-10 flex-1 max-w-sm" />
        <Skeleton className="h-10 w-32" />
      </div>
      <ListSkeleton items={6} />
    </PageSkeleton>
  );
});

export const TablePageSkeleton = memo(function TablePageSkeleton() {
  return (
    <PageSkeleton>
      <HeaderSkeleton />
      <TableSkeleton rows={8} columns={6} />
    </PageSkeleton>
  );
});

export const KPIPageSkeleton = memo(function KPIPageSkeleton() {
  return (
    <PageSkeleton>
      <HeaderSkeleton />
      <WidgetGridSkeleton layout="kpi" />
    </PageSkeleton>
  );
});

export const EfficiencyPageSkeleton = memo(function EfficiencyPageSkeleton() {
  return (
    <PageSkeleton>
      <HeaderSkeleton />
      <StatsSkeleton count={3} />
      <WidgetGridSkeleton layout="efficiency" />
    </PageSkeleton>
  );
});

// Auth page skeleton
export const AuthPageSkeleton = memo(function AuthPageSkeleton() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 space-y-6">
        <div className="text-center space-y-2">
          <Skeleton className="h-12 w-12 rounded-xl mx-auto" />
          <Skeleton className="h-6 w-32 mx-auto" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-4 w-40 mx-auto" />
      </Card>
    </div>
  );
});
