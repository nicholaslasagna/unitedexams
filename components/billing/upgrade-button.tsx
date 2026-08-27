"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { ArrowRight, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Starts a Stripe Checkout session for the current user.
 * Shows an inline error on failure; never exposes raw Stripe error text.
 *
 * Use this only for signed-in free users. Components upstream (the
 * pricing section, the account billing card) should already have
 * decided this is the right CTA based on `useAccess()`.
 */
export function UpgradeButton({
  plan,
  returnUrl,
  variant = "primary",
  size = "md",
  className,
  children
}: {
  plan: "monthly" | "yearly";
  returnUrl?: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  children?: ReactNode;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onClick = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, returnUrl })
      });
      const payload = (await res.json().catch(() => ({}))) as { url?: string; error?: string };

      if (!res.ok || !payload.url) {
        if (res.status === 401) {
          // Redirect to sign-in, then back to here so they can retry.
          const next = encodeURIComponent(returnUrl ?? "/app/account?billing=resume");
          window.location.assign(`/login?next=${next}`);
          return;
        }
        if (res.status === 503) {
          setError("Subscriptions aren't available right now. Please try again later.");
          return;
        }
        if (res.status === 409 && payload.error === "already_subscribed") {
          // User already has Premium — push them to the portal instead.
          window.location.assign("/app/account?billing=already_active");
          return;
        }
        if (res.status === 409 && payload.error === "institution_covered") {
          // School covers access — no checkout needed.
          window.location.assign("/app/account?billing=institution");
          return;
        }
        setError("Couldn't open checkout. Try again or contact support.");
        return;
      }

      // Stripe Checkout is an external URL — must be a full navigation,
      // never router.push().
      window.location.assign(payload.url);
    } catch {
      setError("Couldn't reach the billing service. Check your connection and retry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <Button
        type="button"
        variant={variant}
        size={size}
        loading={loading}
        loadingLabel="Opening Stripe…"
        onClick={onClick}
        className={className}
      >
        <KeyRound className="h-4 w-4" />
        {children ?? (plan === "yearly" ? "Start Premium Yearly" : "Start Premium Monthly")}
        <ArrowRight className="h-4 w-4" />
      </Button>
      {error ? (
        <p className="text-[12px] text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
