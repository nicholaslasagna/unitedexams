/**
 * United Exams — canonical list of Premium features.
 *
 * One place that defines what Premium actually does, so the homepage
 * pricing section, the dedicated upgrade page, and the in-app billing
 * card all stay in sync. Every entry has:
 *
 *   - title:       short label shown in the feature list
 *   - tooltip:     1-2 sentence plain-English explanation surfaced
 *                  when the user hovers / focuses the row
 *   - iconName:    a Lucide icon name (rendered by the consumer so we
 *                  don't bundle React types here)
 *   - category:    grouping shown on the upgrade page
 *
 * Keep tooltips honest. If a feature is partially implemented, use
 * "today" / "rolling out" language rather than implying it does more
 * than it does — students notice the gap immediately and the trust
 * cost outweighs any conversion lift.
 */

export type PremiumFeatureCategory = "study" | "exam" | "analytics" | "account";

export interface PremiumFeature {
  id: string;
  title: string;
  tooltip: string;
  iconName:
    | "infinity"
    | "library"
    | "target"
    | "history"
    | "stopwatch"
    | "compass"
    | "graduation"
    | "video"
    | "wallet"
    | "wand"
    | "books";
  category: PremiumFeatureCategory;
}

export const PREMIUM_FEATURES: PremiumFeature[] = [
  // ── Study ──
  {
    id: "saved-progress",
    title: "Unlimited saved progress",
    tooltip:
      "Every quiz attempt, walkthrough step, and answer history syncs to your account and stays. No more losing your place when you switch devices or clear your browser.",
    iconName: "infinity",
    category: "study"
  },
  {
    id: "full-quiz-banks",
    title: "Full quiz & exam banks",
    tooltip:
      "Free shows a sample set per course. Premium opens every released quiz set and mock exam in the catalog, including new ones we add each term.",
    iconName: "library",
    category: "study"
  },
  {
    id: "deep-walkthroughs",
    title: "Deep step-by-step walkthroughs",
    tooltip:
      "Hint-by-hint reveals, why-this-answer / why-others-are-wrong reasoning, and KaTeX-rendered solutions for math and code questions.",
    iconName: "compass",
    category: "study"
  },
  {
    id: "video-walkthroughs",
    title: "Walkthrough videos (rolling out)",
    tooltip:
      "Short narrated walkthroughs for the trickiest exam questions. We publish new ones each week per course.",
    iconName: "video",
    category: "study"
  },

  // ── Exam ──
  {
    id: "timed-exam",
    title: "Timed exam simulations",
    tooltip:
      "Strict timer, randomized order, no skipping back, end-of-exam review. Closest thing to sitting the real paper, and it scores you against the rubric the course actually uses.",
    iconName: "stopwatch",
    category: "exam"
  },
  {
    id: "readiness-signal",
    title: "Exam readiness signal",
    tooltip:
      "A single confidence score from 0–100 that combines mastery, recent accuracy, and pacing — so you know whether you're ready or what to fix next.",
    iconName: "target",
    category: "exam"
  },

  // ── Analytics ──
  {
    id: "mastery-analytics",
    title: "Per-topic mastery analytics",
    tooltip:
      "See exactly which topics you've consolidated and which are wobbling, broken down per course chapter — not just a single overall percentage.",
    iconName: "graduation",
    category: "analytics"
  },
  {
    id: "mistake-history",
    title: "Mistake history & smart review",
    tooltip:
      "Every question you got wrong is queued for spaced re-test, with the original walkthrough one tap away. Beats re-doing the same set hoping the wrong ones come back.",
    iconName: "history",
    category: "analytics"
  },
  {
    id: "weak-topic-recs",
    title: "Weak-topic recommendations",
    tooltip:
      "We surface the next set, walkthrough, or chapter you'd benefit most from — based on your actual performance, not a generic study plan.",
    iconName: "wand",
    category: "analytics"
  },

  // ── Account ──
  {
    id: "join-sections",
    title: "Sections you can join",
    tooltip:
      "Join professor- or peer-led sections by code. See the same hubs your classmates see, with announcements and shared assignments.",
    iconName: "books",
    category: "account"
  },
  {
    id: "wallet-checkout",
    title: "Wallet & PayPal checkout",
    tooltip:
      "Pay with Apple Pay, Google Pay, Link, PayPal, or any major card — all inside Stripe-hosted Checkout. United Exams never sees or stores your card details.",
    iconName: "wallet",
    category: "account"
  }
];

/**
 * Plan metadata for UI rendering. Backed by the same $8/mo and $72/yr
 * contract enforced server-side in lib/billing/pricing.ts — keep these
 * values in sync.
 */
export interface PlanDescriptor {
  id: "monthly" | "yearly";
  label: string;
  /** Whole-dollar headline price shown in the hero. */
  amountUsd: number;
  /** Cadence string, e.g. "/ month". */
  cadence: string;
  /** "Effective monthly" string for yearly — e.g. "$6 / month, billed annually". */
  effective?: string;
  /** Discount badge (e.g. "Save 25%"). Empty if none. */
  badge?: string;
  /** Calmer subtitle under the price. */
  tagline: string;
}

export const PLAN_DESCRIPTORS: Record<"monthly" | "yearly", PlanDescriptor> = {
  monthly: {
    id: "monthly",
    label: "Monthly",
    amountUsd: 8,
    cadence: "/ month",
    tagline: "Cancel any time, no commitment."
  },
  yearly: {
    id: "yearly",
    label: "Yearly",
    amountUsd: 72,
    cadence: "/ year",
    effective: "$6 / month, billed annually",
    badge: "Save 25%",
    tagline: "Best for the full school year."
  }
};
