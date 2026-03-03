interface DonutChartProps {
  value: number;
  size?: number;
  stroke?: number;
}

export function DonutChart({ value, size = 180, stroke = 18 }: DonutChartProps) {
  const pct = Math.max(0, Math.min(100, value));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--soft))" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#donutGradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
        <defs>
          <linearGradient id="donutGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(var(--brand-1))" />
            <stop offset="100%" stopColor="hsl(var(--brand-3))" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <p className="font-mono text-3xl font-bold text-text">{Math.round(pct)}%</p>
        <p className="text-xs text-muted">Mastery</p>
      </div>
    </div>
  );
}
