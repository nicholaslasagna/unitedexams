export type UserRole = "student" | "professor" | "admin";

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

export function extractClientIpFromHeaders(headers: Headers): string | null {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  const vercelForwarded = headers.get("x-vercel-forwarded-for")?.trim();
  if (vercelForwarded) return vercelForwarded;

  return null;
}

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
