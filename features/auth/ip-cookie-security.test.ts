import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Regression tests for the IP-trust / approved-IP signed-cookie layer.
 *
 * The security property under test: when no signing secret is configured
 * (IP_COOKIE_SIGNING_SECRET / IP_APPROVAL_PEPPER both unset), the cookie
 * verification MUST fail closed — an empty HMAC key is publicly
 * computable, so accepting empty-key signatures would let anyone forge a
 * cookie that skips the IP-approval second factor.
 */

const ORIGINAL_ENV = { ...process.env };

async function freshModule() {
  // Re-import with the current process.env so getCookieSigningSecret()
  // re-resolves. Vitest caches modules per registry; reset first.
  vi.resetModules();
  return import("../../lib/auth/ip-protection");
}

beforeEach(() => {
  delete process.env.IP_COOKIE_SIGNING_SECRET;
  delete process.env.IP_APPROVAL_PEPPER;
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.resetModules();
});

describe("approved-IP cookie signing", () => {
  it("round-trips a valid cookie when a secret is configured", async () => {
    process.env.IP_COOKIE_SIGNING_SECRET = "a-strong-secret-value-1234567890";
    const mod = await freshModule();
    const cookie = await mod.createSignedApprovedIpCookieValue("hash-abc");
    expect(await mod.isValidApprovedIpCookie(cookie, "hash-abc")).toBe(true);
    // Wrong ipHash must not validate even with a good signature.
    expect(await mod.isValidApprovedIpCookie(cookie, "hash-xyz")).toBe(false);
  });

  it("fails closed: cookies issued while unconfigured never verify", async () => {
    const mod = await freshModule();
    const cookie = await mod.createSignedApprovedIpCookieValue("hash-abc");
    // No secret configured → the issued cookie must not validate.
    expect(await mod.isValidApprovedIpCookie(cookie, "hash-abc")).toBe(false);
  });

  it("fails closed for trust-device cookies without a secret", async () => {
    const mod = await freshModule();
    const cookie = await mod.createSignedTrustDeviceCookieValue("user-123");
    expect(await mod.isValidTrustDeviceCookie(cookie, "user-123")).toBe(false);
  });
});
