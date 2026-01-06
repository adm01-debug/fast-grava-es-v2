import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

// Skeleton variant types
type SkeletonVariant = 
  | 'card'
  | 'list-item'
  | 'table-row'
  | 'stat-card'
  | 'profile'
  | 'kanban-card'
  | 'job-card'
  | 'machine-card'
  | 'operator-card'
  | 'calendar-event'
  | 'notification'
  | 'chart'
  | 'form'
  | 'timeline'
  | 'badge-group'
  | 'avatar-group';

interface SkeletonFactoryProps {
  variant: SkeletonVariant;
  count?: number;
  className?: string;
  animate?: boolean;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

// Individual skeleton components
const CardSkeleton = () => (
  <div className="p-4 rounded-xl border border-border bg-card space-y-3">
    <div className="flex items-center gap-3">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
    <Skeleton className="h-20 w-full rounded-lg" />
    <div className="flex gap-2">
      <Skeleton className="h-8 w-20 rounded-md" />
      <Skeleton className="h-8 w-20 rounded-md" />
    </div>
  </div>
);

const ListItemSkeleton = () => (
  <div className="flex items-center gap-4 p-3 rounded-lg border border-border/50">
    <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-1/3" />
    </div>
    <Skeleton className="h-8 w-8 rounded-md shrink-0" />
  </div>
);

const TableRowSkeleton = () => (
  <div className="grid grid-cols-5 gap-4 p-4 border-b border-border/50">
    <Skeleton className="h-4" />
    <Skeleton className="h-4" />
    <Skeleton className="h-4" />
    <Skeleton className="h-4" />
    <Skeleton className="h-4 w-1/2" />
  </div>
);

const StatCardSkeleton = () => (
  <div className="p-4 rounded-xl border border-border bg-card">
    <div className="flex items-center justify-between mb-3">
      <Skeleton className="h-8 w-8 rounded-lg" />
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
    <Skeleton className="h-8 w-24 mb-2" />
    <Skeleton className="h-3 w-32" />
  </div>
);

const ProfileSkeleton = () => (
  <div className="flex flex-col items-center p-6 rounded-xl border border-border bg-card">
    <Skeleton className="h-20 w-20 rounded-full mb-4" />
    <Skeleton className="h-5 w-32 mb-2" />
    <Skeleton className="h-4 w-24 mb-4" />
    <div className="flex gap-2 mb-4">
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
    <Skeleton className="h-10 w-full rounded-lg" />
  </div>
);

const KanbanCardSkeleton = () => (
  <div className="p-3 rounded-lg border border-border bg-card space-y-2">
    <div className="flex items-center gap-2">
      <Skeleton className="h-5 w-5 rounded" />
      <Skeleton className="h-4 flex-1" />
    </div>
    <Skeleton className="h-3 w-3/4" />
    <div className="flex items-center justify-between pt-2">
      <Skeleton className="h-6 w-6 rounded-full" />
      <Skeleton className="h-5 w-12 rounded-full" />
    </div>
  </div>
);

const JobCardSkeleton = () => (
  <div className="p-4 rounded-xl border border-border bg-card">
    <div className="flex items-start justify-between mb-3">
      <div className="space-y-2">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-40" />
      </div>
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
    <div className="grid grid-cols-2 gap-3 mb-3">
      <div className="space-y-1">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="space-y-1">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
    <Skeleton className="h-2 w-full rounded-full" />
  </div>
);

const MachineCardSkeleton = () => (
  <div className="p-4 rounded-xl border border-border bg-card">
    <div className="flex items-center gap-3 mb-4">
      <Skeleton className="h-12 w-12 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-3 w-3 rounded-full" />
    </div>
    <div className="grid grid-cols-3 gap-2">
      <Skeleton className="h-16 rounded-lg" />
      <Skeleton className="h-16 rounded-lg" />
      <Skeleton className="h-16 rounded-lg" />
    </div>
  </div>
);

const OperatorCardSkeleton = () => (
  <div className="p-4 rounded-xl border border-border bg-card">
    <div className="flex items-center gap-3 mb-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
    <div className="flex gap-2 mb-3">
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
    <Skeleton className="h-2 w-full rounded-full" />
  </div>
);

const CalendarEventSkeleton = () => (
  <div className="flex gap-3 p-3 rounded-lg border-l-4 border-primary/30 bg-muted/30">
    <div className="space-y-1">
      <Skeleton className="h-4 w-12" />
      <Skeleton className="h-3 w-8" />
    </div>
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  </div>
);

const NotificationSkeleton = () => (
  <div className="flex gap-3 p-3 rounded-lg border border-border/50">
    <Skeleton className="h-8 w-8 rounded-full shrink-0" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-3 w-2/3" />
      <Skeleton className="h-3 w-20" />
    </div>
  </div>
);

const ChartSkeleton = () => (
  <div className="p-4 rounded-xl border border-border bg-card">
    <div className="flex items-center justify-between mb-4">
      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </div>
    <div className="flex items-end justify-around gap-2 h-40">
      {Array.from({ length: 7 }).map((_, i) => (
        <Skeleton
          key={i}
          className="flex-1 rounded-t"
          style={{ height: `${30 + Math.random() * 50}%` }}
        />
      ))}
    </div>
  </div>
);

const FormSkeleton = () => (
  <div className="space-y-4 p-4 rounded-xl border border-border bg-card">
    <div className="space-y-2">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
    <Skeleton className="h-10 w-full rounded-lg" />
  </div>
);

const TimelineSkeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="flex gap-4">
        <div className="flex flex-col items-center">
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-full w-0.5" />
        </div>
        <div className="flex-1 pb-4 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
    ))}
  </div>
);

