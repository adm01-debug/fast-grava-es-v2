import * as React from "react";
import { cn } from "@/lib/utils";

// Base skeleton component
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "text" | "circular" | "rectangular";
  animation?: "pulse" | "wave" | "none";
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className,
  variant = "default",
  animation = "pulse",
  width,
  height,
  style,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "bg-muted",
        {
          "animate-pulse": animation === "pulse",
          "animate-shimmer bg-gradient-to-r from-muted via-muted-foreground/10 to-muted bg-[length:200%_100%]":
            animation === "wave",
          "rounded-md": variant === "default",
          "rounded-sm h-4": variant === "text",
          "rounded-full aspect-square": variant === "circular",
          "rounded-lg": variant === "rectangular",
        },
        className
      )}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
        ...style,
      }}
      {...props}
    />
  );
}

// Card skeleton
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border bg-card p-6 space-y-4", className)}>
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" className="h-12 w-12" />
        <div className="space-y-2 flex-1">
          <Skeleton variant="text" className="w-3/4" />
          <Skeleton variant="text" className="w-1/2" />
        </div>
      </div>
      <Skeleton className="h-20 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
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
        <div key={i} className="flex items-center gap-4 p-3 rounded-lg border">
          <Skeleton variant="circular" className="h-10 w-10" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" className="w-2/3" />
            <Skeleton variant="text" className="w-1/3" />
          </div>
          <Skeleton className="h-8 w-16" />
        </div>
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
    <div className={cn("rounded-lg border overflow-hidden", className)}>
      {/* Header */}
      <div className="bg-muted/50 p-4 flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} variant="text" className="flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="p-4 flex gap-4 border-t">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              variant="text"
              className="flex-1"
              style={{ width: `${Math.random() * 40 + 40}%` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// Dashboard skeleton
export function SkeletonDashboard({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton variant="text" className="w-48 h-8" />
          <Skeleton variant="text" className="w-32" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-6">
            <div className="flex justify-between items-start mb-4">
              <Skeleton variant="text" className="w-20" />
              <Skeleton variant="circular" className="h-8 w-8" />
            </div>
            <Skeleton variant="text" className="w-24 h-8 mb-2" />
            <Skeleton variant="text" className="w-16" />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-card p-6">
          <Skeleton variant="text" className="w-40 h-6 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="rounded-xl border bg-card p-6">
          <Skeleton variant="text" className="w-40 h-6 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
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
        <Skeleton variant="circular" className="h-48 w-48" />
      </div>
    );
  }

  return (
    <div className={cn("p-6 space-y-4", className)}>
      <div className="flex items-end gap-2 h-48">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1"
            style={{ height: `${Math.random() * 60 + 20}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} variant="text" className="w-8" />
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
        <div key={i} className="space-y-2">
          <Skeleton variant="text" className="w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex justify-end gap-2 pt-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
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
        <Skeleton
          key={i}
          variant="circular"
          className="h-8 w-8 border-2 border-background"
        />
      ))}
    </div>
  );
}

// Kanban skeleton
export function SkeletonKanban({ columns = 4 }: { columns?: number }) {
  return (
    <div className="flex gap-4 overflow-x-auto p-4">
      {Array.from({ length: columns }).map((_, colIndex) => (
        <div key={colIndex} className="flex-shrink-0 w-72 space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <Skeleton variant="text" className="w-24" />
            <Skeleton variant="circular" className="h-6 w-6" />
          </div>
          {Array.from({ length: Math.floor(Math.random() * 3) + 2 }).map(
            (_, cardIndex) => (
              <SkeletonCard key={cardIndex} className="p-4" />
            )
          )}
        </div>
      ))}
    </div>
  );
}
