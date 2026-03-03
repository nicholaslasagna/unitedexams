import { cn } from "@/lib/utils";

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("h-2.5 w-full overflow-hidden rounded-full bg-soft", className)} aria-hidden>
      <div
        className="h-full rounded-full bg-brand-gradient transition-all duration-700"
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

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={stroke} className="text-soft" fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#ringGradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circ}
          strokeDashoffset={dash}
          className="transition-all duration-700"
        />
        <defs>
          <linearGradient id="ringGradient" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--brand-1))" />
            <stop offset="100%" stopColor="hsl(var(--brand-3))" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <div className="font-mono text-2xl font-bold text-text">{Math.round(pct)}%</div>
        {label ? <div className="text-xs text-muted">{label}</div> : null}
      </div>
    </div>
  );
}
