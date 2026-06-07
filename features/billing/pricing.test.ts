import type Stripe from "stripe";
import { describe, expect, it } from "vitest";
import { validateStripePriceForPlan } from "../../lib/billing/pricing";

// Factory uses Partial<unknown> instead of Partial<Stripe.Price> because
// stripe-node 22's published types tightened around `unit_amount_decimal`
// (now branded Decimal, not string) and removed `aggregate_usage` from
// Recurring — those don't matter for what we're testing (price validation
// only reads unit_amount, currency, interval, lookup_key, active, type).
function price(overrides: Record<string, unknown> = {}): Stripe.Price {
  return {
    id: "price_test",
    object: "price",
    active: true,
    billing_scheme: "per_unit",
    created: 0,
    currency: "usd",
    custom_unit_amount: null,
    livemode: false,
    lookup_key: "premium_monthly",
    metadata: {},
    nickname: null,
    product: "prod_test",
    recurring: {
      interval: "month",
      interval_count: 1,
      meter: null,
      trial_period_days: null,
      usage_type: "licensed"
    },
    tax_behavior: "unspecified",
    tiers_mode: null,
    transform_quantity: null,
    type: "recurring",
    unit_amount: 800,
    ...overrides
  } as unknown as Stripe.Price;
}

describe("validateStripePriceForPlan", () => {
  it("accepts the current monthly Premium contract", () => {
    expect(validateStripePriceForPlan(price(), "monthly", "premium_monthly")).toEqual({
      ok: true
    });
  });

  it("rejects a lookup key that points at the wrong amount", () => {
    expect(
      validateStripePriceForPlan(price({ unit_amount: 900 }), "monthly", "premium_monthly")
    ).toEqual({
      ok: false,
      reason: "amount_mismatch"
    });
  });

  it("rejects a monthly lookup key that points at a yearly interval", () => {
    expect(
      validateStripePriceForPlan(
        price({
          recurring: {
            interval: "year",
            interval_count: 1,
            meter: null,
            trial_period_days: null,
            usage_type: "licensed"
          }
        }),
        "monthly",
        "premium_monthly"
      )
    ).toEqual({
      ok: false,
      reason: "interval_mismatch"
    });
  });
});
