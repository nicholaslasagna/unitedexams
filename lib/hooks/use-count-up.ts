"use client";

import { useEffect, useState } from "react";

interface UseCountUpOptions {
  /** Target value */
  end: number;
  /** Start value (default 0) */
  start?: number;
  /** Duration in ms (default 600) */
  duration?: number;
  /** Whether to trigger the animation */
  enabled?: boolean;
  /** Decimal places (default 0) */
  decimals?: number;
}

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export function useCountUp({
  end,
  start = 0,
  duration = 600,
  enabled = true,
  decimals = 0
}: UseCountUpOptions): number {
  const [value, setValue] = useState(start);

  useEffect(() => {
    if (!enabled) {
      setValue(start);
      return;
    }

    let raf: number;
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);
      const currentValue = start + (end - start) * easedProgress;

      setValue(Number(currentValue.toFixed(decimals)));

      if (progress < 1) {
        raf = requestAnimationFrame(animate);
      }
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [end, start, duration, enabled, decimals]);

  return value;
}
