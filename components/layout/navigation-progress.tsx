"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * Thin progress bar at the top of the viewport during client-side navigations.
 * Activates when an internal <a> is clicked and the route hasn't resolved yet.
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevPathRef = useRef(pathname);

  // Navigation completed — fill bar and fade out
  useEffect(() => {
    if (pathname === prevPathRef.current) return;
    prevPathRef.current = pathname;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setProgress(100);
    const t = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 350);
    return () => clearTimeout(t);
  }, [pathname]);

  // Listen for internal link clicks → start progress
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("#") || href === pathname) return;
      // Check it's a real navigation (not target=_blank, not modified-click)
      if (anchor.target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey) return;

      setProgress(15);
      setVisible(true);
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setProgress((p) => {
          if (p >= 90) return p;
          return p + (90 - p) * 0.1;
        });
      }, 200);
    }

    document.addEventListener("click", handleClick, { capture: true });
    return () => document.removeEventListener("click", handleClick, { capture: true });
  }, [pathname]);

  if (!visible && progress === 0) return null;

  return (
    <div
      className="fixed left-0 right-0 top-0 z-[999] h-[2px] pointer-events-none"
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Page loading"
    >
      <div
        className="h-full bg-accent shadow-[0_0_8px_hsl(var(--accent)/0.5)] transition-[width,opacity] ease-out-expo"
        style={{
          width: `${progress}%`,
          transitionDuration: progress === 100 ? "200ms" : "400ms",
          opacity: progress === 100 ? 0 : 1
        }}
      />
    </div>
  );
}
