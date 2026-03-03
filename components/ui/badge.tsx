import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "default" | "success" | "warn" | "danger" | "brand";

const toneClasses: Record<Tone, string> = {
  default: "bg-soft text-muted border-borderc",
  success: "bg-success/15 text-success border-success/30",
  warn: "bg-warn/15 text-warn border-warn/30",
  danger: "bg-danger/15 text-danger border-danger/30",
  brand: "bg-brand-2/15 text-brand-2 border-brand-2/30"
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ className, children, tone = "default", ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium tracking-wide",
        toneClasses[tone],
        className
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
