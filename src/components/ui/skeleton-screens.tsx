import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Base skeleton component with enhanced animations
interface SkeletonProps {
  className?: string;
  variant?: "default" | "text" | "circular" | "rectangular";
  animation?: "pulse" | "wave" | "shimmer" | "none";
  width?: string | number;
  height?: string | number;
  delay?: number;
  style?: React.CSSProperties;
}

export function Skeleton({
  className,
  variant = "default",
  animation = "pulse",
  width,
  height,
  delay = 0,
  style,
}: SkeletonProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: delay * 0.1, duration: 0.3 }}
      className={cn(
        "bg-muted relative overflow-hidden",
        {
          "animate-pulse": animation === "pulse",
          "rounded-md": variant === "default",
          "rounded-sm h-4": variant === "text",
          "rounded-full aspect-square": variant === "circular",
          "rounded-lg": variant === "rectangular",
        },
        animation === "wave" || animation === "shimmer" ? "after:absolute after:inset-0 after:translate-x-[-100%] after:animate-[shimmer_2s_infinite] after:bg-gradient-to-r after:from-transparent after:via-white/10 after:to-transparent" : "",
        className
      )}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
        ...style,
      }}
    />
  );
}

// ============================================
// CONTEXTUAL SKELETON SCREENS
// ============================================

// Job Card Skeleton - específico para cards de jobs
export function SkeletonJobCard({ className }: { className?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("rounded-xl border bg-card p-4 space-y-3", className)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton variant="rectangular" className="h-10 w-10" delay={0} />
          <div className="space-y-1.5">
            <Skeleton variant="text" className="w-32 h-4" delay={1} />
            <Skeleton variant="text" className="w-20 h-3" delay={2} />
          </div>
        </div>
        <Skeleton className="h-6 w-16 rounded-full" delay={3} />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-6 w-20 rounded-md" delay={4} />
        <Skeleton className="h-6 w-24 rounded-md" delay={5} />
        <Skeleton className="h-6 w-16 rounded-md" delay={6} />
      </div>
      <div className="flex items-center justify-between pt-2 border-t">
        <Skeleton variant="text" className="w-24 h-3" delay={7} />
        <div className="flex gap-1">
          <Skeleton className="h-8 w-8 rounded-md" delay={8} />
          <Skeleton className="h-8 w-8 rounded-md" delay={9} />
        </div>
      </div>
    </motion.div>
  );
}

// Machine Card Skeleton
export function SkeletonMachineCard({ className }: { className?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn("rounded-xl border bg-card p-5 space-y-4", className)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Skeleton variant="circular" className="h-12 w-12" delay={0} />
          <div className="space-y-1.5">
            <Skeleton variant="text" className="w-28 h-5" delay={1} />
            <Skeleton variant="text" className="w-16 h-3" delay={2} />
          </div>
        </div>
        <Skeleton className="h-3 w-3 rounded-full" delay={3} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map(i => (
          <div key={i} className="space-y-1">
            <Skeleton variant="text" className="w-full h-3" delay={4 + i} />
            <Skeleton variant="text" className="w-2/3 h-5" delay={5 + i} />
          </div>
        ))}
      </div>
      <Skeleton className="h-2 w-full rounded-full" delay={8} />
    </motion.div>
  );
}

// Maintenance Schedule Skeleton
export function SkeletonMaintenanceCard({ className }: { className?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn("rounded-lg border-l-4 border-l-muted bg-card p-4 space-y-3", className)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-md" delay={0} />
          <Skeleton variant="text" className="w-40 h-4" delay={1} />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" delay={2} />
      </div>
      <div className="flex items-center gap-4">
        <Skeleton variant="text" className="w-24 h-3" delay={3} />
        <Skeleton variant="text" className="w-20 h-3" delay={4} />
      </div>
    </motion.div>
  );
}

