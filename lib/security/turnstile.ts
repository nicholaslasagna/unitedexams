import { getClientIp } from "@/lib/auth/ip-protection";

interface VerifyTurnstileOptions {
  expectedAction?: string;
  remoteIp?: string | null;
  softFail?: boolean;
}

interface TurnstileVerifyResponse {
  success: boolean;
  action?: string;
  hostname?: string;
  challenge_ts?: string;
  "error-codes"?: string[];
}

export interface TurnstileVerificationResult {
  ok: boolean;
  skipped?: boolean;
  reason?: string;
  errors?: string[];
}

export function getTurnstileSiteKey() {
  return process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || "";
}

export function getTurnstileSecretKey() {
  return process.env.TURNSTILE_SECRET_KEY?.trim() || "";
}

export function isTurnstileConfigured() {
  return Boolean(getTurnstileSiteKey() && getTurnstileSecretKey());
}

export function getTurnstileClientIp(headers: Headers) {
  return getClientIp(headers);
}

export async function verifyTurnstileToken(
  token: string,
  options: VerifyTurnstileOptions = {}
): Promise<TurnstileVerificationResult> {
  const secret = getTurnstileSecretKey();

  if (!secret) {
    return {
      ok: true,
      skipped: true,
      reason: "TURNSTILE_SECRET_KEY is not configured."
    };
  }

  const responseToken = token.trim();
  if (!responseToken) {
    return { ok: false, reason: "Missing Turnstile token." };
  }

  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", responseToken);
  if (options.remoteIp) {
    body.set("remoteip", options.remoteIp);
  }

  let response: Response;
  try {
    response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: body.toString(),
      cache: "no-store"
    });
  } catch (error) {
    if (options.softFail) {
      return {
        ok: true,
        skipped: true,
        reason: `Turnstile verify unavailable: ${(error as Error).message}`
      };
    }
    return {
      ok: false,
      reason: "Turnstile verification service unavailable."
    };
  }

  let payload: TurnstileVerifyResponse;
  try {
    payload = (await response.json()) as TurnstileVerifyResponse;
  } catch {
    return {
      ok: false,
      reason: "Turnstile verification returned an invalid response."
    };
  }

  if (!response.ok || !payload.success) {
    return {
      ok: false,
      reason: "Turnstile verification failed.",
      errors: payload["error-codes"] ?? []
    };
  }

  if (options.expectedAction && payload.action && payload.action !== options.expectedAction) {
    return {
      ok: false,
      reason: "Turnstile action mismatch."
    };
  }

  return { ok: true };
}
