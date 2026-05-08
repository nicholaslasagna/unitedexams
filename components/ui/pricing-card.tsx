import type { ReactNode } from "react";
import { Check, Crown, Building2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Tier = "free" | "premium" | "institution";

const tierIcon: Record<Tier, ReactNode> = {
  free: <Sparkles className="h-4 w-4" />,
  premium: <Crown className="h-4 w-4" />,
  institution: <Building2 className="h-4 w-4" />
};

export function PricingCard({
  tier,
  name,
  tagline,
  price,
  cadence,
  features,
  cta,
  highlighted = false,
  footnote,
  className
}: {
  tier: Tier;
  name: string;
  tagline: string;
  price: string;
  cadence?: string;
  features: string[];
  cta: ReactNode;
  highlighted?: boolean;
  footnote?: string;
  className?: string;
}) {
  /*
   * Pricing cards used to use a glowing gradient border + glow shadow
   * for the "Recommended" tier — that combo (glow + ribbon + accent
   * tier icon) is the AI-marketing-template fingerprint. Now we mark
   * the recommended tier with a slightly stronger border and a quiet
   * top label. The pricing itself carries the weight.
   */
  return (
    <div
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-[1.4rem] border bg-surface p-6 shadow-subtle",
        highlighted ? "border-accent/45" : "border-borderc",
        className
      )}
    >
      {highlighted ? (
        <p className="mb-3 inline-flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.18em] text-accent">
          <span className="inline-block h-1 w-1 rounded-full bg-accent" />
          Recommended
        </p>
      ) : null}

      <div className="flex items-center gap-2">
        <span
          className={cn(
            "inline-flex h-9 w-9 items-center justify-center rounded-2xl border",
            tier === "premium"
              ? "border-accent/30 bg-accent/12 text-accent"
              : tier === "institution"
                ? "border-success/30 bg-success/12 text-success"
                : "border-borderc bg-soft text-text-secondary"
          )}
        >
          {tierIcon[tier]}
        </span>
        <p className="font-display text-lg font-semibold text-text">{name}</p>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-text-secondary">{tagline}</p>

      <div className="mt-5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="font-display text-4xl font-semibold leading-none text-text">{price}</span>
        {cadence ? (
          <span className="text-sm leading-tight text-text-secondary">{cadence}</span>
        ) : null}
      </div>

      <ul className="mt-5 space-y-2.5">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm text-text">
            <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
              <Check className="h-3 w-3" />
            </span>
            <span className="leading-snug text-text-secondary">{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-col gap-2">{cta}</div>
      {footnote ? (
        <p className="mt-3 text-[11.5px] text-text-secondary">{footnote}</p>
      ) : null}
    </div>
  );
}
