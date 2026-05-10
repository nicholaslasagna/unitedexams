"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Crown,
  Lock,
  RefreshCw,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AccessBadge } from "@/components/ui/access-badge";
import { Tooltip } from "@/components/ui/tooltip";
import { UpgradeButton } from "@/components/billing/upgrade-button";
import { PortalButton } from "@/components/billing/portal-button";
import { PaymentMethodBadges } from "@/components/billing/payment-method-badges";
import { PremiumFeatureList } from "@/components/billing/premium-feature-list";
import { useAccess } from "@/lib/hooks/use-access";
import { useAppData } from "@/lib/app-data-context";
import { PLAN_DESCRIPTORS } from "@/lib/billing/premium-features";
import { cn } from "@/lib/utils";

/**
 * /app/upgrade — the dedicated, focused Premium upgrade page.
 *
 * Goals:
 *   1. Single, confident page that walks a free student from "I'm
 *      curious about Premium" → live Stripe Checkout in one decisive
 *      tap, without nagging. No upsell theater for users who already
 *      have access through institution / professor / existing Premium.
 *
 *   2. Hover-explainable feature list. Every Premium capability has a
 *      Tooltip with a 1-2 sentence explanation so the user knows what
 *      they're paying for.
 *
 *   3. Visible payment surface. We render branded badges for cards,
 *      Apple Pay, Google Pay, Link, and PayPal so visitors know up
 *      front that they don't have to type a card number unless they
 *      want to. Stripe-hosted Checkout decides which actually appear
 *      based on browser/wallet eligibility.
 *
 *   4. Trust signals. "United Exams never sees your card", "Cancel any
 *      time in the portal", "Same student price worldwide".
 *
 * Branches:
 *   - guest               (defensive — page is auth-gated)
 *     → "Sign in" CTA
 *   - institution-covered → "Already covered through your school" panel
 *   - professor tier      → "Talk to us about your class" instead
 *   - already premium     → "You already have Premium" + portal CTA
 *   - free student        → live UpgradeButton (the goal state)
 *
 * Post-checkout: ?billing=success polls the access view for up to 20s
 * and flips into the "Premium active" view once the webhook lands.
 */

