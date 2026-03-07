"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { GraduationCap, ShieldCheck, TimerReset } from "lucide-react";
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
      subtitle="Return to your dashboard, sections, and study momentum without losing context."
      eyebrow="Secure account access"
      heroTitle={<>Return to your study rhythm.</>}
      heroDescription="Jump back into course materials, live sections, announcements, and active quiz work without hunting through the app." 
      heroStats={[
        { label: "Access", value: "1 login", detail: "Dashboard, sections, and study tools" },
        { label: "Protection", value: "Turnstile", detail: "Bot-resistant sign-in and recovery flows" },
        { label: "Recovery", value: "Fast reset", detail: "Reset password without losing account state" }
      ]}
      heroAside={
        <div className="grid gap-3">
          {[
            {
              icon: GraduationCap,
              title: "Resume exactly where you left off",
              detail: "Recent quizzes, section materials, and your course lane stay attached to the same account."
            },
            {
              icon: ShieldCheck,
              title: "Security checks stay behind the scenes",
              detail: "Verification and sign-in protection run without cluttering the main workflow."
            },
            {
              icon: TimerReset,
              title: "Recovery is built in",
              detail: "Password reset and approval flows are available if access changes or a session expires."
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
          New to United Exams?{" "}
          <Link href="/signup" className="font-semibold text-accent hover:text-text">
            Create an account
          </Link>
          {" · "}
          <Link href={guestReturnPath} className="font-semibold text-accent hover:text-text">
            Continue as guest
          </Link>
        </p>
      }
    >
      {activeEmail ? (
        <div className="space-y-3 rounded-[1.3rem] border border-brand-2/35 bg-brand-2/10 p-4">
          <p className="text-sm text-text-secondary">
            You&apos;re already signed in as <span className="font-semibold text-text">{activeEmail}</span>.
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
        <form className="space-y-5" onSubmit={onSubmit}>
          {passwordUpdated ? (
            <p className="rounded-[1rem] border border-success/35 bg-success/10 px-4 py-3 text-sm text-success">
              Password updated. Sign in with your new password.
            </p>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1rem] border border-borderc bg-soft px-4 py-3 sm:col-span-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-faint">What opens next</p>
              <p className="mt-2 text-sm font-semibold text-text">Dashboard, course lanes, sections, and saved progress</p>
            </div>
            <div className="rounded-[1rem] border border-borderc bg-soft px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-faint">Session</p>
              <p className="mt-2 text-sm font-semibold text-text">{remember ? "Remembered" : "This device only"}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5 md:col-span-2">
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

            <div className="space-y-1.5 md:col-span-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-semibold uppercase tracking-[0.14em] text-faint">
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs font-semibold text-accent hover:text-text">
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
          </div>

          <label className="flex items-center gap-2 rounded-[1rem] border border-borderc bg-soft px-3 py-3 text-sm text-muted">
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
              className="rounded-[1rem] border border-danger/35 bg-danger/10 px-4 py-3 text-sm text-danger outline-none"
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
            <p className="rounded-[1rem] border border-warn/35 bg-warn/10 px-4 py-3 text-xs text-warn">
              Human verification is not configured. Set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` in Vercel and redeploy.
            </p>
          )}

          <Button
            type="submit"
            className="w-full"
            loading={loading}
            loadingLabel="Signing in..."
            disabled={turnstileEnabled && !turnstileToken}
          >
            Sign in
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
