import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * AuthShell — single centered auth card on a flowing colorful gradient.
 *
 * Modeled on the Stripe sign-in page: a clean white-paper card with
 * the brand wordmark fixed in the top-left of the viewport and a soft,
 * slow-drifting aurora behind it. No two-column hero, no marketing
 * copy crowding the form — the only job here is to get the user
 * into the form fast.
 *
 * Used by /login, /signup, /forgot-password, /reset-password,
 * /auth/approve-login, /auth/callback, /auth/approval-required.
 *
 * Props:
 *   - title:     Headline above the form ("Sign in to your account").
 *   - subtitle:  Optional one-liner under the headline.
 *   - children:  The form itself.
 *   - footer:    Bottom-of-card link row ("New to UE? Create account").
 *   - wide:      `true` for the signup card which has more fields.
 *   - className: extra classes for the card (rare).
 *
 * The shell also accepts a handful of legacy hero-related props
 * (`eyebrow`, `heroTitle`, `heroDescription`, `heroStats`, `heroAside`,
 * `heroFooter`) so the older consumers compile without changes. They
 * are ignored — the new shell does not render a hero column.
 *
 * The aurora background and brand wordmark are styled in globals.css
 * under the "Auth Aurora" block.
 */

interface AuthShellProps {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
  className?: string;
  /* Legacy props — accepted for backward compatibility, not rendered. */
  eyebrow?: string;
  heroTitle?: ReactNode;
  heroDescription?: string;
  heroStats?: Array<{ label: string; value: string; detail?: string }>;
  heroAside?: ReactNode;
  heroFooter?: ReactNode;
}

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
  wide = false,
  className
}: AuthShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-bg text-text">
      {/* Flowing colorful gradient background */}
      <div className="auth-aurora" aria-hidden />

      {/* Brand wordmark — fixed top-left, links home, like Stripe */}
      <Link href="/" className="auth-wordmark" aria-label="United Exams home">
        United <em>Exams</em>
      </Link>

      {/* Centered card */}
      <main
        id="main"
        className="relative z-[1] flex min-h-screen items-center justify-center px-4 py-20 sm:py-16"
      >
        <div
          className={cn(
            "auth-card",
            wide && "is-wide",
            className
          )}
        >
          <header className="space-y-2 text-center sm:text-left">
            <h1 className="font-display text-[1.6rem] font-semibold leading-tight tracking-tight text-text sm:text-[1.85rem]">
              {title}
            </h1>
            {subtitle ? (
              <p className="text-[14px] leading-relaxed text-text-secondary">
                {subtitle}
              </p>
            ) : null}
          </header>

          <div className="mt-6 space-y-4">{children}</div>

          {footer ? (
            <footer className="mt-6 border-t border-borderc pt-4 text-center text-[13px] text-text-secondary">
              {footer}
            </footer>
          ) : null}
        </div>
      </main>
    </div>
  );
}
