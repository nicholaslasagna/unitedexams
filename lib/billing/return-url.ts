/**
 * Safe return-URL handling for billing flows.
 *
 * Stripe success_url / cancel_url and the Customer Portal return_url all
 * accept absolute URLs. We accept a relative path from the client and
 * stitch it onto our own origin — but we must reject anything that could
 * cause an open redirect:
 *
 *   - "//evil.com"  → starts with "/", but "//evil.com" is protocol-relative
 *                     and resolves to https://evil.com after browsers
 *                     normalise the URL.
 *   - "/\evil.com"  → backslash variants (some browsers treat \ as /)
 *   - "https://..." → absolute URL outside our origin
 *
 * Returns a sanitised path that always begins with "/" + an alphanumeric
 * character (or null if the input was unsafe — caller picks the default).
 */

const SAFE_PATH = /^\/[A-Za-z0-9_/.?&%=#@:+-]*$/;

export function safeReturnPath(input: string | null | undefined, fallback: string): string {
  if (typeof input !== "string") return fallback;
  const trimmed = input.trim();

  // Must start with "/" but not "//", "/\", or other protocol-like prefixes.
  if (!trimmed.startsWith("/")) return fallback;
  if (trimmed.startsWith("//")) return fallback;
  if (trimmed.startsWith("/\\")) return fallback;
  if (trimmed.startsWith("/%2F") || trimmed.startsWith("/%5C")) return fallback;

  // Whitelist allowed characters — disallow newlines, control chars, etc.
  if (!SAFE_PATH.test(trimmed)) return fallback;

  // Cap length to avoid Stripe URL limits.
  if (trimmed.length > 1024) return fallback;

  return trimmed;
}

/**
 * Resolve the absolute origin we hand to Stripe. Prefer NEXT_PUBLIC_SITE_URL
 * when set so we never get spoofed by a forwarded-host header on a self-
 * hosted setup. Falls back to the request URL's origin (which is fine on
 * Vercel because Vercel sets the forwarded-host header itself).
 */
export function resolveOrigin(reqUrl: string): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    try {
      // new URL() validates the input; .origin gives us scheme+host[:port].
      return new URL(configured).origin;
    } catch {
      // fall through
    }
  }
  return new URL(reqUrl).origin;
}