// Analytics/KPI Card Skeleton
export function SkeletonKPICard({ className }: { className?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("rounded-xl border bg-card p-6", className)}
    >
      <div className="flex justify-between items-start mb-4">
        <Skeleton variant="text" className="w-24 h-4" delay={0} />
        <Skeleton variant="circular" className="h-10 w-10" delay={1} />
      </div>
      <Skeleton variant="text" className="w-32 h-8 mb-2" delay={2} />
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-12 rounded-full" delay={3} />
        <Skeleton variant="text" className="w-20 h-3" delay={4} />
      </div>
    </motion.div>
  );
}

// Timeline/Activity Skeleton
export function SkeletonTimeline({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("space-y-0", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex gap-4 pb-6 relative"
        >
          <div className="flex flex-col items-center">
            <Skeleton variant="circular" className="h-10 w-10 z-10" delay={i} />
            {i < count - 1 && (
              <div className="w-0.5 h-full bg-muted absolute top-10 left-5" />
            )}
          </div>
          <div className="flex-1 pt-1 space-y-2">
            <Skeleton variant="text" className="w-3/4 h-4" delay={i + 0.5} />
            <Skeleton variant="text" className="w-1/2 h-3" delay={i + 1} />
            <Skeleton variant="text" className="w-20 h-3" delay={i + 1.5} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// User/Profile Card Skeleton
export function SkeletonProfileCard({ className }: { className?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn("rounded-xl border bg-card p-6 text-center space-y-4", className)}
    >
      <Skeleton variant="circular" className="h-20 w-20 mx-auto" delay={0} />
      <div className="space-y-2">
        <Skeleton variant="text" className="w-32 h-5 mx-auto" delay={1} />
        <Skeleton variant="text" className="w-24 h-3 mx-auto" delay={2} />
      </div>
      <div className="flex justify-center gap-4 pt-2">
        <div className="text-center">
          <Skeleton variant="text" className="w-8 h-5 mx-auto" delay={3} />
          <Skeleton variant="text" className="w-12 h-3 mx-auto mt-1" delay={4} />
        </div>
        <div className="text-center">
          <Skeleton variant="text" className="w-8 h-5 mx-auto" delay={3} />
          <Skeleton variant="text" className="w-12 h-3 mx-auto mt-1" delay={4} />
        </div>
      </div>
    </motion.div>
  );
}

// Notification Item Skeleton
export function SkeletonNotification({ className }: { className?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn("flex items-start gap-3 p-3 rounded-lg border", className)}
    >
      <Skeleton variant="circular" className="h-8 w-8 flex-shrink-0" delay={0} />
      <div className="flex-1 space-y-1.5">
        <Skeleton variant="text" className="w-full h-4" delay={1} />
        <Skeleton variant="text" className="w-3/4 h-3" delay={2} />
        <Skeleton variant="text" className="w-16 h-3" delay={3} />
      </div>
    </motion.div>
  );
}

// Search Results Skeleton
export function SkeletonSearchResults({ count = 5, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50"
        >
          <Skeleton className="h-8 w-8 rounded-md" delay={i * 0.5} />
          <div className="flex-1">
            <Skeleton variant="text" className="w-2/3 h-4" delay={i * 0.5 + 0.2} />
            <Skeleton variant="text" className="w-1/3 h-3 mt-1" delay={i * 0.5 + 0.4} />
          </div>
          <Skeleton className="h-6 w-12 rounded-md" delay={i * 0.5 + 0.6} />
        </motion.div>
      ))}
    </div>
  );
}

// Calendar Event Skeleton
export function SkeletonCalendarEvent({ className }: { className?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn("rounded-lg border-l-4 border-l-muted bg-card p-3 space-y-2", className)}
    >
      <Skeleton variant="text" className="w-3/4 h-4" delay={0} />
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded" delay={1} />
        <Skeleton variant="text" className="w-20 h-3" delay={2} />
      </div>
    </motion.div>
  );
}

