import type Stripe from "stripe";
import type { BillingEnv } from "@/lib/billing/env";

/**
 * Pure mapping from a Stripe Subscription object to the row shape we
 * persist in `public.subscriptions`. Kept pure so we can unit-test it
 * without Stripe.
 *
 * Resolution rules:
 *   - user_id: read from subscription metadata (set during checkout).
 *     Returns { ok: false } if missing — webhook should log + skip.
 *   - plan:    derived from price.lookup_key, NOT raw price id, so
 *              dashboard price rotation never breaks us.
 *   - status:  passed through if it's in our CHECK constraint, else
 *              coerced to 'incomplete' with a logged warning.
 *
 * `current_period_end` in stripe v17+ subscriptions sometimes lives at
 * the subscription level and sometimes only on items[]. We prefer the
 * top-level field and fall back to the first item's `current_period_end`.
 */

type SubscriptionRow = {
  user_id: string;
  status: "active" | "trialing" | "past_due" | "canceled" | "paused" | "incomplete";
  plan: "monthly" | "yearly";
  stripe_customer_id: string | null;
  stripe_subscription_id: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
};

// Loose UUID v4-shaped check. We don't need crypto-grade validation —
// just enough to reject obvious garbage (e.g. cuid, "test", "1234") that
// CLI-triggered events sometimes attach to metadata. Real Supabase
// auth.users ids are always UUID v4.
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}

const ALLOWED_STATUSES: SubscriptionRow["status"][] = [
  "active",
  "trialing",
  "past_due",
  "canceled",
  "paused",
  "incomplete"
];

export type SyncResult =
  | { ok: true; row: SubscriptionRow }
  | { ok: false; reason: "missing_user_id" | "unknown_lookup_key"; detail?: string };

export function stripeSubscriptionToRow(
  sub: Stripe.Subscription,
  env: BillingEnv,
  /**
   * Optional pre-resolved customer object. The webhook can pass this
   * after expanding `sub.customer` so we can fall back to
   * `customer.metadata.user_id` when `sub.metadata.user_id` is missing
   * (e.g. subscriptions created out-of-band in the Stripe dashboard).
   */
  customer?: Stripe.Customer | Stripe.DeletedCustomer | null
): SyncResult {
  // Resolution order:
  //   1. subscription.metadata.user_id (set by our checkout route)
  //   2. customer.metadata.user_id     (also set by our checkout route)
  // Both must shape-validate as a UUID — generic CLI-trigger events
  // sometimes attach arbitrary strings here that we must reject so we
  // never write a row with a non-FK-resolvable user_id.
  let userId: string | undefined = sub.metadata?.user_id?.trim();
  if (!isUuid(userId)) {
    if (customer && !("deleted" in customer && customer.deleted)) {
      const fromCustomer = (customer as Stripe.Customer).metadata?.user_id?.trim();
      if (isUuid(fromCustomer)) {
        userId = fromCustomer;
      } else {
        userId = undefined;
      }
    } else {
      userId = undefined;
    }
  }
  if (!userId) {
    return { ok: false, reason: "missing_user_id" };
  }

  // Resolve plan via the price lookup key. Defensive: a subscription
  // with multiple items shouldn't happen for our use case but if it
  // does we read the first.
  const item = sub.items?.data?.[0];
  const lookupKey = item?.price?.lookup_key;
  let plan: SubscriptionRow["plan"];
  if (lookupKey === env.priceLookupYearly) plan = "yearly";
  else if (lookupKey === env.priceLookupMonthly) plan = "monthly";
  else
    return {
      ok: false,
      reason: "unknown_lookup_key",
      detail: lookupKey ?? "(no lookup_key)"
    };

  const status: SubscriptionRow["status"] = ALLOWED_STATUSES.includes(
    sub.status as SubscriptionRow["status"]
  )
    ? (sub.status as SubscriptionRow["status"])
    : "incomplete";

  // Period-end resolution. Stripe types narrow these timestamps as number
  // (epoch seconds). We normalise to ISO 8601 for Supabase.
  const periodEndEpoch =
    (sub as Stripe.Subscription & { current_period_end?: number | null })
      .current_period_end ??
    (item as Stripe.SubscriptionItem & { current_period_end?: number | null })
      ?.current_period_end ??
    null;
  const currentPeriodEnd =
    typeof periodEndEpoch === "number" && Number.isFinite(periodEndEpoch)
      ? new Date(periodEndEpoch * 1000).toISOString()
      : null;

  return {
    ok: true,
    row: {
      user_id: userId,
      status,
      plan,
      stripe_customer_id: typeof sub.customer === "string" ? sub.customer : sub.customer?.id ?? null,
      stripe_subscription_id: sub.id,
      current_period_end: currentPeriodEnd,
      cancel_at_period_end: Boolean(sub.cancel_at_period_end)
    }
  };
}
