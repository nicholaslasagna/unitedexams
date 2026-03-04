import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "default" | "success" | "warn" | "danger" | "brand" | "accent";
type BadgeSize = "sm" | "md";

const toneClasses: Record<Tone, string> = {
  default: "bg-soft text-muted border-borderc",
  success: "bg-success/15 text-success border-success/30",
  warn: "bg-warn/15 text-warn border-warn/30",
  danger: "bg-danger/15 text-danger border-danger/30",
  brand: "bg-brand-2/15 text-brand-2 border-brand-2/30",
  accent: "bg-accent-subtle text-accent border-accent/30"
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-2.5 py-1 text-xs"
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  size?: BadgeSize;
}

export function Badge({ className, children, tone = "default", size = "md", ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium tracking-wide",
        sizeClasses[size],
        toneClasses[tone],
        className
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