// Sidebar Navigation Skeleton
export function SkeletonSidebar({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-2 p-4", className)}>
      <Skeleton variant="text" className="w-24 h-3 mb-4" delay={0} />
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-center gap-3 p-2 rounded-lg"
        >
          <Skeleton className="h-5 w-5 rounded" delay={i * 0.2} />
          <Skeleton variant="text" className="w-24 h-4" delay={i * 0.2 + 0.1} />
        </motion.div>
      ))}
      <div className="pt-4 mt-4 border-t">
        <Skeleton variant="text" className="w-20 h-3 mb-3" delay={0} />
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: (i + 6) * 0.05 }}
            className="flex items-center gap-3 p-2 rounded-lg"
          >
            <Skeleton className="h-5 w-5 rounded" delay={(i + 6) * 0.2} />
            <Skeleton variant="text" className="w-20 h-4" delay={(i + 6) * 0.2 + 0.1} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// ORIGINAL SKELETONS (Enhanced)
// ============================================

// Card skeleton
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("rounded-xl border bg-card p-6 space-y-4", className)}
    >
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" className="h-12 w-12" delay={0} />
        <div className="space-y-2 flex-1">
          <Skeleton variant="text" className="w-3/4" delay={1} />
          <Skeleton variant="text" className="w-1/2" delay={2} />
        </div>
      </div>
      <Skeleton className="h-20 w-full" delay={3} />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20" delay={4} />
        <Skeleton className="h-8 w-20" delay={5} />
      </div>
    </motion.div>
  );
}

// List skeleton
export function SkeletonList({
  count = 5,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div 
          key={i} 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-center gap-4 p-3 rounded-lg border"
        >
          <Skeleton variant="circular" className="h-10 w-10" delay={i * 0.5} />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" className="w-2/3" delay={i * 0.5 + 0.2} />
            <Skeleton variant="text" className="w-1/3" delay={i * 0.5 + 0.4} />
          </div>
          <Skeleton className="h-8 w-16" delay={i * 0.5 + 0.6} />
        </motion.div>
      ))}
    </div>
  );
}

// Table skeleton
export function SkeletonTable({
  rows = 5,
  columns = 4,
  className,
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn("rounded-lg border overflow-hidden", className)}
    >
      {/* Header */}
      <div className="bg-muted/50 p-4 flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} variant="text" className="flex-1" delay={i * 0.1} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <motion.div 
          key={rowIndex} 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: rowIndex * 0.05 }}
          className="p-4 flex gap-4 border-t"
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              variant="text"
              className="flex-1"
              delay={rowIndex * 0.1 + colIndex * 0.05}
              style={{ width: `${Math.random() * 40 + 40}%` }}
            />
          ))}
        </motion.div>
      ))}
    </motion.div>
  );
}

// Dashboard skeleton
export function SkeletonDashboard({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="space-y-2">
          <Skeleton variant="text" className="w-48 h-8" delay={0} />
          <Skeleton variant="text" className="w-32" delay={1} />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-10" delay={2} />
          <Skeleton className="h-10 w-24" delay={3} />
        </div>
      </motion.div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonKPICard key={i} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border bg-card p-6"
        >
          <Skeleton variant="text" className="w-40 h-6 mb-4" delay={0} />
          <SkeletonChart type="bar" />
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border bg-card p-6"
        >
          <Skeleton variant="text" className="w-40 h-6 mb-4" delay={0} />
          <SkeletonChart type="line" />
        </motion.div>
      </div>
    </div>
  );
}

// Chart skeleton
export function SkeletonChart({
  type = "bar",
  className,
}: {
  type?: "bar" | "line" | "pie" | "area";
  className?: string;
}) {
  if (type === "pie") {
    return (
      <div className={cn("flex items-center justify-center p-6", className)}>
        <Skeleton variant="circular" className="h-48 w-48" delay={0} />
      </div>
    );
  }

  return (
    <div className={cn("p-6 space-y-4", className)}>
      <div className="flex items-end gap-2 h-48">
        {Array.from({ length: 7 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: i * 0.1, duration: 0.3 }}
            style={{ height: `${Math.random() * 60 + 20}%`, originY: 1 }}
            className="flex-1"
          >
            <Skeleton className="h-full w-full" />
          </motion.div>
        ))}
      </div>
      <div className="flex justify-between">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} variant="text" className="w-8" delay={i * 0.1} />
        ))}
      </div>
    </div>
  );
}