export function UpgradePageContent() {
  const access = useAccess();
  const { ready, refresh, isAuthenticated } = useAppData();
  const router = useRouter();
  const search = useSearchParams();

  const [plan, setPlan] = useState<"monthly" | "yearly">("yearly");
  const billingState = search.get("billing");

  // Optimistic post-checkout polling. Webhook usually lands ~2s; we
  // poll up to 20s, then stop and show a manual refresh hint.
  const justCheckedOut = billingState === "success";
  const [activating, setActivating] = useState(
    justCheckedOut && !access.isPremium && !access.isInstitutionCovered
  );

  useEffect(() => {
    if (!activating) return;
    const start = Date.now();
    const interval = window.setInterval(async () => {
      await refresh();
      if (access.isPremium || access.isInstitutionCovered) {
        setActivating(false);
        return;
      }
      if (Date.now() - start > 20_000) {
        setActivating(false);
      }
    }, 2_000);
    return () => window.clearInterval(interval);
  }, [activating, refresh, access.isPremium, access.isInstitutionCovered]);

  if (!ready) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="h-72" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  // Defensive: page is in /app/* which is auth-gated, but in case the
  // session evaporates mid-render, send the user to sign in cleanly.
  if (!isAuthenticated) {
    return (
      <SignInRequired />
    );
  }

  // Already-covered branches — calm, not pushy.
  if (access.isInstitutionCovered) {
    return <AlreadyCovered title="You're covered through your institution" />;
  }
  if (access.isProfessorTier) {
    return <ProfessorBranch />;
  }
  if (access.isPremium) {
    return <AlreadyPremium />;
  }

  // ─── The goal state: free signed-in student ───
  return (
    <div className="space-y-6">
      <BackToAccountLink />

      {billingState === "canceled" ? (
        <CanceledBanner />
      ) : null}

      {activating ? (
        <ActivatingBanner />
      ) : null}

      <UpgradeHero plan={plan} setPlan={setPlan} />

      <FeatureAndCheckoutGrid plan={plan} />

      <PaymentAndTrustSection />

      <ManagedByStripeFooter />
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Hero — eyebrow, headline, plan toggle with savings badge.
// ────────────────────────────────────────────────────────────────────

function UpgradeHero({
  plan,
  setPlan
}: {
  plan: "monthly" | "yearly";
  setPlan: (p: "monthly" | "yearly") => void;
}) {
  const desc = PLAN_DESCRIPTORS[plan];
  return (
    <Card className="relative overflow-hidden">
      <CardBody className="space-y-6 p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.18em] text-accent">
            <Crown className="h-3 w-3" /> Premium Student
          </span>
          <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-text-secondary">
            One plan · billed in USD · cancel anytime
          </span>
        </div>

        <div className="space-y-3">
          <h1 className="font-display text-[2rem] font-semibold leading-[1.05] tracking-tight text-text sm:text-[2.6rem]">
            Unlock everything United Exams can do for the courses you&apos;re actually taking.
          </h1>
          <p className="max-w-2xl text-[15px] leading-relaxed text-text-secondary">
            Saved progress, mistake history, exam simulations, and per-topic mastery —
            all in one workspace. Same student price worldwide. Hover any feature below
            for what it actually means.
          </p>
        </div>

        {/* Plan toggle */}
        <PlanToggle plan={plan} setPlan={setPlan} />

        {/* Live price block */}
        <div className="flex flex-wrap items-end gap-x-6 gap-y-3 border-t border-borderc pt-5">
          <div>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-text-secondary">
              You pay
            </p>
            <p className="mt-1 flex items-baseline gap-2">
              <span className="font-display text-[3rem] font-semibold leading-none tracking-tight text-text sm:text-[3.5rem]">
                ${desc.amountUsd}
              </span>
              <span className="font-mono text-[12px] uppercase tracking-[0.18em] text-text-secondary">
                {desc.cadence}
              </span>
            </p>
            {desc.effective ? (
              <p className="mt-1 text-[12px] italic text-text-secondary">{desc.effective}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <UpgradeButton plan={plan} returnUrl="/app/upgrade" size="lg">
              Continue with {desc.label}
            </UpgradeButton>
            <p className="text-[11.5px] text-text-secondary">
              You&apos;ll be redirected to Stripe-hosted Checkout. United Exams never
              sees or stores your card.
            </p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

function PlanToggle({
  plan,
  setPlan
}: {
  plan: "monthly" | "yearly";
  setPlan: (p: "monthly" | "yearly") => void;
}) {
  const opts: Array<"monthly" | "yearly"> = ["monthly", "yearly"];
  return (
    <div
      role="radiogroup"
      aria-label="Billing cadence"
      className="inline-flex rounded-full border border-borderc bg-soft p-1"
    >
      {opts.map((id) => {
        const desc = PLAN_DESCRIPTORS[id];
        const active = plan === id;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setPlan(id)}
            className={cn(
              "relative inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[12.5px] font-semibold",
              "transition-all duration-150 ease-out-expo",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
              active
                ? "bg-surface text-text shadow-subtle"
                : "text-text-secondary hover:text-text"
            )}
          >
            {desc.label}
            {desc.badge ? (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.16em]",
                  active
                    ? "bg-accent/20 text-accent"
                    : "border border-accent/30 text-accent"
                )}
              >
                {desc.badge}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Feature list + sticky checkout sidebar (desktop) / stack (mobile)
// ────────────────────────────────────────────────────────────────────

function FeatureAndCheckoutGrid({ plan }: { plan: "monthly" | "yearly" }) {
  const desc = PLAN_DESCRIPTORS[plan];

  return (
    <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
      <Card>
        <CardHeader>
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-display text-xl font-semibold text-text">
              What you actually get
            </h2>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-text-secondary">
              Hover any row
            </p>
          </div>
        </CardHeader>
        <CardBody>
          <PremiumFeatureList variant="grouped" />
        </CardBody>
      </Card>

      <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-xl font-semibold text-text">Checkout</h2>
              <AccessBadge variant="free" label="Free → Premium" />
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="rounded-[1rem] border border-borderc bg-soft px-4 py-3">
              <div className="flex items-baseline justify-between">
                <p className="text-[13px] font-semibold text-text">{desc.label} plan</p>
                <p className="font-mono text-[12.5px] tabular-nums text-text">
                  ${desc.amountUsd}
                  <span className="text-[10.5px] uppercase tracking-[0.18em] text-text-secondary">
                    {" "}
                    {desc.cadence}
                  </span>
                </p>
              </div>
              {desc.effective ? (
                <p className="mt-1 text-[11.5px] italic text-text-secondary">
                  {desc.effective}
                </p>
              ) : null}
              <p className="mt-1.5 text-[11.5px] text-text-secondary">{desc.tagline}</p>
            </div>

            <UpgradeButton plan={plan} returnUrl="/app/upgrade">
              Continue with {desc.label}
            </UpgradeButton>

            <ul className="space-y-1.5 text-[12px] text-text-secondary">
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                Secure Stripe-hosted Checkout
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                Cancel any time from the billing portal
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                Promo codes accepted at checkout
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                Works the same on every device
              </li>
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-2 p-4">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-text-secondary">
              Already paying for it?
            </p>
            <p className="text-[12.5px] text-text-secondary">
              If your school covers United Exams, you&apos;ll never see this page —
              full access is included.
            </p>
            <Link
              href="/contact?intent=implementation&role=student"
              className="ghost-btn"
            >
              Suggest us to a professor
            </Link>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Payment + trust block
// ────────────────────────────────────────────────────────────────────

function PaymentAndTrustSection() {
  return (
    <Card>
      <CardBody className="space-y-5 p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-2">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-text-secondary">
              Pay your way
            </p>
            <h2 className="font-display text-[1.5rem] font-semibold leading-tight tracking-tight text-text">
              Cards, wallets, and PayPal — all hosted by Stripe.
            </h2>
            <p className="text-[13.5px] leading-relaxed text-text-secondary">
              Apple Pay and Google Pay appear automatically on devices that support them.
              Stripe Link and PayPal are available where eligible. United Exams never
              sees, touches, or stores your card details — payment happens entirely on
              Stripe&apos;s checkout page.
            </p>
          </div>

          <div className="space-y-3">
            <PaymentMethodBadges />
            <p className="text-[11.5px] text-text-secondary">
              The exact list shown at checkout depends on your browser, device, and
              region. Stripe selects from this set automatically.
            </p>
          </div>
        </div>

        <div className="grid gap-3 border-t border-borderc pt-5 sm:grid-cols-3">
          <TrustChip
            icon={<Lock className="h-3.5 w-3.5" />}
            title="No card data on our servers"
            tooltip="Your card / wallet details only ever exist inside Stripe. United Exams stores nothing more sensitive than the Stripe customer id."
          />
          <TrustChip
            icon={<RefreshCw className="h-3.5 w-3.5" />}
            title="Cancel any time"
            tooltip="One click in the Stripe Customer Portal cancels your subscription. No emails, no phone calls, no retention dance."
          />
          <TrustChip
            icon={<ShieldCheck className="h-3.5 w-3.5" />}
            title="Same price worldwide"
            tooltip="Listed in USD; Stripe handles currency conversion for non-US wallets at the live exchange rate. There's no regional surge pricing."
          />
        </div>
      </CardBody>
    </Card>
  );
}

function TrustChip({
  icon,
  title,
  tooltip
}: {
  icon: React.ReactNode;
  title: string;
  tooltip: string;
}) {
  return (
    <Tooltip content={tooltip}>
      <button
        type="button"
        className={cn(
          "group flex items-center gap-2.5 rounded-md border border-borderc bg-soft px-3 py-2 text-left",
          "transition-colors duration-150 hover:bg-overlay focus:outline-none",
          "focus-visible:ring-2 focus-visible:ring-accent/50"
        )}
      >
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-borderc bg-surface text-accent">
          {icon}
        </span>
        <span className="text-[12.5px] font-semibold text-text">{title}</span>
      </button>
    </Tooltip>
  );
}

function ManagedByStripeFooter() {
  return (
    <p className="text-center text-[11px] uppercase tracking-[0.22em] text-text-secondary">
      Payments processed by Stripe ·{" "}
      <Link
        href="https://stripe.com/legal/checkout"
        target="_blank"
        rel="noreferrer"
        className="underline decoration-borderc hover:text-text"
      >
        Stripe Terms
      </Link>
    </p>
  );
}

// ────────────────────────────────────────────────────────────────────
// Branched alternates
// ────────────────────────────────────────────────────────────────────

function CanceledBanner() {
  return (
    <div className="rounded-[1rem] border border-borderc bg-soft px-4 py-3 text-[13px] text-text">
      <p className="flex items-center gap-2 font-semibold">
        <ArrowLeft className="h-3.5 w-3.5 text-text-secondary" />
        You backed out of checkout — no charge was made.
      </p>
      <p className="mt-1 text-[12px] text-text-secondary">
        Whenever you&apos;re ready, the same plan is here.
      </p>
    </div>
  );
}

function ActivatingBanner() {
  return (
    <div className="rounded-[1rem] border border-accent/30 bg-accent/10 px-4 py-3 text-[13px] text-text">
      <p className="flex items-center gap-2 font-semibold">
        <Sparkles className="h-3.5 w-3.5 text-accent" /> Activating Premium…
      </p>
      <p className="mt-1 text-[12px] text-text-secondary">
        Your subscription is processing. This page updates automatically when the
        webhook lands (usually within a few seconds).
      </p>
    </div>
  );
}

function AlreadyPremium() {
  return (
    <div className="space-y-5">
      <BackToAccountLink />
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h1 className="font-display text-2xl font-semibold text-text">
              You&apos;re on Premium.
            </h1>
            <AccessBadge variant="premium" label="Premium active" />
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <p className="text-[14px] leading-relaxed text-text-secondary">
            Your subscription is active and the full library is unlocked. To switch
            plans, change your wallet, or cancel, open the Stripe Customer Portal.
          </p>
          <PortalButton />
        </CardBody>
      </Card>
    </div>
  );
}

function AlreadyCovered({ title }: { title: string }) {
  return (
    <div className="space-y-5">
      <BackToAccountLink />
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h1 className="font-display text-2xl font-semibold text-text">{title}</h1>
            <AccessBadge variant="institution" label="Institution access" />
          </div>
        </CardHeader>
        <CardBody className="space-y-3">
          <p className="text-[14px] leading-relaxed text-text-secondary">
            Your school covers full access to United Exams. There&apos;s nothing to
            buy here — every feature you&apos;d see on the Premium plan is already
            on for you.
          </p>
          <Button asChild variant="secondary">
            <Link href="/app/account">
              <ArrowLeft className="h-4 w-4" />
              Back to account
            </Link>
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}

function ProfessorBranch() {
  const router = useRouter();
  return (
    <div className="space-y-5">
      <BackToAccountLink />
      <Card>
        <CardHeader>
          <h1 className="font-display text-2xl font-semibold text-text">
            Premium is the student plan.
          </h1>
        </CardHeader>
        <CardBody className="space-y-4">
          <p className="text-[14px] leading-relaxed text-text-secondary">
            For sections, assignments, exam settings, and grading, talk to us about
            bringing United Exams to your class as an institution partner.
          </p>
          <Button onClick={() => router.push("/contact?intent=implementation&role=teacher")}>
            Talk to us about your class
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}

function SignInRequired() {
  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <h1 className="font-display text-2xl font-semibold text-text">
            Sign in to subscribe.
          </h1>
        </CardHeader>
        <CardBody className="space-y-4">
          <p className="text-[14px] leading-relaxed text-text-secondary">
            Premium is per-account, so you&apos;ll need to be signed in. We&apos;ll
            bring you back here right after.
          </p>
          <Button asChild>
            <Link href="/login?next=/app/upgrade">
              Sign in
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}

function BackToAccountLink() {
  return (
    <Link
      href="/app/account"
      className={cn(
        "inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase",
        "tracking-[0.18em] text-text-secondary hover:text-text",
        "transition-colors duration-150"
      )}
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      Back to account
    </Link>
  );
}
