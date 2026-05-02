import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import { AccessBadge } from "./access-badge";
import { cn } from "@/lib/utils";

type Variant = "premium" | "institution";

export function LockCard({
  variant = "premium",
  title,
  description,
  action,
  bullets,
  className
}: {
  variant?: Variant;
  title: string;
  description?: string;
  action?: ReactNode;
  bullets?: string[];
  className?: string;
}) {
  return (
    <div className={cn("lock-card", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <AccessBadge variant={variant === "institution" ? "institution" : "premium"} />
        <span className="inline-flex items-center gap-1.5 rounded-full border border-borderc bg-surface/70 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.16em] text-text-secondary">
          <Lock className="h-3 w-3" />
          Soft lock
        </span>
      </div>
      <p className="mt-3 font-display text-lg font-semibold text-text">{title}</p>
      {description ? (
        <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">{description}</p>
      ) : null}
      {bullets && bullets.length > 0 ? (
        <ul className="mt-3 space-y-1.5">
          {bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-2 text-xs text-text-secondary">
              <span className="mt-[6px] inline-block h-1 w-1 rounded-full bg-accent" />
              {bullet}
            </li>
          ))}
        </ul>
      ) : null}
      {action ? <div className="mt-4 flex flex-wrap gap-2">{action}</div> : null}
    </div>
  );
}