// Form skeleton
export function SkeletonForm({
  fields = 4,
  className,
}: {
  fields?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-6", className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <motion.div 
          key={i} 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="space-y-2"
        >
          <Skeleton variant="text" className="w-24" delay={i * 0.2} />
          <Skeleton className="h-10 w-full" delay={i * 0.2 + 0.1} />
        </motion.div>
      ))}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: fields * 0.1 }}
        className="flex justify-end gap-2 pt-4"
      >
        <Skeleton className="h-10 w-24" delay={fields * 0.2} />
        <Skeleton className="h-10 w-24" delay={fields * 0.2 + 0.1} />
      </motion.div>
    </div>
  );
}

// Avatar group skeleton
export function SkeletonAvatarGroup({
  count = 5,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex -space-x-2", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
        >
          <Skeleton
            variant="circular"
            className="h-8 w-8 border-2 border-background"
          />
        </motion.div>
      ))}
    </div>
  );
}

// Kanban skeleton
export function SkeletonKanban({ columns = 4 }: { columns?: number }) {
  return (
    <div className="flex gap-4 overflow-x-auto p-4">
      {Array.from({ length: columns }).map((_, colIndex) => (
        <motion.div 
          key={colIndex} 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: colIndex * 0.1 }}
          className="flex-shrink-0 w-72 space-y-3"
        >
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <Skeleton variant="text" className="w-24" delay={colIndex * 0.2} />
            <Skeleton variant="circular" className="h-6 w-6" delay={colIndex * 0.2 + 0.1} />
          </div>
          {Array.from({ length: Math.floor(Math.random() * 3) + 2 }).map(
            (_, cardIndex) => (
              <SkeletonJobCard key={cardIndex} />
            )
          )}
        </motion.div>
      ))}
    </div>
  );
}

// Production Lot Skeleton
export function SkeletonProductionLot({ className }: { className?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("rounded-xl border bg-card p-4 space-y-3", className)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-md" delay={0} />
          <div className="space-y-1.5">
            <Skeleton variant="text" className="w-24 h-4" delay={1} />
            <Skeleton variant="text" className="w-16 h-3" delay={2} />
          </div>
        </div>
        <Skeleton className="h-8 w-8 rounded-full" delay={3} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Skeleton variant="text" className="w-16 h-3" delay={4} />
          <Skeleton variant="text" className="w-12 h-4" delay={5} />
        </div>
        <div className="space-y-1">
          <Skeleton variant="text" className="w-16 h-3" delay={4} />
          <Skeleton variant="text" className="w-20 h-4" delay={5} />
        </div>
      </div>
    </motion.div>
  );
}

// Energy Consumption Skeleton
export function SkeletonEnergyCard({ className }: { className?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn("rounded-xl border bg-card p-5 space-y-4", className)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" delay={0} />
          <Skeleton variant="text" className="w-28 h-5" delay={1} />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" delay={2} />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full rounded-full" delay={3} />
        <div className="flex justify-between">
          <Skeleton variant="text" className="w-16 h-3" delay={4} />
          <Skeleton variant="text" className="w-12 h-3" delay={5} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 pt-2 border-t">
        {[0, 1, 2].map(i => (
          <div key={i} className="text-center space-y-1">
            <Skeleton variant="text" className="w-full h-3" delay={6 + i * 0.2} />
            <Skeleton variant="text" className="w-2/3 h-4 mx-auto" delay={6.5 + i * 0.2} />
          </div>
        ))}
      </div>
    </motion.div>
  );
}
