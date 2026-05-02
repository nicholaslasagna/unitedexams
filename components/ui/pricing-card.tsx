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
  return (
    <div
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-[1.4rem] border border-borderc bg-surface p-6 shadow-subtle",
        highlighted && "pricing-popular shadow-glow",
        className
      )}
    >
      {highlighted ? (
        <span className="ribbon absolute right-5 top-5">
          <Crown className="h-3 w-3" />
          Recommended
        </span>
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

      <div className="mt-5 flex items-end gap-1.5">
        <span className="font-display text-4xl font-semibold leading-none text-text">{price}</span>
        {cadence ? (
          <span className="pb-1 text-sm text-text-secondary">{cadence}</span>
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
