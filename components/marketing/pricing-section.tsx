"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { UpgradeButton } from "@/components/billing/upgrade-button";
import { PortalButton } from "@/components/billing/portal-button";
import { useAccess } from "@/lib/hooks/use-access";

/**
 * Pricing — three editorial columns sharing one bordered grid:
 * Free · Premium (recommended) · Class / Institution.
 *
 * Mono uppercase tier names, massive Rodin price numerals with a
 * Fraunces italic accent, italic-serif tagline, hairline-divided
 * feature list, and an access-aware CTA at the bottom that branches
 * the same way it did before:
 *
 *   guest             → "Create account" (signup, then back to checkout)
 *   free student      → <UpgradeButton/> live Stripe Checkout
 *   premium student   → <PortalButton/> "Manage subscription"
 *   institution user  → "See institution access"
 *   professor         → "Talk to us about your class"
 */
export function PricingSection() {
  return (
    <section className="ed-section" id="pricing">
      <div className="ed-section-head">
        <h2>
          One page, <em>three tiers</em>.
        </h2>
        <p className="section-meta">Free · Premium · Institution</p>
      </div>

      <div className="pricing-grid-ed">
        {/* Free */}
        <div className="tier-ed">
          <p className="tier-name">Free</p>
          <div className="tier-price">
            <span className="tier-amount">$0</span>
            <span className="tier-period">/ forever</span>
          </div>
          <p className="tier-tag">For trying it on a real syllabus.</p>
          <ul className="tier-features-ed">
            <li>Browse all public course hubs</li>
            <li>Try guided quizzes</li>
            <li>Sample homework walkthroughs</li>
            <li>Save basic progress with a free account</li>
            <li>View leaderboard top entries</li>
          </ul>
          <FreeCta />
        </div>

        {/* Premium — recommended */}
        <div className="tier-ed is-recommended">
          <span className="recommended-mark">Recommended</span>
          <p className="tier-name">Premium</p>
          <div className="tier-price">
            <span className="tier-amount">
              $<em>8</em>
            </span>
            <span className="tier-period">/ month</span>
          </div>
          <p className="tier-tag">For students paying their own way.</p>
          <ul className="tier-features-ed">
            <li>Unlimited saved progress &amp; mastery analytics</li>
            <li>Full quiz banks across courses</li>
            <li>Walkthrough videos &amp; step-by-step solutions</li>
            <li>Timed exam simulations + readiness signal</li>
            <li>Mistake history + smart review plans</li>
            <li>Sections you can join</li>
          </ul>
          <PremiumCta />
        </div>

        {/* Institution */}
        <div className="tier-ed">
          <p className="tier-name">Institution</p>
          <div className="tier-price">
            <span className="tier-amount">Custom</span>
            <span className="tier-period">/ year</span>
          </div>
          <p className="tier-tag">For partnered schools and departments.</p>
          <ul className="tier-features-ed">
            <li>Everything in Premium for every verified user</li>
            <li>SSO, rosters, sections, grade passback</li>
            <li>Course shells your faculty can claim</li>
            <li>Data residency &amp; FERPA contracts</li>
            <li>Centralized billing — no per-student forms</li>
          </ul>
          <Link href="/contact?intent=implementation&role=teacher" className="ghost-btn">
            Talk to us
          </Link>
        </div>
      </div>
    </section>
  );
}

function FreeCta() {
  const access = useAccess();
  if (access.isAuthenticated) {
    return (
      <Link href="/app/courses" className="ghost-btn">
        Open course catalog
      </Link>
    );
  }
  return (
    <Link href="/signup" className="ghost-btn">
      Create a free account
    </Link>
  );
}

function PremiumCta() {
  const access = useAccess();

  if (access.isInstitutionCovered) {
    return (
      <Link href="/app/account" className="ghost-btn">
        See institution access
      </Link>
    );
  }
  if (access.isProfessorTier) {
    return (
      <Link href="/contact?intent=implementation&role=teacher" className="ghost-btn">
        Talk to us about your class
      </Link>
    );
  }
  if (access.isPremium) {
    return (
      <div className="flex flex-col gap-2">
        <PortalButton variant="primary" />
        <p className="text-[11.5px] text-text-secondary">
          Premium is active on this account.
        </p>
      </div>
    );
  }
  if (access.isGuest) {
    return (
      <div className="flex flex-col gap-2">
        <Link
          href="/signup?next=/app/account?billing=resume"
          className="inline-flex items-center gap-2 self-start rounded-sm bg-accent px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[hsl(228_50%_6%)] transition-transform hover:-translate-y-px"
        >
          Create account
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <p className="text-[11.5px] text-text-secondary">
          Sign up first — checkout starts on your account page.
        </p>
      </div>
    );
  }
  // Free student — live Stripe Checkout via UpgradeButton.
  return (
    <div className="flex flex-col gap-2">
      <UpgradeButton plan="monthly" returnUrl="/app/account">
        Start Premium
      </UpgradeButton>
      <UpgradeButton plan="yearly" variant="ghost" returnUrl="/app/account">
        Or save with annual
      </UpgradeButton>
    </div>
  );
}
