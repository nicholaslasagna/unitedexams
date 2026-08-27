"use client";

import {
  BookMarked,
  CalendarRange,
  Compass,
  GraduationCap,
  History,
  Infinity as InfinityIcon,
  Library,
  PlayCircle,
  Route,
  Target,
  Timer,
  Wallet,
  type LucideIcon
} from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import {
  PREMIUM_FEATURES,
  type PremiumFeature,
  type PremiumFeatureCategory
} from "@/lib/billing/premium-features";
import { cn } from "@/lib/utils";

/**
 * Renders the canonical PREMIUM_FEATURES catalog as an annotated list
 * with a Tooltip on every row that explains what the feature does in
 * plain English on hover / focus.
 *
 * Two layouts:
 *
 *   variant="grouped"  (default) — sectioned by category (Study, Exam,
 *                                  Analytics, Account) with a small
 *                                  uppercase eyebrow per group. Used
 *                                  on the dedicated upgrade page.
 *
 *   variant="flat"     — single hairline-divided list, no section
 *                        headers. Used inside the in-app billing card
 *                        and the homepage pricing section where space
 *                        is tighter.
 *
 * Every row keeps the icon → title → tooltip-info-mark layout so the
 * affordance to hover is consistent.
 */

const ICONS: Record<PremiumFeature["iconName"], LucideIcon> = {
  infinity: InfinityIcon,
  library: Library,
  target: Target,
  history: History,
  stopwatch: Timer,
  compass: Compass,
  graduation: GraduationCap,
  video: PlayCircle,
  wallet: Wallet,
  route: Route,
  books: BookMarked
};

const CATEGORY_LABELS: Record<PremiumFeatureCategory, { label: string; meta: string; icon: LucideIcon }> = {
  study: { label: "Study", meta: "Day to day", icon: Library },
  exam: { label: "Exam", meta: "When it counts", icon: Timer },
  analytics: { label: "Analytics", meta: "What to fix next", icon: GraduationCap },
  account: { label: "Account", meta: "Around the workspace", icon: CalendarRange }
};

export function PremiumFeatureList({
  variant = "grouped",
  className
}: {
  variant?: "grouped" | "flat";
  className?: string;
}) {
  if (variant === "flat") {
    return (
      <ul className={cn("divide-y divide-borderc", className)}>
        {PREMIUM_FEATURES.map((feature) => (
          <FeatureRow key={feature.id} feature={feature} />
        ))}
      </ul>
    );
  }

  // Grouped layout — partition by category.
  const grouped = (Object.keys(CATEGORY_LABELS) as PremiumFeatureCategory[]).map((cat) => ({
    cat,
    items: PREMIUM_FEATURES.filter((f) => f.category === cat)
  }));

  return (
    <div className={cn("space-y-6", className)}>
      {grouped.map(({ cat, items }) => {
        if (items.length === 0) return null;
        const meta = CATEGORY_LABELS[cat];
        const Icon = meta.icon;
        return (
          <section key={cat}>
            <div className="mb-2 flex items-baseline justify-between border-b border-hairline pb-2">
              <p className="flex items-center gap-2 font-mono text-[10.5px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                <Icon className="h-3.5 w-3.5 text-accent" aria-hidden />
                {meta.label}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-secondary/70">
                {meta.meta}
              </p>
            </div>
            <ul className="divide-y divide-borderc/70">
              {items.map((feature) => (
                <FeatureRow key={feature.id} feature={feature} />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function FeatureRow({ feature }: { feature: PremiumFeature }) {
  const Icon = ICONS[feature.iconName];
  return (
    <li>
      <Tooltip content={feature.tooltip}>
        <button
          type="button"
          className={cn(
            "group flex w-full items-start gap-3 rounded-md px-1 py-2.5 text-left",
            "transition-colors duration-150 hover:bg-soft/60",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
          )}
        >
          <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-borderc bg-soft text-accent">
            <Icon className="h-3.5 w-3.5" aria-hidden />
          </span>
          <span className="flex-1">
            <span className="flex items-center gap-1.5">
              <span className="text-[13.5px] font-semibold text-text">{feature.title}</span>
              <span
                aria-hidden
                className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border border-borderc text-[8.5px] font-bold text-text-secondary opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
              >
                ?
              </span>
            </span>
            <span className="mt-0.5 line-clamp-1 block text-[12px] text-text-secondary">
              Hover for details
            </span>
          </span>
        </button>
      </Tooltip>
    </li>
  );
}
