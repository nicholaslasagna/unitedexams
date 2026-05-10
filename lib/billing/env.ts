import { BILLING_PRICES, type BillingPlan } from "@/lib/billing/pricing";
import {
  parseCheckoutPaymentMethodTypes,
  type CheckoutPaymentMethodType
} from "@/lib/billing/payment-methods";

/**
 * Server-only billing env. Never imported from client modules.
 *
 * Two helper shapes:
 *   - getBillingEnv() returns null when any required secret is missing.
 *     Routes use this to render a clean 503 instead of crashing during
 *     local dev or in environments where Stripe simply isn't configured
 *     yet (e.g. preview deployments without secrets).
 *   - requireBillingEnv() throws — only call inside paths you've already
 *     proved are reachable (i.e. after a getBillingEnv() check).
 */

export interface BillingEnv {
  secretKey: string;
  webhookSecret: string;
  priceLookupMonthly: string;
  priceLookupYearly: string;
  checkoutPaymentMethodTypes: CheckoutPaymentMethodType[] | null;
  paymentMethodConfiguration: string | null;
}

export function getBillingEnv(): BillingEnv | null {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  const priceLookupMonthly =
    process.env.STRIPE_PRICE_LOOKUP_MONTHLY?.trim() || BILLING_PRICES.monthly.lookupKey;
  const priceLookupYearly =
    process.env.STRIPE_PRICE_LOOKUP_YEARLY?.trim() || BILLING_PRICES.yearly.lookupKey;
  const paymentMethodTypes = parseCheckoutPaymentMethodTypes(
    process.env.STRIPE_CHECKOUT_PAYMENT_METHOD_TYPES
  );
  const paymentMethodConfiguration =
    process.env.STRIPE_PAYMENT_METHOD_CONFIGURATION?.trim() || null;

  if (!secretKey || !webhookSecret || !paymentMethodTypes.ok) return null;

  return {
    secretKey,
    webhookSecret,
    priceLookupMonthly,
    priceLookupYearly,
    checkoutPaymentMethodTypes: paymentMethodTypes.paymentMethodTypes,
    paymentMethodConfiguration
  };
}

export function isBillingConfigured(): boolean {
  return getBillingEnv() !== null;
}

/**
 * Resolve a Stripe price lookup key from a billing-plan identifier.
 * Centralized so we never accept a raw price id from a client.
 */
export function planLookupKey(plan: BillingPlan, env: BillingEnv): string {
  return plan === "yearly" ? env.priceLookupYearly : env.priceLookupMonthly;
}
