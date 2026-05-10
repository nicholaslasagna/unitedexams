import type Stripe from "stripe";

export type CheckoutPaymentMethodType = Stripe.Checkout.SessionCreateParams.PaymentMethodType;

const HOSTED_CHECKOUT_PAYMENT_METHODS = new Set<CheckoutPaymentMethodType>([
  "card",
  "link",
  "paypal"
]);

export function parseCheckoutPaymentMethodTypes(
  raw: string | undefined
):
  | { ok: true; paymentMethodTypes: CheckoutPaymentMethodType[] | null }
  | { ok: false; reason: string } {
  const trimmed = raw?.trim();
  if (!trimmed) return { ok: true, paymentMethodTypes: null };

  const requested = trimmed
    .split(",")
    .map((method) => method.trim().toLowerCase())
    .filter(Boolean);

  if (!requested.length) return { ok: true, paymentMethodTypes: null };

  const unsupported = requested.filter(
    (method): method is string => !HOSTED_CHECKOUT_PAYMENT_METHODS.has(method as CheckoutPaymentMethodType)
  );

  if (unsupported.length) {
    return {
      ok: false,
      reason: `Unsupported Stripe Checkout payment method type(s): ${unsupported.join(", ")}. Supported backend values are card, link, paypal. Apple Pay and Google Pay are card wallets, not separate Stripe Checkout types. Venmo is not a separate Stripe Checkout subscription type.`
    };
  }

  return {
    ok: true,
    paymentMethodTypes: Array.from(new Set(requested)) as CheckoutPaymentMethodType[]
  };
}

export function checkoutPaymentMethodOptions(env: {
  checkoutPaymentMethodTypes: CheckoutPaymentMethodType[] | null;
  paymentMethodConfiguration: string | null;
}): Pick<
  Stripe.Checkout.SessionCreateParams,
  "payment_method_collection" | "payment_method_configuration" | "payment_method_types"
> {
  const options: Pick<
    Stripe.Checkout.SessionCreateParams,
    "payment_method_collection" | "payment_method_configuration" | "payment_method_types"
  > = {
    payment_method_collection: "always"
  };

  if (env.paymentMethodConfiguration) {
    options.payment_method_configuration = env.paymentMethodConfiguration;
    return options;
  }

  if (env.checkoutPaymentMethodTypes?.length) {
    options.payment_method_types = env.checkoutPaymentMethodTypes;
  }

  return options;
}
