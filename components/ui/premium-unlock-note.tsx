import Link from "next/link";
import type { ReactNode } from "react";
import { Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Tasteful "Included with Premium" surface. Render this only after the
 * AccessContext has decided a soft lock is appropriate. Never use this
 * for institution-covered users — `lib/access.ts` already filters them
 * out by setting `messaging.hidePremiumPrompts = true`.
 *
 * Microcopy rules (per product brief):
 *   - say "Included with Premium" not "Locked"
 *   - say "Available in full access" not "Subscribe to unlock"
 *   - never use urgency language
 */
export function PremiumUnlockNote({
  title = "Included with Premium",
  description,
  bullets,
  ctaHref = "/contact?intent=premium",
  ctaLabel = "Learn about Premium",
  trailing,
  variant = "block",
  className
}: {
  title?: string;
  description?: ReactNode;
  bullets?: string[];
  ctaHref?: string;
  ctaLabel?: string;
  trailing?: ReactNode;
  variant?: "inline" | "block";
  className?: string;
}) {
  if (variant === "inline") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-accent",
          className
        )}
      >
        <Crown className="h-3 w-3" />
        {title}
      </span>
    );
  }

  return (
    <div
      className={cn(
        "rounded-[1.1rem] border border-dashed border-borderc bg-surface/70 px-4 py-3.5",
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-accent">
          <Sparkles className="h-3 w-3" />
          {title}
        </span>
        <span className="text-[11px] text-text-secondary">
          Your class may already include this.
        </span>
      </div>

      {description ? (
        <p className="mt-2.5 text-[13px] leading-relaxed text-text-secondary">{description}</p>
      ) : null}

      {bullets && bullets.length > 0 ? (
        <ul className="mt-3 space-y-1.5">
          {bullets.map((bullet) => (
            <li
              key={bullet}
              className="flex items-start gap-2 text-[12.5px] text-text-secondary"
            >
              <span className="mt-[7px] inline-block h-1 w-1 rounded-full bg-accent" />
              {bullet}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {trailing ?? (
          <Button asChild variant="ghost" size="sm">
            <Link href={ctaHref}>{ctaLabel}</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
