import type Stripe from "stripe";

export type BillingPlan = "monthly" | "yearly";

export interface BillingPriceContract {
  plan: BillingPlan;
  lookupKey: string;
  displayName: string;
  amountCents: number;
  currency: "usd";
  interval: "month" | "year";
  intervalCount: 1;
}

export const BILLING_PRICES: Record<BillingPlan, BillingPriceContract> = {
  monthly: {
    plan: "monthly",
    lookupKey: "premium_monthly",
    displayName: "Premium Monthly",
    amountCents: 800,
    currency: "usd",
    interval: "month",
    intervalCount: 1
  },
  yearly: {
    plan: "yearly",
    lookupKey: "premium_yearly",
    displayName: "Premium Yearly",
    amountCents: 7200,
    currency: "usd",
    interval: "year",
    intervalCount: 1
  }
};

export function billingPriceForPlan(plan: BillingPlan): BillingPriceContract {
  return BILLING_PRICES[plan];
}

export function validateStripePriceForPlan(
  price: Stripe.Price | null | undefined,
  plan: BillingPlan,
  lookupKey: string
): { ok: true } | { ok: false; reason: string } {
  if (!price) return { ok: false, reason: "missing_price" };

  const expected = billingPriceForPlan(plan);
  const recurring = price.recurring;

  if (price.lookup_key !== lookupKey) {
    return { ok: false, reason: "lookup_key_mismatch" };
  }
  if (!price.active) {
    return { ok: false, reason: "price_inactive" };
  }
  if (price.type !== "recurring" || !recurring) {
    return { ok: false, reason: "not_recurring" };
  }
  if (price.currency.toLowerCase() !== expected.currency) {
    return { ok: false, reason: "currency_mismatch" };
  }
  if (price.unit_amount !== expected.amountCents) {
    return { ok: false, reason: "amount_mismatch" };
  }
  if (recurring.interval !== expected.interval) {
    return { ok: false, reason: "interval_mismatch" };
  }
  if ((recurring.interval_count ?? 1) !== expected.intervalCount) {
    return { ok: false, reason: "interval_count_mismatch" };
  }

  return { ok: true };
}
