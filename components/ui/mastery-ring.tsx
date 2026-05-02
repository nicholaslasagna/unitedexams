import { useId } from "react";
import { cn } from "@/lib/utils";

export function MasteryRing({
  value,
  size = 140,
  stroke = 12,
  label,
  caption,
  tone = "brand",
  className
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
  caption?: string;
  tone?: "brand" | "success" | "warn" | "danger";
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const dash = circ - (pct / 100) * circ;
  const gradientId = useId();

  const stops: Record<string, [string, string]> = {
    brand: ["hsl(var(--brand-1))", "hsl(var(--brand-3))"],
    success: ["hsl(var(--success))", "hsl(160 67% 60%)"],
    warn: ["hsl(var(--warn))", "hsl(38 96% 64%)"],
    danger: ["hsl(var(--danger))", "hsl(351 90% 75%)"]
  };

  const [from, to] = stops[tone];

  return (
    <div className={cn("readiness-ring", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="relative -rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--border))"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circ}
          strokeDashoffset={dash}
          className="transition-[stroke-dashoffset] duration-[900ms] ease-out-expo"
        />
        <defs>
          <linearGradient id={gradientId} x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-mono text-3xl font-bold leading-none text-text">{Math.round(pct)}%</span>
        {label ? (
          <span className="mt-1 text-[10.5px] font-bold uppercase tracking-[0.18em] text-text-secondary">
            {label}
          </span>
        ) : null}
        {caption ? (
          <span className="mt-1 text-[11.5px] text-text-secondary">{caption}</span>
        ) : null}
      </div>
    </div>
  );
}
