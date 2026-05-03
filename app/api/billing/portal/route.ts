/**
 * Open the Stripe Customer Portal for the authenticated user.
 * Frontend uses this for "Manage subscription" / cancel / update card.
 */

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getStripeClient } from "@/lib/billing/stripe";
import { getBillingEnv } from "@/lib/billing/env";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { resolveOrigin, safeReturnPath } from "@/lib/billing/return-url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
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

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to manage billing." }, { status: 401 });
  }

  let payload: z.infer<typeof bodySchema>;
  try {
    payload = bodySchema.parse(await req.json().catch(() => ({})));
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Find the user's Stripe customer id.
  const row = await admin
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .not("stripe_customer_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const customerId = row.data?.stripe_customer_id;
  if (!customerId) {
    return NextResponse.json({ error: "no_customer" }, { status: 400 });
  }

  const origin = resolveOrigin(req.url);
  const returnPath = safeReturnPath(payload.returnUrl, "/app/account");

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${origin}${returnPath}`
  });

  return NextResponse.json({ url: session.url });
}