const BadgeGroupSkeleton = () => (
  <div className="flex flex-wrap gap-2">
    {Array.from({ length: 5 }).map((_, i) => (
      <Skeleton key={i} className="h-6 w-16 rounded-full" />
    ))}
  </div>
);

const AvatarGroupSkeleton = () => (
  <div className="flex -space-x-2">
    {Array.from({ length: 4 }).map((_, i) => (
      <Skeleton
        key={i}
        className="h-8 w-8 rounded-full border-2 border-background"
      />
    ))}
    <Skeleton className="h-8 w-8 rounded-full border-2 border-background" />
  </div>
);

// Skeleton map
const skeletonMap: Record<SkeletonVariant, React.FC> = {
  'card': CardSkeleton,
  'list-item': ListItemSkeleton,
  'table-row': TableRowSkeleton,
  'stat-card': StatCardSkeleton,
  'profile': ProfileSkeleton,
  'kanban-card': KanbanCardSkeleton,
  'job-card': JobCardSkeleton,
  'machine-card': MachineCardSkeleton,
  'operator-card': OperatorCardSkeleton,
  'calendar-event': CalendarEventSkeleton,
  'notification': NotificationSkeleton,
  'chart': ChartSkeleton,
  'form': FormSkeleton,
  'timeline': TimelineSkeleton,
  'badge-group': BadgeGroupSkeleton,
  'avatar-group': AvatarGroupSkeleton,
};

export function SkeletonFactory({
  variant,
  count = 1,
  className,
  animate = true,
}: SkeletonFactoryProps) {
  const SkeletonComponent = skeletonMap[variant];

  if (!SkeletonComponent) {
    console.warn(`Unknown skeleton variant: ${variant}`);
    return null;
  }

  const items = Array.from({ length: count }, (_, i) => i);

  if (!animate) {
    return (
      <div className={cn("space-y-3", className)}>
        {items.map((i) => (
          <SkeletonComponent key={i} />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn("space-y-3", className)}
    >
      {items.map((i) => (
        <motion.div key={i} variants={itemVariants}>
          <SkeletonComponent />
        </motion.div>
      ))}
    </motion.div>
  );
}

// Utility hook for skeleton loading
export function useSkeletonLoading<T>(
  data: T | undefined | null,
  isLoading: boolean
): { showSkeleton: boolean; hasData: boolean } {
  return {
    showSkeleton: isLoading && !data,
    hasData: !isLoading && data != null,
  };
}

// Page skeleton presets
export const PageSkeletons = {
  Dashboard: () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SkeletonFactory variant="stat-card" count={4} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonFactory variant="chart" count={2} />
      </div>
    </div>
  ),
  
  JobList: () => (
    <div className="space-y-4">
      <SkeletonFactory variant="job-card" count={5} />
    </div>
  ),
  
  Kanban: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-8 w-full rounded-lg" />
          <SkeletonFactory variant="kanban-card" count={3} />
        </div>
      ))}
    </div>
  ),
  
  Calendar: () => (
    <div className="space-y-4">
      <Skeleton className="h-12 w-full rounded-lg" />
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 35 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
    </div>
  ),
  
  Operators: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <SkeletonFactory variant="operator-card" count={6} />
    </div>
  ),
  
  Machines: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <SkeletonFactory variant="machine-card" count={6} />
    </div>
  ),
};
