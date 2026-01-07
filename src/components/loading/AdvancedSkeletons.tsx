import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

// Base Skeleton with shimmer effect
interface SkeletonProps {
  className?: string;
  variant?: 'default' | 'rounded' | 'circular';
}

export function Skeleton({ className, variant = 'default' }: SkeletonProps) {
  const variants = {
    default: 'rounded-md',
    rounded: 'rounded-lg',
    circular: 'rounded-full'
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-muted",
        variants[variant],
        className
      )}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{ x: ['-100%', '100%'] }}
        transition={{ 
          duration: 1.5, 
          repeat: Infinity, 
          ease: 'linear',
          repeatDelay: 0.5
        }}
      />
    </div>
  );
}

// Card Skeleton
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("p-4 border border-border rounded-lg bg-card", className)}>
      <div className="flex items-start gap-3">
        <Skeleton variant="circular" className="h-10 w-10 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-4/6" />
      </div>
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-8 w-20 rounded-md" />
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>
    </div>
  );
}

// Table Skeleton
export function TableSkeleton({ 
  rows = 5, 
  columns = 4,
  className 
}: { 
  rows?: number; 
  columns?: number;
  className?: string;
}) {
  return (
    <div className={cn("border border-border rounded-lg overflow-hidden", className)}>
      {/* Header */}
      <div className="flex gap-4 p-4 bg-muted/50 border-b border-border">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`header-${i}`} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div 
          key={`row-${rowIndex}`} 
          className="flex gap-4 p-4 border-b border-border last:border-0"
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton 
              key={`cell-${rowIndex}-${colIndex}`} 
              className="h-4 flex-1"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// List Skeleton
export function ListSkeleton({ 
  items = 5,
  className 
}: { 
  items?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-center gap-3 p-3 border border-border rounded-lg"
        >
          <Skeleton variant="circular" className="h-10 w-10 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-8 rounded-md" />
        </motion.div>
      ))}
    </div>
  );
}

// Dashboard Skeleton
export function DashboardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-10 w-24 rounded-md" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="p-4 border border-border rounded-lg bg-card"
          >
            <div className="flex items-center justify-between mb-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton variant="circular" className="h-8 w-8" />
            </div>
            <Skeleton className="h-8 w-24 mb-2" />
            <Skeleton className="h-3 w-16" />
          </motion.div>
        ))}
      </div>

      {/* Chart Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-4 border border-border rounded-lg bg-card">
          <Skeleton className="h-5 w-32 mb-4" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
        <div className="p-4 border border-border rounded-lg bg-card">
          <Skeleton className="h-5 w-32 mb-4" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="p-4 border border-border rounded-lg bg-card">
        <Skeleton className="h-5 w-40 mb-4" />
        <ListSkeleton items={4} />
      </div>
    </div>
  );
}

// Form Skeleton
export function FormSkeleton({ 
  fields = 4,
  className 
}: { 
  fields?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-6", className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      ))}
      <div className="flex gap-3 pt-4">
        <Skeleton className="h-10 w-24 rounded-md" />
        <Skeleton className="h-10 w-20 rounded-md" />
      </div>
    </div>
  );
}

// Profile Skeleton
export function ProfileSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <Skeleton variant="circular" className="h-24 w-24 mb-4" />
      <Skeleton className="h-6 w-40 mb-2" />
      <Skeleton className="h-4 w-32 mb-4" />
      <div className="flex gap-4 mb-6">
        <div className="text-center">
          <Skeleton className="h-6 w-12 mb-1" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="text-center">
          <Skeleton className="h-6 w-12 mb-1" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="text-center">
          <Skeleton className="h-6 w-12 mb-1" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-10 w-32 rounded-full" />
    </div>
  );
}

// Skeleton Wrapper with loading state
interface SkeletonWrapperProps {
  isLoading: boolean;
  skeleton: ReactNode;
  children: ReactNode;
  className?: string;
}

export function SkeletonWrapper({ 
  isLoading, 
  skeleton, 
  children,
  className 
}: SkeletonWrapperProps) {
  return (
    <div className={className}>
      {isLoading ? skeleton : children}
    </div>
  );
}

// Animated content reveal
export function ContentReveal({ 
  children, 
  delay = 0,
  className 
}: { 
  children: ReactNode; 
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
