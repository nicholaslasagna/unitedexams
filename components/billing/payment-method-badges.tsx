"use client";

import type { ReactNode } from "react";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/**
 * Visual row of payment methods accepted on Stripe-hosted Checkout.
 *
 * Inline SVG marks (no external image fetches, no dependency on
 * Stripe's CDN). Each badge is wrapped in a Tooltip explaining what
 * it is and where it shows up.
 *
 * IMPORTANT — these are display-only. The actual list of available
 * methods at runtime is decided by Stripe based on:
 *   1. The Payment Method Configuration (`pmc_…`) chosen in the
 *      Stripe Dashboard if `STRIPE_PAYMENT_METHOD_CONFIGURATION` is
 *      set, OR
 *   2. The explicit list in `STRIPE_CHECKOUT_PAYMENT_METHOD_TYPES`
 *      (currently "card,link,paypal" by default).
 *
 * Apple Pay and Google Pay both ride on the `card` rail in Stripe
 * Checkout; they appear automatically when the visitor's browser
 * advertises a wallet. Venmo is NOT supported as a Stripe Checkout
 * subscription method and is therefore not displayed.
 *
 * Pass `compact` for an inline footnote-style strip (homepage
 * pricing card). Default is the full size used on the upgrade page.
 */
export function PaymentMethodBadges({
  compact = false,
  className
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <ul
      className={cn(
        "flex flex-wrap items-center",
        compact ? "gap-1.5" : "gap-2",
        className
      )}
      aria-label="Accepted payment methods"
    >
      <PaymentMethodBadge
        name="Visa"
        compact={compact}
        tooltip="Visa credit & debit cards. Processed by Stripe — United Exams never sees the card number."
      >
        <VisaMark compact={compact} />
      </PaymentMethodBadge>
      <PaymentMethodBadge
        name="Mastercard"
        compact={compact}
        tooltip="Mastercard credit & debit cards. Processed by Stripe."
      >
        <MastercardMark compact={compact} />
      </PaymentMethodBadge>
      <PaymentMethodBadge
        name="American Express"
        compact={compact}
        tooltip="American Express cards. Processed by Stripe."
      >
        <AmexMark compact={compact} />
      </PaymentMethodBadge>
      <PaymentMethodBadge
        name="Discover"
        compact={compact}
        tooltip="Discover cards. Processed by Stripe."
      >
        <DiscoverMark compact={compact} />
      </PaymentMethodBadge>
      <PaymentMethodBadge
        name="Apple Pay"
        compact={compact}
        tooltip="Apple Pay appears automatically in Stripe Checkout when you're on a Safari browser signed in to an Apple ID with a wallet card on file."
      >
        <ApplePayMark compact={compact} />
      </PaymentMethodBadge>
      <PaymentMethodBadge
        name="Google Pay"
        compact={compact}
        tooltip="Google Pay appears automatically in Stripe Checkout when you're on Chrome / Android signed in to a Google account with a card on file."
      >
        <GooglePayMark compact={compact} />
      </PaymentMethodBadge>
      <PaymentMethodBadge
        name="Link by Stripe"
        compact={compact}
        tooltip="Stripe Link — one-click checkout that remembers your details across any site that uses Stripe. Optional."
      >
        <LinkMark compact={compact} />
      </PaymentMethodBadge>
      <PaymentMethodBadge
        name="PayPal"
        compact={compact}
        tooltip="PayPal — pay through your PayPal balance, linked bank, or wallet card. Subject to PayPal's recurring-payment eligibility."
      >
        <PayPalMark compact={compact} />
      </PaymentMethodBadge>
    </ul>
  );
}

function PaymentMethodBadge({
  name,
  tooltip,
  compact,
  children
}: {
  name: string;
  tooltip: string;
  compact: boolean;
  children: ReactNode;
}) {
  return (
    <li>
      <Tooltip content={tooltip}>
        <button
          type="button"
          aria-label={name}
          className={cn(
            "inline-flex items-center justify-center rounded-md border border-borderc bg-surface text-text",
            "transition-all duration-150 ease-out-expo",
            "hover:border-border-bright hover:-translate-y-px focus:outline-none",
            "focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
            compact ? "h-6 px-1.5" : "h-9 px-2.5"
          )}
        >
          {children}
        </button>
      </Tooltip>
    </li>
  );
}

// ────────────────────────────────────────────────────────────────────
// Inline brand marks. Each one is its own component so we can tune
// width/height per brand and keep the row optically balanced.
// All marks use `currentColor` for the wordmark stroke where possible
// so they stay legible on the editorial dark surface.
// ────────────────────────────────────────────────────────────────────

const sizes = (compact: boolean) => ({
  h: compact ? 14 : 20,
  txt: compact ? 8 : 11
});

function VisaMark({ compact }: { compact: boolean }) {
  const { h, txt } = sizes(compact);
  return (
    <svg
      width={h * 2.4}
      height={h}
      viewBox="0 0 48 20"
      role="img"
      aria-label="Visa"
    >
      <text
        x="24"
        y="14"
        textAnchor="middle"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight={900}
        fontSize={txt + 4}
        fontStyle="italic"
        fill="#1A1F71"
        letterSpacing="0.02em"
      >
        VISA
      </text>
    </svg>
  );
}

