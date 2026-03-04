export type UserRole = "student" | "professor" | "admin";

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

const TRUST_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days
const IP_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24; // 24 hours
const TRUST_DEVICE_COOKIE_NAME = "ue_trust_device";
const APPROVED_IP_COOKIE_NAME = "ue_ip_ok";

export function getClientIp(headers: Headers): string | null {
  const cloudflareIp = headers.get("cf-connecting-ip")?.trim();
  if (cloudflareIp) return cloudflareIp;

  const realIp = headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }

  return null;
}

export const extractClientIpFromHeaders = getClientIp;

export function userAgentSnippet(raw: string | null | undefined) {
  if (!raw) return "Unknown device";
  return raw.slice(0, 180);
}

export async function sha256Hex(input: string): Promise<string> {
  const encoded = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", encoded);
  return bytesToHex(new Uint8Array(hash));
}

export async function hashIpForStorage(ip: string, pepper?: string): Promise<string> {
  const normalized = ip.trim();
  const guard = pepper ?? process.env.IP_APPROVAL_PEPPER ?? "";
  return sha256Hex(`${normalized}::${guard}`);
}

export async function hashTokenForChallenge(token: string, pepper?: string): Promise<string> {
  const guard = pepper ?? process.env.IP_APPROVAL_PEPPER ?? "";
  return sha256Hex(`${token}::${guard}`);
}

export function createChallengeToken(bytes = 32) {
  const chunk = new Uint8Array(bytes);
  crypto.getRandomValues(chunk);
  return bytesToHex(chunk);
}

export function maskIpHash(ipHash: string) {
  if (ipHash.length < 12) return ipHash;
  return `${ipHash.slice(0, 6)}…${ipHash.slice(-6)}`;
}

export function shouldRequireIpApproval(params: {
  role: UserRole;
  mfaEnabled: boolean;
  extraSigninProtection: boolean;
}) {
  if (params.role === "professor" || params.role === "admin") return true;
  if (params.extraSigninProtection) return true;
  return false;
}

function getCookieSigningSecret() {
  return (
    process.env.IP_COOKIE_SIGNING_SECRET ||
    process.env.IP_APPROVAL_PEPPER ||
    ""
  );
}

function toBase64Url(value: string) {
  const bytes = new TextEncoder().encode(value);
  const binary = String.fromCharCode(...bytes);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

async function hmacHex(value: string, secret: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return bytesToHex(new Uint8Array(signature));
}

async function signCookiePayload(payload: Record<string, unknown>) {
  const secret = getCookieSigningSecret();
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = await hmacHex(encodedPayload, secret);
  return `${encodedPayload}.${signature}`;
}

async function verifySignedCookie<T extends Record<string, unknown>>(value: string | null | undefined) {
  if (!value) return null;
  const [encodedPayload, signature] = value.split(".");
  if (!encodedPayload || !signature) return null;

  const secret = getCookieSigningSecret();
  const expected = await hmacHex(encodedPayload, secret);
  if (expected !== signature) return null;

  try {
    return JSON.parse(fromBase64Url(encodedPayload)) as T;
  } catch {
    return null;
  }
}

export function getTrustDeviceCookieName() {
  return TRUST_DEVICE_COOKIE_NAME;
}

export function getApprovedIpCookieName() {
  return APPROVED_IP_COOKIE_NAME;
}

export async function createSignedTrustDeviceCookieValue(userId: string) {
  const expiresAt = Date.now() + TRUST_COOKIE_MAX_AGE_SECONDS * 1000;
  return signCookiePayload({ u: userId, e: expiresAt });
}

export async function isValidTrustDeviceCookie(cookieValue: string | null | undefined, userId: string) {
  const payload = await verifySignedCookie<{ u?: string; e?: number }>(cookieValue);
  if (!payload?.u || !payload?.e) return false;
  if (payload.u !== userId) return false;
  if (Date.now() > payload.e) return false;
  return true;
}

export async function createSignedApprovedIpCookieValue(ipHash: string) {
  const expiresAt = Date.now() + IP_COOKIE_MAX_AGE_SECONDS * 1000;
  return signCookiePayload({ i: ipHash, e: expiresAt });
}

export async function isValidApprovedIpCookie(cookieValue: string | null | undefined, ipHash: string) {
  const payload = await verifySignedCookie<{ i?: string; e?: number }>(cookieValue);
  if (!payload?.i || !payload?.e) return false;
  if (payload.i !== ipHash) return false;
  if (Date.now() > payload.e) return false;
  return true;
}
