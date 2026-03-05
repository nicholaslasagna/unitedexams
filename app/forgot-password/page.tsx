"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { TurnstileWidget } from "@/components/auth/turnstile-widget";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  isTurnstileClientEnabled
} from "@/lib/security/turnstile-client";

function mapAuthError(message: string, captchaEnabled: boolean) {
  if (!message) return "Unable to send reset link.";
  const normalized = message.toLowerCase();
  if (
    captchaEnabled &&
    (normalized.includes("captcha") || normalized.includes("challenge") || normalized.includes("turnstile"))
  ) {
    return "Please complete the verification challenge and try again.";
  }
  return message;
}

export default function ForgotPasswordPage() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [captchaRenderKey, setCaptchaRenderKey] = useState(0);
  const turnstileEnabled = isTurnstileClientEnabled();
  const errorRef = useRef<HTMLParagraphElement | null>(null);
  const errorId = "forgot-password-form-error";

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!supabase) {
      setError("Supabase is not configured. Add environment variables first.");
      return;
    }

    if (turnstileEnabled && !turnstileToken) {
      setError("Please complete the verification challenge.");
      return;
    }

    setLoading(true);

    const redirectTo = `${window.location.origin}/reset-password`;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
      captchaToken: turnstileEnabled ? (turnstileToken ?? "") : undefined
    });
    setCaptchaRenderKey((value) => value + 1);
    setTurnstileToken(null);

    if (resetError) {
      setError(mapAuthError(resetError.message, turnstileEnabled));
      setLoading(false);
      return;
    }

    // Mark reset-required flag without revealing if account exists.
    await supabase.rpc("request_password_reset", { target_email: email.trim() });

    setLoading(false);
    setDone(true);
  };

  return (
    <AuthShell
      title="Forgot password"
      subtitle="We’ll send a reset link if an account exists for this email."
      footer={
        <p>
          Remembered it?{" "}
          <Link href="/login" className="font-semibold text-accent hover:text-white">
            Back to sign in
          </Link>
        </p>
      }
    >
      {done ? (
        <div className="rounded-xl border border-success/30 bg-success/10 p-4 text-sm text-white/80">
          If an account exists for <span className="font-semibold text-white">{email}</span>, a reset link is on the way.
        </div>
      ) : (
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-semibold uppercase tracking-[0.14em] text-white/60">
              Email
            </label>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@university.edu"
            />
          </div>

          {error ? (
            <p
              id={errorId}
              ref={errorRef}
              tabIndex={-1}
              role="alert"
              aria-live="assertive"
              className="rounded-lg border border-danger/35 bg-danger/10 px-3 py-2 text-sm text-danger outline-none"
            >
              {error}
            </p>
          ) : null}

          {turnstileEnabled ? (
            <TurnstileWidget
              key={captchaRenderKey}
              action="forgot-password"
              onToken={setTurnstileToken}
              describedBy={error ? errorId : undefined}
            />
          ) : (
            <p className="rounded-lg border border-warn/35 bg-warn/10 px-3 py-2 text-xs text-warn">
              Human verification is not configured. Set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` in Vercel and redeploy.
            </p>
          )}

          <Button
            type="submit"
            className="w-full"
            loading={loading}
            disabled={turnstileEnabled && !turnstileToken}
          >
            Send reset link
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
