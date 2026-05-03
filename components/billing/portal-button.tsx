"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { ExternalLink, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Opens the Stripe Customer Portal for the current user.
 * Surfaces a friendly inline error if the user has no Stripe customer yet
 * (i.e. they've never started checkout).
 */
export function PortalButton({
  returnUrl,
  variant = "secondary",
  size = "md",
  className,
  children
}: {
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
      const res = await fetch("/api/billing/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returnUrl })
      });
      const payload = (await res.json().catch(() => ({}))) as { url?: string; error?: string };

      if (!res.ok || !payload.url) {
        if (payload.error === "no_customer") {
          setError("You don't have a Stripe customer yet. Subscribe first to manage billing.");
          return;
        }
        if (res.status === 401) {
          window.location.assign("/login?next=/app/account");
          return;
        }
        if (res.status === 503) {
          setError("Billing isn't configured. Try again later.");
          return;
        }
        setError("Couldn't open the billing portal. Try again or contact support.");
        return;
      }

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
        loadingLabel="Opening portal…"
        onClick={onClick}
        className={className}
      >
        <Settings2 className="h-4 w-4" />
        {children ?? "Manage subscription"}
        <ExternalLink className="h-4 w-4" />
      </Button>
      {error ? (
        <p className="text-[12px] text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
