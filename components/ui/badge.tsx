import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "default" | "success" | "warn" | "danger" | "brand" | "accent" | "info";
type BadgeSize = "sm" | "md";

const toneClasses: Record<Tone, string> = {
  default: "bg-soft text-muted border-borderc",
  success: "bg-success/12 text-success border-success/25",
  warn: "bg-warn/12 text-warn border-warn/25",
  danger: "bg-danger/12 text-danger border-danger/25",
  brand: "bg-brand-2/12 text-brand-2 border-brand-2/25",
  accent: "bg-accent-subtle text-accent border-accent/25",
  info: "bg-info/12 text-info border-info/25"
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
        "inline-flex items-center rounded-full border font-medium tracking-wide transition-colors duration-150",
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
