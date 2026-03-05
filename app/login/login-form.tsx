"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
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
  return message;
}

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
      setError("Supabase is not configured. Add environment variables first.");
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
      title="Sign in"
      subtitle="Welcome back. Keep your study momentum going."
      footer={
        <p>
          New to United Exams?{" "}
          <Link href="/signup" className="font-semibold text-accent hover:text-white">
            Create an account
          </Link>
          {" · "}
          <Link href={guestReturnPath} className="font-semibold text-accent hover:text-white">
            Continue as guest
          </Link>
        </p>
      }
    >
      {activeEmail ? (
        <div className="space-y-3 rounded-xl border border-brand-2/35 bg-brand-2/10 p-4">
          <p className="text-sm text-white/85">
            You&apos;re already signed in as <span className="font-semibold text-white">{activeEmail}</span>.
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
      <form className="space-y-4" onSubmit={onSubmit}>
        {passwordUpdated ? (
          <p className="rounded-lg border border-success/35 bg-success/10 px-3 py-2 text-sm text-success">
            Password updated. Sign in with your new password.
          </p>
        ) : null}

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

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-xs font-semibold uppercase tracking-[0.14em] text-white/60">
              Password
            </label>
            <Link href="/forgot-password" className="text-xs font-semibold text-accent hover:text-white">
              Forgot password?
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

        <label className="flex items-center gap-2 text-sm text-white/75">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-white/25 bg-transparent accent-[hsl(var(--accent))]"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
          />
          Remember me on this device
        </label>

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
            action="login"
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
          Sign in
        </Button>
      </form>
      )}
    </AuthShell>
  );
}
