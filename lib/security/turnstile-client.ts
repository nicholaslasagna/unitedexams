export function isTurnstileClientEnabled() {
  return Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
}

interface VerifyTurnstileClientInput {
  token: string;
  action: "signup" | "login" | "forgot-password" | "reset-password";
}

export async function verifyTurnstileClient({
  token,
  action
}: VerifyTurnstileClientInput) {
  const response = await fetch("/api/security/turnstile/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token,
      action
    })
  });

  const payload = (await response.json().catch(() => ({}))) as {
    ok?: boolean;
    error?: string;
  };

  if (!response.ok || !payload.ok) {
    throw new Error(payload.error || "Turnstile verification failed.");
  }
}
