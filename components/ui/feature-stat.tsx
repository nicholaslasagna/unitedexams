import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function FeatureStat({
  label,
  value,
  hint,
  icon,
  tone = "default",
  className
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  tone?: "default" | "accent" | "success" | "warn";
  className?: string;
}) {
  const toneRing: Record<string, string> = {
    default: "border-borderc",
    accent: "border-accent/40",
    success: "border-success/35",
    warn: "border-warn/35"
  };

  return (
    <div
      className={cn(
        "rounded-[1.15rem] border bg-surface/80 p-3 transition-all sm:p-4 duration-200 ease-out-expo hover:border-border-accent hover:shadow-card-hover",
        toneRing[tone],
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[9.5px] font-bold uppercase leading-tight tracking-[0.14em] text-text-secondary sm:text-[10.5px] sm:tracking-[0.18em]">
          {label}
        </p>
        {icon ? <span className="text-accent/80">{icon}</span> : null}
      </div>
      <p className="mt-2 font-mono text-[1.25rem] font-bold leading-none text-text sm:text-[1.55rem]">
        {value}
      </p>
      {hint ? (
        <p className="mt-1.5 text-[11.5px] leading-snug text-text-secondary">{hint}</p>
      ) : null}
    </div>
  );
}
