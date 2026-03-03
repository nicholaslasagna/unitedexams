interface SparklineProps {
  values: number[];
  width?: number;
  height?: number;
}

export function Sparkline({ values, width = 180, height = 44 }: SparklineProps) {
  if (values.length === 0) return null;

  const max = Math.max(...values, 1);
  const step = width / (values.length - 1 || 1);
  const points = values
    .map((value, idx) => {
      const x = idx * step;
      const y = height - (value / max) * (height - 6) - 3;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} aria-hidden>
      <polyline points={points} fill="none" stroke="hsl(var(--brand-2))" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
