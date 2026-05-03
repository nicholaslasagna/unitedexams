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
  env: BillingEnv
): SyncResult {
  // user_id is pinned at checkout via subscription_data.metadata.user_id.
  const userId = sub.metadata?.user_id?.trim();
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
