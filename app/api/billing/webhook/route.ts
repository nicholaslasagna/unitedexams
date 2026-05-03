/**
 * Stripe webhook — the ONLY trusted writer of subscription state.
 *
 * Critical invariants:
 *   - Node runtime (we need stripe.webhooks.constructEvent which uses Node crypto).
 *   - Raw body via req.text() — JSON-parsing first would mutate the bytes
 *     Stripe signed and signature verification would fail.
 *   - Signature verification with STRIPE_WEBHOOK_SECRET. NO exceptions.
 *   - Idempotent: each event id is recorded in public.stripe_event_log
 *     once. Stripe retries land as 200 no-ops.
 *   - Service-role Supabase client bypasses RLS. Never use the cookie-
 *     bound client here — webhooks have no user session.
 *   - Stage-6 trigger on public.subscriptions does the entitlement
 *     recompute automatically; this route only writes the table.
 */

import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { getStripeClient } from "@/lib/billing/stripe";
import { getBillingEnv } from "@/lib/billing/env";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { stripeSubscriptionToRow } from "@/lib/billing/sync";

export const runtime = "nodejs"; // crypto.timingSafeEqual / Stripe SDK
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const stripe = getStripeClient();
  const env = getBillingEnv();
  const admin = getSupabaseAdminClient();

  if (!stripe || !env || !admin) {
    // Don't 5xx — Stripe would retry forever. 503 is honored as
    // "endpoint unavailable" and Stripe will surface it in the dashboard.
    return NextResponse.json({ error: "Billing not configured." }, { status: 503 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  // CRITICAL: read raw body BEFORE parsing.
  let raw: string;
  try {
    raw = await req.text();
  } catch {
    return NextResponse.json({ error: "Could not read body." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, env.webhookSecret);
  } catch {
    // Signature mismatch — never trust this payload, never echo the
    // verifier's error text (it can leak partial timing details).
    return NextResponse.json({ error: "Signature verification failed." }, { status: 400 });
  }

  // ── Idempotency: record this event id; bail if it's a duplicate ──
  // CRITICAL: we record the event id BEFORE processing. If processing
  // then fails (we return 5xx), Stripe retries — but a stale event-log
  // row would make the retry skip the work. We therefore DELETE the
  // row in the failure path so retries can re-enter.
  const insertEvent = await admin
    .from("stripe_event_log")
    .insert({ event_id: event.id, event_type: event.type })
    .select("event_id");

  if (insertEvent.error) {
    // Postgres unique-violation → already processed.
    if (insertEvent.error.code === "23505") {
      return NextResponse.json({ ok: true, duplicate: true });
    }
    // Anything else: log via audit, return 500 so Stripe retries.
    await safeAudit(admin, null, "stripe.webhook", "stripe_event", event.id, "error", {
      stage: "event_log_insert",
      message: insertEvent.error.message
    });
    return NextResponse.json({ error: "Could not record event." }, { status: 500 });
  }

  // Helper: undo the event-log insert so the next Stripe retry actually
  // re-runs the handler instead of being short-circuited as a duplicate.
  const releaseEventLog = async () => {
    try {
      await admin.from("stripe_event_log").delete().eq("event_id", event.id);
    } catch {
      // Best-effort. If this fails, the event is dropped permanently —
      // the audit_log row tells us which event needs manual replay.
    }
  };

  // ── Dispatch ──────────────────────────────────────────────────────
  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;

        // First pass: try sync using subscription.metadata.user_id only.
        let sync = stripeSubscriptionToRow(sub, env);

        // Fallback: if the subscription had no usable metadata.user_id,
        // expand the customer once and retry. This catches subscriptions
        // created out-of-band (Stripe dashboard) where the operator
        // remembered to set customer.metadata.user_id but not the sub's.
        if (!sync.ok && sync.reason === "missing_user_id") {
          const customerRef =
            typeof sub.customer === "string" ? sub.customer : sub.customer?.id ?? null;
          if (customerRef) {
            try {
              const customer = await stripe.customers.retrieve(customerRef);
              sync = stripeSubscriptionToRow(sub, env, customer);
            } catch {
              // Network/API failure — keep the original missing_user_id
              // result. Auditing below makes the issue visible.
            }
          }
        }

        if (!sync.ok) {
          await safeAudit(admin, null, "stripe.webhook", "subscription", sub.id, "error", {
            event_type: event.type,
            reason: sync.reason,
            detail: sync.detail
          });
          // 200 with `skipped` so Stripe doesn't retry forever. Generic
          // CLI-trigger events land here cleanly with reason='missing_user_id'
          // or 'unknown_lookup_key'. No subscription row is written.
          return NextResponse.json({ ok: true, skipped: sync.reason });
        }

        // For .deleted, force the status to canceled regardless of what
        // Stripe sent — matches the existing CHECK constraint vocabulary.
        const row =
          event.type === "customer.subscription.deleted"
            ? { ...sync.row, status: "canceled" as const }
            : sync.row;

        const upsert = await admin
          .from("subscriptions")
          .upsert(row, { onConflict: "stripe_subscription_id" });

        if (upsert.error) {
          // FK violation (Postgres 23503) means the user_id doesn't
          // exist in profiles — typically because the account was
          // deleted while the subscription remained in Stripe. Don't
          // retry forever; audit + 200 so an operator can clean up.
          const isOrphanedUser = upsert.error.code === "23503";
          await safeAudit(admin, row.user_id, "stripe.webhook", "subscription", sub.id, "error", {
            event_type: event.type,
            stage: "upsert",
            message: upsert.error.message,
            orphaned_user: isOrphanedUser
          });
          if (isOrphanedUser) {
            // No retry — the Stripe sub references a Supabase user that
            // doesn't exist any more. Operator should cancel the sub.
            return NextResponse.json({ ok: true, skipped: "orphaned_user" });
          }
          // Transient DB error — release the event log so Stripe retries
          // and the next attempt can succeed.
          await releaseEventLog();
          return NextResponse.json({ error: "Upsert failed." }, { status: 500 });
        }

        await safeAudit(admin, row.user_id, "stripe.webhook", "subscription", sub.id, "success", {
          event_type: event.type,
          plan: row.plan,
          status: row.status
        });
        // The Stage-6 trigger has already called recompute_entitlements()
        // and the Stage-1 mirror columns on profiles are now updated.
        return NextResponse.json({ ok: true });
      }

      case "checkout.session.completed": {
        // Optional safety net: if the placeholder subscriptions row
        // didn't yet have a stripe_customer_id, attach it now.
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id ?? session.client_reference_id ?? null;
        const customerId =
          typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
        if (userId && customerId) {
          await admin
            .from("subscriptions")
            .update({ stripe_customer_id: customerId })
            .eq("user_id", userId)
            .is("stripe_customer_id", null);
        }
        await safeAudit(admin, userId, "stripe.webhook", "checkout_session", session.id, "success", {
          event_type: event.type
        });
        return NextResponse.json({ ok: true });
      }

      case "invoice.payment_succeeded":
      case "invoice.payment_failed": {
        // Entitlement state is driven by the next subscription.updated.
        // Just log this for the audit trail.
        const inv = event.data.object as Stripe.Invoice;
        await safeAudit(admin, null, "stripe.webhook", "invoice", inv.id ?? "", "success", {
          event_type: event.type,
          amount_due: inv.amount_due,
          amount_paid: inv.amount_paid
        });
        return NextResponse.json({ ok: true });
      }

      default: {
        // Unrecognised but signature-valid event — just record it.
        await safeAudit(admin, null, "stripe.webhook", "stripe_event", event.id, "success", {
          event_type: event.type,
          ignored: true
        });
        return NextResponse.json({ ok: true, ignored: true });
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown handler error";
    await safeAudit(admin, null, "stripe.webhook", "stripe_event", event.id, "error", {
      event_type: event.type,
      message
    });
    // Release the event-log row so Stripe's retry can re-enter.
    await releaseEventLog();
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }
}

// ── helpers ──────────────────────────────────────────────────────────

type Admin = NonNullable<ReturnType<typeof getSupabaseAdminClient>>;

async function safeAudit(
  admin: Admin,
  actorUserId: string | null,
  action: string,
  targetType: string,
  targetId: string,
  outcome: "success" | "error" | "denied",
  metadata: Record<string, unknown>
): Promise<void> {
  try {
    await admin.rpc("audit_record_event", {
      actor_user_id_input: actorUserId,
      action_input: action,
      target_type_input: targetType,
      target_id_input: targetId,
      outcome_input: outcome,
      metadata_input: metadata
    });
  } catch {
    // Audit must never block the webhook response.
  }
}
