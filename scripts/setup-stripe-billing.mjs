#!/usr/bin/env node

import Stripe from "stripe";

const args = new Set(process.argv.slice(2));
const checkOnly = args.has("--check");
const repair = args.has("--repair");

const PLANS = {
  monthly: {
    lookupKey: process.env.STRIPE_PRICE_LOOKUP_MONTHLY?.trim() || "premium_monthly",
    displayName: "United Exams Premium Monthly",
    amountCents: 800,
    currency: "usd",
    interval: "month",
    intervalCount: 1
  },
  yearly: {
    lookupKey: process.env.STRIPE_PRICE_LOOKUP_YEARLY?.trim() || "premium_yearly",
    displayName: "United Exams Premium Yearly",
    amountCents: 7200,
    currency: "usd",
    interval: "year",
    intervalCount: 1
  }
};

const EVENTS = [
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.payment_succeeded",
  "invoice.payment_failed"
];

const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
if (!secretKey) {
  console.error("Missing STRIPE_SECRET_KEY.");
  process.exit(1);
}

const stripe = new Stripe(secretKey, {
  apiVersion: "2025-02-24.acacia",
  appInfo: { name: "United Exams billing setup" }
});

function priceMatches(price, expected) {
  return (
    price.active === true &&
    price.lookup_key === expected.lookupKey &&
    price.type === "recurring" &&
    price.currency.toLowerCase() === expected.currency &&
    price.unit_amount === expected.amountCents &&
    price.recurring?.interval === expected.interval &&
    (price.recurring?.interval_count ?? 1) === expected.intervalCount
  );
}

async function resolveProductId(existingPrice) {
  if (process.env.STRIPE_PREMIUM_PRODUCT_ID?.trim()) {
    const product = await stripe.products.retrieve(process.env.STRIPE_PREMIUM_PRODUCT_ID.trim());
    if (product.deleted) throw new Error("STRIPE_PREMIUM_PRODUCT_ID points to a deleted product.");
    return product.id;
  }

  if (existingPrice?.product) {
    return typeof existingPrice.product === "string" ? existingPrice.product : existingPrice.product.id;
  }

  const product = await stripe.products.create({
    name: "United Exams Premium",
    description: "Premium student access for United Exams.",
    metadata: {
      app: "united_exams",
      product: "premium"
    }
  });
  return product.id;
}

async function ensurePrice(plan, expected) {
  const existing = await stripe.prices.list({
    lookup_keys: [expected.lookupKey],
    active: true,
    limit: 5,
    expand: ["data.product"]
  });

  const matching = existing.data.find((price) => priceMatches(price, expected));
  if (matching) {
    console.log(
      `ok ${plan}: ${matching.id} (${expected.currency.toUpperCase()} ${(expected.amountCents / 100).toFixed(2)} / ${expected.interval})`
    );
    return matching;
  }

  const wrong = existing.data[0];
  if (wrong && !repair) {
    throw new Error(
      `${plan} lookup key ${expected.lookupKey} exists but does not match the current United Exams price contract. ` +
        `Expected ${expected.amountCents} ${expected.currency} per ${expected.interval}; found ${wrong.id}. ` +
        `Run npm run billing:setup -- --repair to create a corrected price and transfer the lookup key.`
    );
  }

  if (checkOnly) {
    throw new Error(`${plan} lookup key ${expected.lookupKey} is missing.`);
  }

  const productId = await resolveProductId(wrong);
  const created = await stripe.prices.create({
    product: productId,
    currency: expected.currency,
    unit_amount: expected.amountCents,
    recurring: {
      interval: expected.interval,
      interval_count: expected.intervalCount
    },
    lookup_key: expected.lookupKey,
    transfer_lookup_key: Boolean(wrong),
    nickname: expected.displayName,
    metadata: {
      app: "united_exams",
      plan,
      price_contract: "premium_800_monthly_7200_yearly"
    }
  });

  console.log(
    `created ${plan}: ${created.id} (${expected.currency.toUpperCase()} ${(expected.amountCents / 100).toFixed(2)} / ${expected.interval})`
  );
  return created;
}

for (const [plan, expected] of Object.entries(PLANS)) {
  await ensurePrice(plan, expected);
}

console.log("");
console.log("Stripe billing price contract is ready.");
console.log("Webhook endpoint:");
console.log("  https://unitedexams.com/api/billing/webhook");
console.log("Required webhook events:");
for (const eventName of EVENTS) {
  console.log(`  - ${eventName}`);
}
console.log("");
console.log("Hosted Checkout payment method notes:");
console.log("  - Apple Pay and Google Pay are card wallets. Enable wallets + domain verification in Stripe.");
console.log("  - PayPal can be added with STRIPE_CHECKOUT_PAYMENT_METHOD_TYPES=card,link,paypal if your Stripe account is eligible.");
console.log("  - Venmo is not a separate Stripe Checkout subscription type; keep Venmo off-site/provider-handled if required.");
console.log("");
console.log("Required production env vars:");
console.log("  STRIPE_SECRET_KEY");
console.log("  STRIPE_WEBHOOK_SECRET");
console.log("  SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY");
