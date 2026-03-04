import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  /** Stagger delay index (0-8) for wave effect */
  stagger?: number;
}

export function Skeleton({ className, stagger }: SkeletonProps) {
  return (
    <div
      className={cn(
        "skeleton rounded-xl",
        stagger !== undefined && `stagger-${stagger}`,
        className
      )}
      aria-hidden
    />
  );
}

/** Pre-composed skeleton shapes for common patterns */
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          stagger={i}
          className={cn(
            "h-3.5",
            i === lines - 1 ? "w-3/5" : "w-full"
          )}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-borderc bg-surface p-5 space-y-4", className)}>
      <Skeleton className="h-5 w-2/5" stagger={0} />
      <SkeletonText lines={2} />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-24 rounded-lg" stagger={3} />
        <Skeleton className="h-8 w-20 rounded-lg" stagger={4} />
      </div>
    </div>
  );
}
