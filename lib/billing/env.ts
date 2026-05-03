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
}

export function getBillingEnv(): BillingEnv | null {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  const priceLookupMonthly =
    process.env.STRIPE_PRICE_LOOKUP_MONTHLY?.trim() || "premium_monthly";
  const priceLookupYearly =
    process.env.STRIPE_PRICE_LOOKUP_YEARLY?.trim() || "premium_yearly";

  if (!secretKey || !webhookSecret) return null;

  return {
    secretKey,
    webhookSecret,
    priceLookupMonthly,
    priceLookupYearly
  };
}

export function isBillingConfigured(): boolean {
  return getBillingEnv() !== null;
}

/**
 * Resolve a Stripe price lookup key from a billing-plan identifier.
 * Centralized so we never accept a raw price id from a client.
 */
export function planLookupKey(plan: "monthly" | "yearly", env: BillingEnv): string {
  return plan === "yearly" ? env.priceLookupYearly : env.priceLookupMonthly;
}
