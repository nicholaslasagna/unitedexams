import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className
}: {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.5rem] border border-dashed border-borderc bg-surface/70 px-6 py-12 text-center",
        className
      )}
    >
      <div className="absolute inset-0 -z-10 opacity-[0.45]">
        <div className="absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,hsl(var(--accent)/0.18),transparent_70%)] blur-2xl" />
      </div>

      {icon ? (
        <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-borderc bg-surface text-accent shadow-soft">
          {icon}
        </div>
      ) : null}

      <p className="mx-auto max-w-md font-display text-xl font-semibold leading-tight text-text">
        {title}
      </p>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-text-secondary">
          {description}
        </p>
      ) : null}

      {action ? (
        <div className="mt-5 flex flex-wrap justify-center gap-2">{action}</div>
      ) : null}
    </div>
  );
}
