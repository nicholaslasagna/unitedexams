import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

if (process.env.NODE_ENV === "development") {
  initOpenNextCloudflareForDev();
}

/**
 * Security response headers.
 *
 * The app shipped with none of these - only cache-control rules in
 * public/_headers - despite handling sign-in, student coursework and
 * Stripe billing.
 *
 * Deliberately not included: a site-wide Content-Security-Policy. A correct
 * one here has to account for Turnstile, Stripe, Supabase and Google Fonts,
 * and Next's inline bootstrap script needs a nonce; shipping a guessed
 * policy would break the site in ways that are invisible until a real user
 * hits them. That belongs in its own change, rolled out report-only first.
 *
 * The code runner does not wait on that. It ships its own CSP on the
 * sandboxed frame (lib/interviews/run-code.ts), which is strictly tighter
 * than anything possible here: `connect-src 'none'` rather than a site
 * policy that necessarily allows Supabase and Stripe.
 *
 * When a site-wide policy is added, one constraint: the runner's frame is a
 * srcdoc document, so it inherits this page's policy on top of its own and
 * the stricter of the two wins. script-src must keep 'unsafe-inline'
 * 'unsafe-eval' blob: or the runner stops compiling code. A nonce-based
 * script-src satisfies that only if the nonce reaches the frame, which it
 * does not — serve the frame from its own route with its own headers first.
 */
const securityHeaders = [
  // Never let a browser second-guess a declared Content-Type.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Send the origin cross-site, the full path same-site. Keeps quiz and
  // section IDs out of other people's referer logs.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Nothing here is meant to be embedded elsewhere; blocks clickjacking of
  // the billing and account screens.
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // No part of the app asks for these, so refuse them outright.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  },
  // One year, subdomains included. No `preload` - that is a commitment to
  // an external list that is slow to undo, and is the site owner's call.
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains"
  }
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true
  },
  typedRoutes: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  }
};

export default nextConfig;
