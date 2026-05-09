"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * <Reveal> — scroll-triggered "buttery" reveal for content below the
 * fold. Uses IntersectionObserver to add the `.reveal-up` animation
 * class once the element is in (or near) the viewport.
 *
 * Design choices:
 *
 *   - SSR-safe: the children render normally (opacity 1, no transform)
 *     until JS mounts. No flash for users without JS or before
 *     hydration. Only after mount do we apply the hidden state and
 *     wait for the observer to trigger reveal.
 *
 *   - Above-the-fold safety: if the element is already in the
 *     viewport on mount (which happens after route navigation on a
 *     short page), we reveal immediately on the next frame so the
 *     animation still plays. Otherwise the user would see content
 *     stuck at opacity 0 until they scrolled.
 *
 *   - `delay` lets you cascade multiple reveals in the same section.
 *     Pass a number (ms) — applied as inline animation-delay.
 *
 *   - Honors prefers-reduced-motion via the existing media query in
 *     globals.css (`.reveal-up` is neutralized there).
 */
export function Reveal({
  children,
  delay = 0,
  rootMargin = "-8% 0px",
  className,
  as: Tag = "div"
}: {
  children: ReactNode;
  /** Stagger delay in ms. */
  delay?: number;
  /** IntersectionObserver rootMargin. Default reveals slightly before scroll-into-view. */
  rootMargin?: string;
  className?: string;
  as?: "div" | "section" | "article" | "header" | "aside" | "li";
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Mount flag — until this runs, we render at full opacity (SSR-safe).
  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const el = ref.current;
    if (!el) return;

    // If the element is already in (or above) the viewport, reveal
    // on the next frame so the keyframe transition still plays.
    const rect = el.getBoundingClientRect();
    const inOrAboveViewport = rect.top < window.innerHeight;
    if (inOrAboveViewport) {
      const id = requestAnimationFrame(() => setRevealed(true));
      return () => cancelAnimationFrame(id);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin, threshold: 0.01 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hydrated, rootMargin]);

  // Before hydration: render plain (no animation) so SSR / no-JS
  // visitors see the content. After hydration but before reveal, hide
  // it so the keyframe entrance can play. After reveal, apply the
  // animation class.
  const style: CSSProperties = {};
  if (hydrated && !revealed) {
    style.opacity = 0;
    // Pre-pose to match the keyframe-from in globals.css so the
    // animation starts cleanly with no visible jump.
    style.transform = "translateY(36px) scale(0.985)";
    style.filter = "blur(2px)";
  } else if (revealed && delay > 0) {
    style.animationDelay = `${delay}ms`;
  }

  return (
    <Tag
      ref={ref as never}
      className={cn(revealed && "reveal-up", className)}
      style={style}
    >
      {children}
    </Tag>
  );
}
