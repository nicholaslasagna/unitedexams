import { describe, expect, it } from "vitest";
import type Stripe from "stripe";
import type { BillingEnv } from "./env";
import { BILLING_PRICES } from "./pricing";
import { stripeSubscriptionToRow } from "./sync";

/**
 * The webhook payload mapper — the only thing that turns a Stripe event
 * into a row in public.subscriptions.
 *
 * It reads a handful of fields whose *location* is decided by the pinned
 * API version in lib/billing/stripe.ts, and one of them has moved before:
 * current_period_end used to sit on the subscription and now rides on the
 * item. These tests pin the shapes so a later wire-version bump has to
 * fail here rather than in production, where the symptom is a silently
 * wrong entitlement window.
 */

const env: BillingEnv = {
  secretKey: "sk_test",
  webhookSecret: "whsec_test",
  priceLookupMonthly: BILLING_PRICES.monthly.lookupKey,
  priceLookupYearly: BILLING_PRICES.yearly.lookupKey,
  checkoutPaymentMethodTypes: null,
  paymentMethodConfiguration: null
};

const USER = "3f7c1a2e-9b4d-4c11-8a6f-2d5e7c9b1a34";
const PERIOD_END = 1789000000; // epoch seconds

function price(plan: "monthly" | "yearly"): Stripe.Price {
  const contract = BILLING_PRICES[plan];
  return {
    id: `price_${plan}`,
    active: true,
    currency: "usd",
    lookup_key: contract.lookupKey,
    type: "recurring",
    unit_amount: contract.amountCents,
    recurring: { interval: contract.interval, interval_count: 1 }
  } as unknown as Stripe.Price;
}

/** A subscription carrying period end wherever the caller asks for it. */
function subscription(
  overrides: {
    plan?: "monthly" | "yearly";
    periodEndOn?: "subscription" | "item" | "nowhere";
    metadata?: Record<string, string>;
    status?: string;
    customer?: unknown;
    cancelAtPeriodEnd?: boolean;
    lookupKey?: string | null;
  } = {}
): Stripe.Subscription {
  const {
    plan = "monthly",
    periodEndOn = "subscription",
    metadata = { user_id: USER },
    status = "active",
    customer = "cus_123",
    cancelAtPeriodEnd = false,
    lookupKey
  } = overrides;

  const itemPrice = price(plan);
  if (lookupKey !== undefined) {
    (itemPrice as { lookup_key: string | null }).lookup_key = lookupKey;
  }

  return {
    id: "sub_123",
    status,
    customer,
    metadata,
    cancel_at_period_end: cancelAtPeriodEnd,
    ...(periodEndOn === "subscription" ? { current_period_end: PERIOD_END } : {}),
    items: {
      data: [
        {
          id: "si_123",
          price: itemPrice,
          ...(periodEndOn === "item" ? { current_period_end: PERIOD_END } : {})
        }
      ]
    }
  } as unknown as Stripe.Subscription;
}

describe("resolving the billing period", () => {
  it("reads current_period_end from the subscription when it is there", () => {
    const result = stripeSubscriptionToRow(subscription({ periodEndOn: "subscription" }), env);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.row.current_period_end).toBe(new Date(PERIOD_END * 1000).toISOString());
  });

  it("falls back to the item when the wire version moved it there", () => {
    // This is the shape newer API versions send. Getting it wrong writes a
    // null period end, which reads as "no entitlement window".
    const result = stripeSubscriptionToRow(subscription({ periodEndOn: "item" }), env);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.row.current_period_end).toBe(new Date(PERIOD_END * 1000).toISOString());
  });

  it("records null rather than an invalid date when neither carries it", () => {
    const result = stripeSubscriptionToRow(subscription({ periodEndOn: "nowhere" }), env);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.row.current_period_end).toBeNull();
  });
});

describe("resolving the plan", () => {
  it.each(["monthly", "yearly"] as const)("maps the %s lookup key", (plan) => {
    const result = stripeSubscriptionToRow(subscription({ plan }), env);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.row.plan).toBe(plan);
  });

  it("refuses a price whose lookup key we do not recognise", () => {
    const result = stripeSubscriptionToRow(subscription({ lookupKey: "someone_elses_price" }), env);
    expect(result).toEqual({ ok: false, reason: "unknown_lookup_key", detail: "someone_elses_price" });
  });

  it("refuses a recognised key whose amount no longer matches the contract", () => {
    const sub = subscription();
    const p = sub.items.data[0].price as unknown as { unit_amount: number };
    p.unit_amount = 100; // someone edited the price in the dashboard
    const result = stripeSubscriptionToRow(sub, env);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("price_contract_mismatch");
  });
});

describe("resolving the user", () => {
  it("prefers the subscription's own metadata", () => {
    const result = stripeSubscriptionToRow(subscription(), env);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.row.user_id).toBe(USER);
  });

  it("falls back to customer metadata for out-of-band subscriptions", () => {
    // Created in the Stripe dashboard: the customer got tagged, the
    // subscription did not.
    const customer = { id: "cus_123", metadata: { user_id: USER } } as unknown as Stripe.Customer;
    const result = stripeSubscriptionToRow(subscription({ metadata: {} }), env, customer);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.row.user_id).toBe(USER);
  });

  it("rejects a non-UUID user id rather than writing an unresolvable row", () => {
    // CLI-triggered test events attach junk here; a row written with it
    // would violate the profiles foreign key on insert.
    const result = stripeSubscriptionToRow(subscription({ metadata: { user_id: "test" } }), env);
    expect(result).toEqual({ ok: false, reason: "missing_user_id" });
  });

  it("does not read metadata off a deleted customer", () => {
    const deleted = {
      id: "cus_123",
      deleted: true,
      metadata: { user_id: USER }
    } as unknown as Stripe.DeletedCustomer;
    const result = stripeSubscriptionToRow(subscription({ metadata: {} }), env, deleted);
    expect(result).toEqual({ ok: false, reason: "missing_user_id" });
  });
});

describe("the rest of the row", () => {
  it("passes through a status the database allows", () => {
    const result = stripeSubscriptionToRow(subscription({ status: "past_due" }), env);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.row.status).toBe("past_due");
  });

  it("coerces a status the database would reject", () => {
    // A new API version can add statuses. The CHECK constraint cannot
    // grow on its own, so an unknown one has to land somewhere safe.
    const result = stripeSubscriptionToRow(subscription({ status: "unpaid" }), env);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.row.status).toBe("incomplete");
  });

  it("takes the customer id whether it arrives expanded or as a string", () => {
    const asString = stripeSubscriptionToRow(subscription({ customer: "cus_123" }), env);
    const expanded = stripeSubscriptionToRow(subscription({ customer: { id: "cus_123" } }), env);
    expect(asString.ok && asString.row.stripe_customer_id).toBe("cus_123");
    expect(expanded.ok && expanded.row.stripe_customer_id).toBe("cus_123");
  });

  it("carries cancel_at_period_end through", () => {
    const result = stripeSubscriptionToRow(subscription({ cancelAtPeriodEnd: true }), env);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.row.cancel_at_period_end).toBe(true);
  });
});
