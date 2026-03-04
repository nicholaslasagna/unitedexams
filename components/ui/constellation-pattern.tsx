import { cn } from "@/lib/utils";

interface ConstellationPatternProps {
  className?: string;
  /** Opacity 0-1, default 0.04 */
  opacity?: number;
  /** Density variant */
  variant?: "sparse" | "default" | "dense";
}

const patterns = {
  sparse: (
    <>
      {/* Dots */}
      <circle cx="30" cy="40" r="1.5" fill="currentColor" />
      <circle cx="120" cy="20" r="1" fill="currentColor" />
      <circle cx="180" cy="80" r="1.5" fill="currentColor" />
      <circle cx="80" cy="160" r="1" fill="currentColor" />
      {/* Lines */}
      <line x1="30" y1="40" x2="120" y2="20" stroke="currentColor" strokeWidth="0.4" strokeDasharray="4 8" />
      <line x1="120" y1="20" x2="180" y2="80" stroke="currentColor" strokeWidth="0.4" strokeDasharray="4 8" />
    </>
  ),
  default: (
    <>
      {/* Dots */}
      <circle cx="20" cy="30" r="1.5" fill="currentColor" />
      <circle cx="80" cy="15" r="1" fill="currentColor" />
      <circle cx="140" cy="60" r="1.5" fill="currentColor" />
      <circle cx="60" cy="120" r="1" fill="currentColor" />
      <circle cx="170" cy="140" r="1.5" fill="currentColor" />
      <circle cx="100" cy="180" r="1" fill="currentColor" />
      {/* Lines */}
      <line x1="20" y1="30" x2="80" y2="15" stroke="currentColor" strokeWidth="0.4" strokeDasharray="4 6" />
      <line x1="80" y1="15" x2="140" y2="60" stroke="currentColor" strokeWidth="0.4" strokeDasharray="4 6" />
      <line x1="60" y1="120" x2="170" y2="140" stroke="currentColor" strokeWidth="0.4" strokeDasharray="4 6" />
      <line x1="100" y1="180" x2="140" y2="60" stroke="currentColor" strokeWidth="0.4" strokeDasharray="4 8" />
    </>
  ),
  dense: (
    <>
      {/* Dots */}
      <circle cx="15" cy="20" r="1.5" fill="currentColor" />
      <circle cx="70" cy="10" r="1" fill="currentColor" />
      <circle cx="130" cy="45" r="1.5" fill="currentColor" />
      <circle cx="40" cy="90" r="1" fill="currentColor" />
      <circle cx="160" cy="110" r="1.5" fill="currentColor" />
      <circle cx="90" cy="150" r="1" fill="currentColor" />
      <circle cx="180" cy="30" r="1" fill="currentColor" />
      <circle cx="110" cy="80" r="1.5" fill="currentColor" />
      <circle cx="50" cy="170" r="1" fill="currentColor" />
      {/* Lines */}
      <line x1="15" y1="20" x2="70" y2="10" stroke="currentColor" strokeWidth="0.3" strokeDasharray="3 6" />
      <line x1="70" y1="10" x2="130" y2="45" stroke="currentColor" strokeWidth="0.3" strokeDasharray="3 6" />
      <line x1="130" y1="45" x2="180" y2="30" stroke="currentColor" strokeWidth="0.3" strokeDasharray="3 6" />
      <line x1="40" y1="90" x2="110" y2="80" stroke="currentColor" strokeWidth="0.3" strokeDasharray="3 6" />
      <line x1="110" y1="80" x2="160" y2="110" stroke="currentColor" strokeWidth="0.3" strokeDasharray="3 6" />
      <line x1="90" y1="150" x2="50" y2="170" stroke="currentColor" strokeWidth="0.3" strokeDasharray="3 6" />
      <line x1="40" y1="90" x2="90" y2="150" stroke="currentColor" strokeWidth="0.3" strokeDasharray="3 8" />
    </>
  )
};

export function ConstellationPattern({
  className,
  opacity = 0.04,
  variant = "default"
}: ConstellationPatternProps) {
  const patternId = `constellation-${variant}`;

  return (
    <svg
      className={cn("pointer-events-none absolute inset-0 h-full w-full text-muted", className)}
      aria-hidden="true"
      style={{ opacity }}
    >
      <defs>
        <pattern
          id={patternId}
          width="200"
          height="200"
          patternUnits="userSpaceOnUse"
        >
          {patterns[variant]}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}
