"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, CalendarClock, Crown, GraduationCap, Sparkles } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AccessBadge } from "@/components/ui/access-badge";
import { InstitutionAccessNote } from "@/components/ui/institution-access-note";
import { useAccess } from "@/lib/hooks/use-access";
import { useAppData } from "@/lib/app-data-context";
import { UpgradeButton } from "@/components/billing/upgrade-button";
import { PortalButton } from "@/components/billing/portal-button";
import { PaymentMethodBadges } from "@/components/billing/payment-method-badges";
import { PremiumFeatureList } from "@/components/billing/premium-feature-list";

/**
 * Account-page billing card. Branches entirely on the centralized
 * AccessContext — never inspects the profile object directly.
 *
 * Branches:
 *   - institution-covered → InstitutionAccessNote, no Stripe controls
 *   - professor tier      → "talk to us about institution access" CTA
 *   - premium student     → status + Manage subscription
 *   - free student        → upgrade buttons (monthly + yearly)
 *   - guest               → "sign in" prompt (defensive — page is gated)
 *
 * After Stripe Checkout, the user lands on /app/account?billing=success.
 * We poll the access view briefly so the UI flips to "Premium active"
 * as soon as the webhook lands, instead of requiring a manual reload.
 */
export function PremiumStatusCard() {
  const access = useAccess();
  const { refresh } = useAppData();
  const searchParams = useSearchParams();
  const justCheckedOut = searchParams.get("billing") === "success";

  // Optimistic post-checkout polling. The webhook usually lands within
  // a couple seconds; we poll up to 20s, then stop.
  const [activating, setActivating] = useState(justCheckedOut && !access.isPremium && !access.isInstitutionCovered);

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

  if (access.isInstitutionCovered) {
    return (
      <Card>
        <CardHeader>
          <h2 className="font-display text-xl font-semibold">Billing</h2>
        </CardHeader>
        <CardBody className="space-y-3">
          <InstitutionAccessNote variant="block" />
          <p className="text-[13px] text-text-secondary">
            Your school covers full access. There&apos;s nothing to manage here — the platform is included.
          </p>
        </CardBody>
      </Card>
    );
  }

  if (access.isProfessorTier) {
    return (
      <Card>
        <CardHeader>
          <h2 className="font-display text-xl font-semibold">Billing</h2>
        </CardHeader>
        <CardBody className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-accent/25 bg-accent/10 text-accent">
              <GraduationCap className="h-4 w-4" />
            </span>
            <p className="text-[14.5px] font-semibold text-text">Professor account</p>
          </div>
          <p className="text-[13px] leading-relaxed text-text-secondary">
            Premium is a student plan. For section workspaces, exam tools, assignments,
            and grading, talk to us about bringing United Exams to your class.
          </p>
          <Button asChild>
            <Link href="/contact?intent=implementation&role=teacher">
              Talk to us about your class
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardBody>
      </Card>
    );
  }

  if (access.isPremium) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Billing</h2>
            <AccessBadge variant="premium" label="Premium active" />
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <PremiumStatusBlock />
          <PortalButton />
        </CardBody>
      </Card>
    );
  }

  // Default: free signed-in student.
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Billing</h2>
          <AccessBadge variant="free" label="Free plan" />
        </div>
      </CardHeader>
      <CardBody className="space-y-4">
        {activating ? (
          <div className="rounded-[1rem] border border-accent/30 bg-accent/10 px-4 py-3 text-[13px] text-text">
            <span className="inline-flex items-center gap-2 font-semibold">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Activating Premium…
            </span>
            <p className="mt-1 text-[12px] text-text-secondary">
              Your subscription is processing. This page will update automatically.
            </p>
          </div>
        ) : null}

        <p className="text-[13.5px] leading-relaxed text-text-secondary">
          Premium adds saved progress, mistake review, practice exams, and
          progress tracking. Tap any feature below to see what it does — or open the
          full upgrade page to compare both plans side by side.
        </p>

        {/* Compact, hover-explainable feature list. */}
        <div className="rounded-[1rem] border border-borderc bg-soft/40 p-3">
          <PremiumFeatureList variant="flat" />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <UpgradeButton plan="monthly" returnUrl="/app/account">
            Premium · $8 / month
          </UpgradeButton>
          <UpgradeButton plan="yearly" variant="secondary" returnUrl="/app/account">
            Premium · $72 / year
          </UpgradeButton>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-borderc pt-3">
          <PaymentMethodBadges compact />
          <Button asChild variant="ghost" size="sm">
            <Link href="/app/upgrade">
              Compare plans
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        <p className="text-[11.5px] text-text-secondary">
          Stripe-hosted checkout. United Exams never sees or stores your card.
          Annual saves about 25% vs. monthly.
        </p>
      </CardBody>
    </Card>
  );
}

function PremiumStatusBlock() {
  const access = useAccess();
  const { profile } = useAppData();

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-[1rem] border border-borderc bg-soft px-3.5 py-3">
        <p className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.18em] text-text-secondary">
          <Crown className="h-3 w-3 text-accent" />
          Plan
        </p>
        <p className="mt-1.5 font-display text-base font-semibold text-text">
          {profile.premiumPlan === "yearly" ? "Premium · Yearly" : profile.premiumPlan === "monthly" ? "Premium · Monthly" : "Premium"}
        </p>
        <p className="mt-1 text-[11.5px] text-text-secondary">
          Source: {access.tier === "premium_student" ? "Stripe subscription" : "manual grant"}
        </p>
      </div>

      <div className="rounded-[1rem] border border-borderc bg-soft px-3.5 py-3">
        <p className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.18em] text-text-secondary">
          <CalendarClock className="h-3 w-3 text-accent" />
          Renews
        </p>
        <p className="mt-1.5 font-display text-base font-semibold text-text">
          {profile.premiumRenewsAt
            ? new Date(profile.premiumRenewsAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric"
              })
            : "—"}
        </p>
        <p className="mt-1 text-[11.5px] text-text-secondary">
          Manage cancellation, wallet/payment method, and invoices in the portal.
        </p>
      </div>
    </div>
  );
}
