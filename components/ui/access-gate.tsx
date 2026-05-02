"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { LogIn, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PremiumUnlockNote } from "@/components/ui/premium-unlock-note";
import { resolveLock, type AccessContext } from "@/lib/access";
import { cn } from "@/lib/utils";

/**
 * AccessGate — wraps a feature with the centralized access decision.
 *
 * Pass the `ctx` (from useAccess()), declare what the feature `requires`,
 * and `<AccessGate>` will render the right UI:
 *   - "open" → renders children
 *   - "soft" → renders children with a quiet upgrade/sign-in note above
 *   - "hard" → replaces children with a placeholder explaining why
 *
 * Microcopy is taken straight from the access copy guidelines:
 *   - "Create an account to save your progress" (guests)
 *   - "Included with Premium" (free students)
 *   - "Included through your institution" (covered users — gate hides itself)
 *
 * Pass `mode="hide"` to silently render nothing instead of children when
 * locked. Useful when the surrounding section already explains the lock.
 */
export function AccessGate({
  ctx,
  requires,
  children,
  mode = "render",
  guestPrompt,
  premiumPrompt,
  className
}: {
  ctx: AccessContext;
  requires: { auth?: boolean; premiumOrInstitution?: boolean };
  children: ReactNode;
  /** "render" keeps the children visible behind a soft note; "hide" replaces them. */
  mode?: "render" | "hide";
  guestPrompt?: { title?: string; description?: string };
  premiumPrompt?: { title?: string; description?: string; bullets?: string[] };
  className?: string;
}) {
  const lock = resolveLock(ctx, requires);

  if (lock === "open") return <>{children}</>;

  // Pick the appropriate microcopy based on which gate is closed.
  const isGuestLock = ctx.isGuest && requires.auth;
  const isPremiumLock = !isGuestLock && !ctx.isPremium && !ctx.isInstitutionCovered;

  const note = isGuestLock ? (
    <GuestSavePrompt
      title={guestPrompt?.title}
      description={guestPrompt?.description}
      className={className}
    />
  ) : isPremiumLock ? (
    <PremiumUnlockNote
      title={premiumPrompt?.title ?? "Included with Premium"}
      description={
        premiumPrompt?.description ??
        "Create or upgrade an account to use this in full. If your school covers access, you'll never see this prompt."
      }
      bullets={premiumPrompt?.bullets}
      className={className}
    />
  ) : null;

  if (mode === "hide") return note;

  // Soft lock — render children unobstructed with the note alongside.
  return (
    <div className="space-y-3">
      {note}
      {children}
    </div>
  );
}

function GuestSavePrompt({
  title = "Create an account to save your progress",
  description = "Your attempts, mastery, and streaks will sync to your account once you sign in.",
  className
}: {
  title?: string;
  description?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-[1.1rem] border border-dashed border-borderc bg-surface/70 px-4 py-3",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-accent/25 bg-accent/10 text-accent">
          <ShieldCheck className="h-4 w-4" />
        </span>
        <div>
          <p className="text-[13.5px] font-semibold text-text">{title}</p>
          <p className="mt-0.5 text-[12px] leading-relaxed text-text-secondary">{description}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm">
          <Link href="/signup">Create account</Link>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link href="/login">
            <LogIn className="h-3.5 w-3.5" />
            Sign in
          </Link>
        </Button>
      </div>
    </div>
  );
}
