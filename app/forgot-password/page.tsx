"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Inbox, KeyRound, ShieldCheck } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { TurnstileWidget } from "@/components/auth/turnstile-widget";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isTurnstileClientEnabled } from "@/lib/security/turnstile-client";
import { TurnstileNotConfiguredNotice } from "@/components/auth/turnstile-not-configured-notice";

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
      setError("We can’t reach the account service right now. Please try again in a moment.");
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

    await supabase.rpc("request_password_reset", { target_email: email.trim() });

    setLoading(false);
    setDone(true);
  };

  return (
    <AuthShell
      title="Forgot password"
      subtitle="Request a secure reset link without exposing whether the account exists."
      eyebrow="Account recovery"
      heroTitle={<>Recover access without losing your place.</>}
      heroDescription="Recovery keeps the account workflow private. If the email exists, the user gets a reset link and can return directly to the app." 
      heroStats={[
        { label: "Delivery", value: "Email link", detail: "Sent only if the account exists" },
        { label: "Privacy", value: "Quiet", detail: "No account enumeration on the page" },
        { label: "Return", value: "Reset + login", detail: "Back into the app after password update" }
      ]}
      heroAside={
        <div className="grid gap-3">
          {[
            {
              icon: Inbox,
              title: "Request the reset",
              detail: "Enter the email tied to the account. The response stays neutral either way."
            },
            {
              icon: KeyRound,
              title: "Use the secure link",
              detail: "The reset flow routes the user into the password update page without extra guesswork."
            },
            {
              icon: ShieldCheck,
              title: "Bot-resistant by default",
              detail: "Turnstile verification protects recovery flows from automated abuse."
            }
          ].map((item) => (
            <div key={item.title} className="rounded-[1.2rem] border border-borderc bg-surface/75 p-4 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-brand-2/35 bg-brand-2/10 text-brand-2">
                  <item.icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-text">{item.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-text-secondary">{item.detail}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      }
      footer={
        <p>
          Remembered it?{" "}
          <Link href="/login" className="font-semibold text-accent hover:text-text">
            Back to sign in
          </Link>
        </p>
      }
    >
      {done ? (
        <div className="space-y-4 rounded-[1.35rem] border border-success/30 bg-success/10 p-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-success">Request accepted</p>
            <p className="mt-2 text-lg font-semibold text-text">Check your inbox</p>
          </div>
          <p className="text-sm leading-relaxed text-text-secondary">
            If an account exists for <span className="font-semibold text-text">{email}</span>, a reset link is on the way.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-[1rem] border border-borderc bg-surface/70 px-4 py-3 text-sm text-text-secondary">
              Open the email and use the reset link.
            </div>
            <div className="rounded-[1rem] border border-borderc bg-surface/70 px-4 py-3 text-sm text-text-secondary">
              After updating the password, return to sign in.
            </div>
          </div>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/login">Go to sign in</Link>
          </Button>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={onSubmit}>
          <div className="rounded-[1rem] border border-borderc bg-soft px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-faint">Recovery behavior</p>
            <p className="mt-2 text-sm text-text-secondary">
              We do not reveal whether the email is registered. If the account exists, the reset message will be sent.
            </p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-semibold uppercase tracking-[0.14em] text-faint">
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
              className="rounded-[1rem] border border-danger/35 bg-danger/10 px-4 py-3 text-sm text-danger outline-none"
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
            /*
             * Deliberately renders nothing. A missing human-verification key
             * is a deployment problem, not something the person resetting
             * their password can act on, and the form still works without
             * it. The previous banner handed them an env var name plus
             * instructions for a platform this project does not deploy to.
             * The warning goes to the console, where whoever can fix it
             * will actually see it.
             */
            <TurnstileNotConfiguredNotice />
          )}

          <Button
            type="submit"
            className="w-full"
            loading={loading}
            loadingLabel="Sending reset link..."
            disabled={turnstileEnabled && !turnstileToken}
          >
            Send reset link
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
