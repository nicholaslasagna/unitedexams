/**
 * Create a Stripe Checkout Session for the authenticated user.
 *
 * Trust boundary: the client supplies only `plan` (monthly | yearly) and
 * an optional return path. The actual price id is resolved server-side
 * from STRIPE_PRICE_LOOKUP_* env vars — clients can never request a
 * different price.
 *
 * The real activation of Premium happens via the webhook. This route's
 * job is only to (a) ensure exactly one Stripe customer exists for the
 * user (idempotent across DB-loss / duplicate-click scenarios), (b)
 * refuse to start a fresh checkout if the user already has an active
 * Premium subscription (route them to the Customer Portal instead), and
 * (c) hand back a Checkout URL.
 */

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getStripeClient } from "@/lib/billing/stripe";
import { getBillingEnv, planLookupKey } from "@/lib/billing/env";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { resolveOrigin, safeReturnPath } from "@/lib/billing/return-url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  plan: z.enum(["monthly", "yearly"]),
  returnUrl: z.string().trim().max(2048).optional()
});

export async function POST(req: NextRequest) {
  const stripe = getStripeClient();
  const env = getBillingEnv();
  const admin = getSupabaseAdminClient();
  const supabase = await createSupabaseServerClient();

  if (!stripe || !env || !admin || !supabase) {
    return NextResponse.json({ error: "Billing not configured." }, { status: 503 });
  }

  // Auth — we only sell to signed-in users.
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to subscribe." }, { status: 401 });
  }

  // Parse body
  let payload: z.infer<typeof bodySchema>;
  try {
    payload = bodySchema.parse(await req.json());
  } catch {
    // Don't echo back zod's verbose error — keep details out of the wire.
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // ── Block duplicate-subscription attempts ─────────────────────────
  // Read the current resolved access (premium / institution) for this
  // user. Source of truth is the entitlements table, set by the Stage-6
  // trigger when the webhook lands. We don't trust profile mirrors.
  const ent = await admin
    .from("entitlements")
    .select("feature, active")
    .eq("user_id", user.id)
    .in("feature", ["premium", "institution_covered"]);

  if (ent.error) {
    return NextResponse.json({ error: "Could not verify account state." }, { status: 500 });
  }

  const isPremium = ent.data?.some((row) => row.feature === "premium" && row.active);
  const isInstitutionCovered = ent.data?.some(
    (row) => row.feature === "institution_covered" && row.active
  );

  // Institution-covered users must never reach checkout — their school
  // already covers access. Send them away with a clear hint.
  if (isInstitutionCovered) {
    return NextResponse.json({ error: "institution_covered" }, { status: 409 });
  }

  // Already-premium users get routed to the portal instead — that's
  // where plan switches happen. Avoid creating duplicate subscriptions.
  if (isPremium) {
    return NextResponse.json({ error: "already_subscribed" }, { status: 409 });
  }

  // ── Resolve price by lookup key — server-controlled ───────────────
  const lookupKey = planLookupKey(payload.plan, env);
  const prices = await stripe.prices.list({
    lookup_keys: [lookupKey],
    active: true,
    limit: 1
  });
  const price = prices.data[0];
  if (!price) {
    // Operator-facing config error — don't leak the lookup key value.
    return NextResponse.json({ error: "Subscription plan unavailable." }, { status: 500 });
  }

  // ── Find or create the Stripe customer (idempotent) ───────────────
  // First try our DB. Then try Stripe's customer search by metadata
  // (handles "we created the customer in Stripe but lost the DB row"
  // and prevents duplicates on rapid double-clicks).
  let customerId: string | null = null;

  const existing = await admin
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .not("stripe_customer_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  customerId = existing.data?.stripe_customer_id ?? null;

  if (!customerId) {
    // Search Stripe for an existing customer pinned to this user.
    try {
      const found = await stripe.customers.search({
        query: `metadata['user_id']:'${user.id.replace(/'/g, "")}'`,
        limit: 1
      });
      if (found.data[0]) {
        customerId = found.data[0].id;
      }
    } catch {
      // Search is best-effort; fall through to create.
    }
  }

  if (!customerId) {
    const customer = await stripe.customers.create(
      {
        email: user.email ?? undefined,
        metadata: { user_id: user.id }
      },
      {
        // Idempotency key tied to the user — Stripe will return the
        // same customer if this exact request runs twice within 24h
        // (e.g. user double-clicks the upgrade button).
        idempotencyKey: `customer:create:${user.id}`
      }
    );
    customerId = customer.id;
  }

  // ── Build safe return URLs ────────────────────────────────────────
  const origin = resolveOrigin(req.url);
  const returnPath = safeReturnPath(payload.returnUrl, "/app/account");

  // ── Create the Checkout session ───────────────────────────────────
  // We deliberately do NOT pass an idempotency_key on the session
  // create — if the user re-opens checkout after canceling, they should
  // get a fresh session URL. Stripe's session ids never collide.
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: price.id, quantity: 1 }],
    allow_promotion_codes: true,
    success_url: `${origin}${returnPath}?billing=success`,
    cancel_url: `${origin}${returnPath}?billing=canceled`,
    client_reference_id: user.id,
    subscription_data: {
      metadata: { user_id: user.id }
    }
  });

  if (!session.url) {
    return NextResponse.json({ error: "Could not start checkout." }, { status: 502 });
  }

  return NextResponse.json({ url: session.url });
}
