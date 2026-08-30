import { afterEach, describe, expect, it, vi } from "vitest";
import { getClientIp } from "./ip-protection";

/**
 * The IP this returns decides whether a login needs approval, whether a
 * student is on an exam's allowed network, and what the audit log records.
 * `x-forwarded-for` and `x-real-ip` are attacker-supplied unless a proxy we
 * control rewrote them, so the property under test is *which* header is
 * believed, not how the value is parsed.
 */
const headers = (init: Record<string, string>) => new Headers(init);

afterEach(() => {
  vi.unstubAllEnvs();
});

/** Production without the opt-in: only Cloudflare's header is believed. */
function inProduction() {
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("TRUST_PROXY_IP_HEADERS", "");
}

describe("getClientIp", () => {
  it("trusts cf-connecting-ip, which the edge overwrites", () => {
    inProduction();
    expect(getClientIp(headers({ "cf-connecting-ip": "203.0.113.7" }))).toBe("203.0.113.7");
  });

  it("ignores a spoofed x-forwarded-for when Cloudflare has spoken", () => {
    inProduction();
    const ip = getClientIp(
      headers({ "cf-connecting-ip": "203.0.113.7", "x-forwarded-for": "198.51.100.9" })
    );
    expect(ip).toBe("203.0.113.7");
  });

  it("refuses client-supplied headers in production rather than believing them", () => {
    // The exploit this closes: send x-real-ip and you choose which IP the
    // exam network allowlist and login-approval checks see.
    inProduction();
    expect(getClientIp(headers({ "x-real-ip": "198.51.100.9" }))).toBeNull();
    expect(getClientIp(headers({ "x-forwarded-for": "198.51.100.9" }))).toBeNull();
  });

  it("honours proxy headers once the deployment opts in", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("TRUST_PROXY_IP_HEADERS", "true");
    expect(getClientIp(headers({ "x-real-ip": "198.51.100.9" }))).toBe("198.51.100.9");
  });

  it("reads x-forwarded-for from the end, where the proxy appends", () => {
    // A client that sends "1.2.3.4" gets the real address appended after
    // it. Taking the first entry would hand the caller their own answer.
    vi.stubEnv("TRUST_PROXY_IP_HEADERS", "true");
    expect(getClientIp(headers({ "x-forwarded-for": "1.2.3.4, 203.0.113.7" }))).toBe("203.0.113.7");
  });

  it("returns null when nothing usable is present", () => {
    expect(getClientIp(headers({}))).toBeNull();
  });

  it("rejects values that are not IP literals", () => {
    // These get hashed into allowlists and written to the audit log.
    for (const junk of ["not-an-ip", "999.1.1.1", "<script>", "", "   ", "1.2.3"]) {
      expect(getClientIp(headers({ "cf-connecting-ip": junk })), junk).toBeNull();
    }
  });

  it("normalises ports and brackets off real addresses", () => {
    expect(getClientIp(headers({ "cf-connecting-ip": "203.0.113.7:41234" }))).toBe("203.0.113.7");
    expect(getClientIp(headers({ "cf-connecting-ip": "[2001:db8::1]:443" }))).toBe("2001:db8::1");
    expect(getClientIp(headers({ "cf-connecting-ip": "2001:db8::1" }))).toBe("2001:db8::1");
    expect(getClientIp(headers({ "cf-connecting-ip": "::ffff:203.0.113.7" }))).toBe(
      "::ffff:203.0.113.7"
    );
  });
});
