"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { PricingCard } from "@/components/ui/pricing-card";
import { Button } from "@/components/ui/button";
import { UpgradeButton } from "@/components/billing/upgrade-button";
import { PortalButton } from "@/components/billing/portal-button";
import { useAccess } from "@/lib/hooks/use-access";

/**
 * Pricing section. Premium-tier CTA branches on the centralized access
 * tier so the right action shows up for each visitor:
 *
 *   guest             → "Create account" (signup, then back to checkout)
 *   free student      → <UpgradeButton/> live Stripe Checkout
 *   premium student   → <PortalButton/> "Manage subscription"
 *   institution user  → no Premium card at all (replaced by an "included"
 *                       message — they should never see upsells)
 *   professor         → "Talk to us about your class" instead of upgrade
 *
 * The buttons gracefully tolerate Stripe env vars being missing — the
 * Checkout route returns 503 and the button shows a polite message
 * rather than crashing the page.
 */
export function PricingSection() {
  const access = useAccess();

  return (
    <section className="space-y-6">
      <SectionHeading
        eyebrow="Simple, respectful pricing"
        title="Free is generous. Premium is optional. Institution is invisible."
        description="The free tier covers the everyday flow. Premium unlocks deeper review and analytics. If your class is covered by your school, you never see a gate at all."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <PricingCard
          tier="free"
          name="Free"
          tagline="The everyday study flow, on the house."
          price="$0"
          cadence="forever"
          features={[
            "Browse all public course hubs",
            "Try guided quizzes",
            "Sample homework walkthroughs",
            "Save basic progress with a free account",
            "View leaderboard top entries"
          ]}
          cta={
            access.isAuthenticated ? (
              <Button asChild variant="secondary">
                <Link href="/app/courses">
                  Open course catalog
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button asChild variant="secondary">
                <Link href="/signup">
                  Create a free account
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            )
          }
          footnote="No credit card required."
        />

        <PricingCard
          tier="premium"
          name="Premium Student"
          tagline={
            access.isInstitutionCovered
              ? "Already included through your institution."
              : access.isProfessorTier
                ? "Premium is a student plan — see the institution column."
                : "For students who want the deeper review and analytics."
          }
          price="$8"
          cadence="/ month"
          highlighted={!access.isInstitutionCovered && !access.isProfessorTier}
          features={[
            "Unlimited saved progress and history",
            "Full quiz banks across courses",
            "Advanced Study Walkthrough",
            "Timed exam simulations + readiness signal",
            "Mistake history + smart review plans",
            "Mastery tracking and weak-topic recs"
          ]}
          cta={<PremiumCta />}
          footnote="Annual: $72/yr ($6/mo). Cancel anytime."
        />

        <PricingCard
          tier="institution"
          name="Class / Institution"
          tagline="When the school covers access. The cleanest path for a real course."
          price="Custom"
          cadence="per class / program"
          features={[
            "Verified students get full access — no popups",
            "Section-aware professor workspace",
            "Assignments, announcements, grading",
            "Exam integrity controls",
            "Direct content collaboration with our team",
            "Centralized billing — no per-student forms"
          ]}
          cta={
            <Button asChild>
              <Link href="/contact?intent=implementation&role=teacher">
                Talk to us
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          }
          footnote="Best for instructors, departments, and programs."
        />
      </div>
    </section>
  );
}

function PremiumCta() {
  const access = useAccess();

  // Institution-covered users: replace upsell with a calm reminder.
  if (access.isInstitutionCovered) {
    return (
      <Button asChild variant="secondary">
        <Link href="/app/account">
          See institution access
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    );
  }

  // Professors: route to the implementation conversation.
  if (access.isProfessorTier) {
    return (
      <Button asChild variant="secondary">
        <Link href="/contact?intent=implementation&role=teacher">
          Talk to us about your class
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    );
  }

  // Premium students: portal.
  if (access.isPremium) {
    return (
      <>
        <PortalButton variant="primary" />
        <p className="text-[11.5px] text-text-secondary">
          Premium is active on this account.
        </p>
      </>
    );
  }

  // Guest: route to signup with a "resume to checkout" hint.
  if (access.isGuest) {
    return (
      <>
        <Button asChild>
          <Link href="/signup?next=/app/account?billing=resume">
            Create account
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <p className="text-[11.5px] text-text-secondary">
          Sign up first — checkout starts on your account page.
        </p>
      </>
    );
  }

  // Free student: live Stripe Checkout via UpgradeButton.
  return (
    <>
      <UpgradeButton plan="monthly" returnUrl="/app/account">Start Premium</UpgradeButton>
      <UpgradeButton plan="yearly" variant="ghost" returnUrl="/app/account">
        Or save with annual
      </UpgradeButton>
    </>
  );
}
