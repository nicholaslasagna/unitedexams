interface DataPoint {
  label: string;
  value: number;
}

export function BarChart({ data }: { data: DataPoint[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-muted">No topic data yet.</p>;
  }

  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.label}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-muted">{item.label}</span>
            <span className="font-mono text-text">{item.value}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-soft">
            <div className="h-full rounded-full bg-brand-gradient transition-all duration-700" style={{ width: `${Math.max(4, item.value)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
