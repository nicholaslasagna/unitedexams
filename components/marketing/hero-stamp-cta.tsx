"use client";

import Link from "next/link";
import { useAppData } from "@/lib/app-data-context";

/**
 * The single confident hero CTA.
 *
 * A first-time visitor used to press "Start studying" and land on a signup
 * form. The label promised the product and delivered a registration wall —
 * on a site whose own quizzes work perfectly well without an account, and
 * whose hero line underneath says there is nothing to pay. That is the least
 * welcoming thing the homepage did, so the primary action now opens a real
 * quiz and signing up is offered later, once there is a score worth keeping.
 *
 *   loading        → Browse classes (safe default while the session resolves)
 *   guest          → Try a quiz, free, straight into a short set
 *   authenticated  → Open dashboard
 */
export function HeroStampCta({ sampleQuizHref }: { sampleQuizHref: string }) {
  const { authReady, isAuthenticated } = useAppData();

  let label: string;
  let href: string;
  let secondaryLabel = "Browse all classes";
  if (!authReady) {
    label = "Browse classes";
    href = "/courses";
    secondaryLabel = "Browse all classes";
  } else if (isAuthenticated) {
    label = "Open dashboard";
    href = "/app/dashboard";
    secondaryLabel = "Browse all classes";
  } else {
    label = "Try a quiz, free";
    href = sampleQuizHref;
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
        {secondaryLabel}
      </Link>
    </div>
  );
}
