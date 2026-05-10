"use client";

import Link from "next/link";
import { useAppData } from "@/lib/app-data-context";

/**
 * The single confident hero CTA — a passport-stamp-style outlined
 * accent button with a long arrow that grows on hover. Adapts to the
 * visitor's auth state:
 *
 *   loading        → Browse courses (safe default while session resolves)
 *   guest          → Start studying  →  /signup
 *   authenticated  → Open dashboard  →  /app/dashboard
 *
 * Pairs with the ghost "Browse the library" button next to it. The
 * single confident CTA + one secondary link is the design's whole
 * point — replacing the previous stack of three different action
 * buttons with one decisive next step.
 */
export function HeroStampCta() {
  const { authReady, isAuthenticated } = useAppData();

  let label: string;
  let href: string;
  if (!authReady) {
    label = "Start studying";
    href = "/courses";
  } else if (isAuthenticated) {
    label = "Open dashboard";
    href = "/app/dashboard";
  } else {
    label = "Start studying";
    href = "/signup";
  }

  return (
    <div className="flex flex-wrap items-center gap-5">
      <Link href={href} className="stamp-btn" aria-label={label}>
        <span>{label}</span>
        <span className="stamp-arrow" aria-hidden>
          →
        </span>
      </Link>
      <Link href="/courses" className="ghost-btn">
        Browse the library
      </Link>
    </div>
  );
}
