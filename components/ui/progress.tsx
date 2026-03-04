import { useId } from "react";
import { cn } from "@/lib/utils";

export function ProgressBar({
  value,
  className,
  glow = false
}: {
  value: number;
  className?: string;
  glow?: boolean;
}) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn("h-[5px] w-full overflow-hidden rounded-full bg-borderc", className)}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn(
          "h-full rounded-full bg-brand-gradient transition-[width] duration-[400ms] ease-out-expo",
          glow && pct === 100 && "shadow-[0_0_14px_hsl(var(--accent)/0.4)]"
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function ProgressRing({
  value,
  size = 120,
  stroke = 10,
  label
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const dash = circ - (pct / 100) * circ;
  const gradientId = useId();

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      role="meter"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ? `${label}: ${Math.round(pct)}%` : `${Math.round(pct)}%`}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-borderc"
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
          className="transition-[stroke-dashoffset] duration-[800ms] ease-out-expo"
          style={
            {
              "--circumference": circ,
              "--target-offset": dash
            } as React.CSSProperties
          }
        />
        <defs>
          <linearGradient id={gradientId} x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--brand-1))" />
            <stop offset="100%" stopColor="hsl(var(--brand-2))" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <div className="font-mono text-2xl font-bold text-text">{Math.round(pct)}%</div>
        {label ? (
          <div className="text-caption uppercase tracking-[1.5px] text-faint">{label}</div>
        ) : null}
      </div>
    </div>
  );
}