function MastercardMark({ compact }: { compact: boolean }) {
  const { h } = sizes(compact);
  return (
    <svg
      width={h * 1.8}
      height={h}
      viewBox="0 0 36 20"
      role="img"
      aria-label="Mastercard"
    >
      <circle cx="14" cy="10" r="7" fill="#EB001B" />
      <circle cx="22" cy="10" r="7" fill="#F79E1B" />
      <path
        d="M18 4.6c1.7 1.4 2.8 3.5 2.8 5.4 0 1.9-1.1 4-2.8 5.4-1.7-1.4-2.8-3.5-2.8-5.4 0-1.9 1.1-4 2.8-5.4z"
        fill="#FF5F00"
      />
    </svg>
  );
}

function AmexMark({ compact }: { compact: boolean }) {
  const { h, txt } = sizes(compact);
  return (
    <svg
      width={h * 2.2}
      height={h}
      viewBox="0 0 44 20"
      role="img"
      aria-label="American Express"
    >
      <rect x="0" y="0" width="44" height="20" rx="2" fill="#1F72CD" />
      <text
        x="22"
        y="13"
        textAnchor="middle"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight={800}
        fontSize={txt - 1}
        fill="#FFFFFF"
        letterSpacing="0.05em"
      >
        AMEX
      </text>
    </svg>
  );
}

function DiscoverMark({ compact }: { compact: boolean }) {
  const { h, txt } = sizes(compact);
  return (
    <svg
      width={h * 2.6}
      height={h}
      viewBox="0 0 52 20"
      role="img"
      aria-label="Discover"
    >
      <text
        x="3"
        y="13"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight={800}
        fontSize={txt - 1}
        fill="currentColor"
        letterSpacing="0.04em"
      >
        DISC
      </text>
      <circle cx="44" cy="10" r="6" fill="#FF6000" />
    </svg>
  );
}

function ApplePayMark({ compact }: { compact: boolean }) {
  const { h, txt } = sizes(compact);
  return (
    <svg
      width={h * 2.6}
      height={h}
      viewBox="0 0 52 20"
      role="img"
      aria-label="Apple Pay"
    >
      {/* Apple glyph */}
      <path
        d="M11.6 6.1c.6-.7.9-1.6.9-2.5-.8 0-1.7.5-2.3 1.1-.5.6-1 1.5-.8 2.4.9.1 1.7-.4 2.2-1zm.8 1.1c-1.2-.1-2.2.7-2.8.7-.6 0-1.5-.7-2.5-.7-1.3 0-2.5.7-3.1 1.9-1.4 2.4-.4 5.9.9 7.9.7 1 1.4 2 2.5 2 .9 0 1.3-.6 2.5-.6 1.2 0 1.5.6 2.5.6 1 0 1.7-1 2.3-1.9.5-.7.9-1.6 1.2-2.5-1.7-.6-2.6-2.5-1.5-3.4z"
        fill="currentColor"
      />
      <text
        x="20"
        y="13"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight={600}
        fontSize={txt}
        fill="currentColor"
        letterSpacing="0.01em"
      >
        Pay
      </text>
    </svg>
  );
}

function GooglePayMark({ compact }: { compact: boolean }) {
  const { h, txt } = sizes(compact);
  return (
    <svg
      width={h * 2.8}
      height={h}
      viewBox="0 0 56 20"
      role="img"
      aria-label="Google Pay"
    >
      {/* Google G — no full Google logo; circle + G letter */}
      <circle cx="9" cy="10" r="6" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <text
        x="9"
        y="13"
        textAnchor="middle"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight={700}
        fontSize={txt}
        fill="currentColor"
      >
        G
      </text>
      <text
        x="20"
        y="13"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight={600}
        fontSize={txt}
        fill="currentColor"
        letterSpacing="0.01em"
      >
        Pay
      </text>
    </svg>
  );
}

function LinkMark({ compact }: { compact: boolean }) {
  const { h, txt } = sizes(compact);
  return (
    <svg
      width={h * 2.4}
      height={h}
      viewBox="0 0 48 20"
      role="img"
      aria-label="Stripe Link"
    >
      <rect x="0" y="3" width="48" height="14" rx="7" fill="#33DDB3" />
      <text
        x="24"
        y="13"
        textAnchor="middle"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight={800}
        fontSize={txt - 1}
        fill="#0E2A24"
        letterSpacing="0.04em"
      >
        LINK
      </text>
    </svg>
  );
}

function PayPalMark({ compact }: { compact: boolean }) {
  const { h, txt } = sizes(compact);
  return (
    <svg
      width={h * 2.8}
      height={h}
      viewBox="0 0 56 20"
      role="img"
      aria-label="PayPal"
    >
      <text
        x="2"
        y="14"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight={800}
        fontSize={txt + 1}
        fill="#003087"
        fontStyle="italic"
      >
        Pay
      </text>
      <text
        x="26"
        y="14"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight={800}
        fontSize={txt + 1}
        fill="#009CDE"
        fontStyle="italic"
      >
        Pal
      </text>
    </svg>
  );
}
