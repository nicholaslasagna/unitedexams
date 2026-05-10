import { describe, expect, it } from "vitest";
import {
  checkoutPaymentMethodOptions,
  parseCheckoutPaymentMethodTypes
} from "../../lib/billing/payment-methods";

describe("parseCheckoutPaymentMethodTypes", () => {
  it("uses Stripe Dashboard dynamic payment methods when unset", () => {
    expect(parseCheckoutPaymentMethodTypes(undefined)).toEqual({
      ok: true,
      paymentMethodTypes: null
    });
  });

  it("accepts hosted third-party rails supported by Stripe Checkout", () => {
    expect(parseCheckoutPaymentMethodTypes("card, link, paypal, card")).toEqual({
      ok: true,
      paymentMethodTypes: ["card", "link", "paypal"]
    });
  });

  it("rejects Venmo as a hard-coded Stripe Checkout subscription type", () => {
    const result = parseCheckoutPaymentMethodTypes("card,venmo");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toContain("Venmo is not a separate Stripe Checkout subscription type");
    }
  });
});

describe("checkoutPaymentMethodOptions", () => {
  it("prefers a Stripe Payment Method Configuration over explicit method types", () => {
    expect(
      checkoutPaymentMethodOptions({
        checkoutPaymentMethodTypes: ["card", "link", "paypal"],
        paymentMethodConfiguration: "pmc_test"
      })
    ).toEqual({
      payment_method_collection: "always",
      payment_method_configuration: "pmc_test"
    });
  });
});
