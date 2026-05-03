import Stripe from "stripe";
import { getBillingEnv } from "@/lib/billing/env";

/**
 * Process-singleton Stripe client. Returns null if STRIPE_SECRET_KEY
 * isn't configured — keeps the build/dev environment usable when
 * billing isn't set up yet.
 *
 * Server-only. Never import from any "use client" component.
 */
let cached: Stripe | null = null;

export function getStripeClient(): Stripe | null {
  if (cached) return cached;
  const env = getBillingEnv();
  if (!env) return null;
  cached = new Stripe(env.secretKey, {
    // Pin the API version so silent server-side upgrades can't change
    // event payload shapes. Bump deliberately when needed.
    apiVersion: "2025-02-24.acacia",
    typescript: true,
    appInfo: { name: "United Exams", url: "https://www.unitedexams.com" }
  });
  return cached;
}

export function requireStripeClient(): Stripe {
  const client = getStripeClient();
  if (!client) {
    throw new Error("Stripe is not configured (STRIPE_SECRET_KEY missing).");
  }
  return client;
}
