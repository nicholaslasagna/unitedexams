"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TurnstileWidget } from "@/components/auth/turnstile-widget";
import { resolveNextAfterLogin } from "@/lib/auth/guards";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAppData } from "@/lib/app-data-context";
import { isTurnstileClientEnabled } from "@/lib/security/turnstile-client";

function mapAuthError(message: string, captchaEnabled: boolean) {
  if (!message) return "Unable to sign in.";
  const normalized = message.toLowerCase();
  if (
    captchaEnabled &&
    (normalized.includes("captcha") || normalized.includes("challenge") || normalized.includes("turnstile"))
  ) {
    return "Please complete the verification challenge and try again.";
  }
  // Stripe-style human-friendly mapping for the most common case.
  if (normalized.includes("invalid login credentials") || normalized.includes("invalid_grant")) {
    return "Incorrect email or password.";
  }
  if (normalized.includes("email not confirmed")) {
    return "Please verify your email before signing in.";
  }
  return message;
}

/**
 * Sign-in form — Stripe-style.
 *
 * Single card, hairline-clean. Email + password, with a right-aligned
 * "Forgot your password?" link sitting on the password label row.
 * Inline error with a warning icon. "Remember me" checkbox. Primary
 * Sign in button at the bottom. Footer link to signup.
 *
 * Behavior is unchanged from the previous form — Supabase email/password
 * auth, Cloudflare Turnstile when enabled, "remember me" persisted to
 * localStorage. The visual delta is everything: we removed the
 * "what opens next / session" preview cards and the dual-column hero.
 */
export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const { signOut } = useAppData();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeEmail, setActiveEmail] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [captchaRenderKey, setCaptchaRenderKey] = useState(0);
  const errorRef = useRef<HTMLParagraphElement | null>(null);

  const next = resolveNextAfterLogin(searchParams.get("next"));
  const passwordUpdated = searchParams.get("passwordUpdated") === "1";
  const guestReturnPath = next.startsWith("/app/") ? "/courses" : next;
  const turnstileEnabled = isTurnstileClientEnabled();
  const errorId = "login-form-error";

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setActiveEmail(data.user?.email ?? null);
    });
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setActiveEmail(session?.user?.email ?? null);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!supabase) {
      setError("Sign-in is temporarily unavailable.");
      return;
    }

    if (turnstileEnabled && !turnstileToken) {
      setError("Please complete the verification challenge.");
      return;
    }

    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword(
      turnstileEnabled
        ? {
            email: email.trim(),
            password,
            options: { captchaToken: turnstileToken ?? "" }
          }
        : {
            email: email.trim(),
            password
          }
    );
    setCaptchaRenderKey((value) => value + 1);
    setTurnstileToken(null);
    setLoading(false);

    if (signInError) {
      setError(mapAuthError(signInError.message, turnstileEnabled));
      return;
    }

    localStorage.setItem("ue.rememberSession", remember ? "1" : "0");
    sessionStorage.setItem("ue.activeSession", "1");

    router.replace(next);
    router.refresh();
  };

  return (
    <AuthShell
      title="Sign in to your account"
      subtitle="Welcome back. Pick up exactly where you left off."
      footer={
        <p>
          New to United Exams?{" "}
          <Link href="/signup" className="font-semibold text-accent hover:text-text">
            Create account
          </Link>
          <span className="mx-2 text-text-secondary/50">·</span>
          <Link href={guestReturnPath} className="text-text-secondary hover:text-text">
            Continue as guest
          </Link>
        </p>
      }
    >
      {activeEmail ? (
        <div className="space-y-3 rounded-xl border border-accent/30 bg-accent/10 p-4">
          <p className="text-[13.5px] text-text">
            You&apos;re already signed in as{" "}
            <span className="font-semibold">{activeEmail}</span>.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => router.push("/app/dashboard")}>Go to dashboard</Button>
            <Button
              variant="secondary"
              onClick={async () => {
                await signOut();
                setActiveEmail(null);
                router.refresh();
              }}
            >
              Sign out
            </Button>
          </div>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          {passwordUpdated ? (
            <div className="flex items-start gap-2 rounded-lg border border-success/35 bg-success/10 px-3 py-2.5 text-[13px] text-success">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>Password updated. Sign in with your new password.</span>
            </div>
          ) : null}

          {/* Email */}
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-[13px] font-semibold text-text"
            >
              Email
            </label>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@university.edu"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-3">
              <label
                htmlFor="password"
                className="block text-[13px] font-semibold text-text"
              >
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[12.5px] font-medium text-accent hover:text-text"
              >
                Forgot your password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••••"
            />
          </div>

          {/* Inline error — warning icon + message, Stripe pattern */}
          {error ? (
            <p
              id={errorId}
              ref={errorRef}
              tabIndex={-1}
              role="alert"
              aria-live="assertive"
              className="flex items-start gap-2 text-[13px] text-danger outline-none"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <span>{error}</span>
            </p>
          ) : null}

          {/* Remember me */}
          <label className="flex items-center gap-2 text-[13px] text-text">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-borderc bg-soft accent-[hsl(var(--accent))]"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
            />
            Remember me on this device
          </label>

          {/* Turnstile (when configured). Slot lives below the controls
              so the form looks clean when captcha is disabled in dev. */}
          {turnstileEnabled ? (
            <div className="pt-1">
              <TurnstileWidget
                key={captchaRenderKey}
                action="login"
                onToken={setTurnstileToken}
                describedBy={error ? errorId : undefined}
              />
            </div>
          ) : null}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            loading={loading}
            loadingLabel="Signing in…"
            disabled={turnstileEnabled && !turnstileToken}
          >
            Sign in
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
