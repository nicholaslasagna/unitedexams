import type { Metadata } from "next";
import { UpgradePageContent } from "@/features/billing/upgrade-page";

export const metadata: Metadata = {
  title: "Go Premium",
  description:
    "Unlock the full United Exams library — saved progress, mistake history, exam simulations, and per-topic mastery. Hosted Stripe Checkout supports cards, Apple Pay, Google Pay, Link, and PayPal."
};

// Force dynamic rendering — this page reads `useSearchParams()` for the
// post-checkout `?billing=success|canceled` state and is per-user, so
// there's no value in static prerendering it. Without this, the build
// fails with a "useSearchParams() should be wrapped in a suspense
// boundary" CSR bailout during static export.
export const dynamic = "force-dynamic";

export default function UpgradePage() {
  return <UpgradePageContent />;
}
