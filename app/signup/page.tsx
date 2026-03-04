"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordStrength } from "@/components/auth/password-strength";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resolveNextAfterLogin } from "@/lib/auth/guards";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAppData } from "@/lib/app-data-context";
import { validatePassword } from "@/lib/auth/password";
import {
  getDisplayNameMaxLength,
  getRealNameMaxLength,
  normalizeDisplayName,
  normalizeRealName,
  validateRealName,
  validateDisplayName
} from "@/lib/auth/display-name";

function SignupPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const { signOut } = useAppData();

  const [displayName, setDisplayName] = useState("");
  const [realName, setRealName] = useState("");
  const [showRealName, setShowRealName] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkInbox, setCheckInbox] = useState(false);
  const [activeEmail, setActiveEmail] = useState<string | null>(null);

  const next = resolveNextAfterLogin(searchParams.get("next"));
  const guestReturnPath = next.startsWith("/app/") ? "/courses" : next;

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

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const validation = validatePassword(password);
    if (!validation.valid) {
      setError(validation.message ?? "Please use a stronger password.");
      return;
    }

    const displayNameCheck = validateDisplayName(displayName);
    if (!displayNameCheck.valid) {
      setError(displayNameCheck.message);
      return;
    }
    const realNameCheck = validateRealName(realName);
    if (!realNameCheck.valid) {
      setError(realNameCheck.message);
      return;
    }

    const normalizedDisplayName = normalizeDisplayName(displayName);
    const normalizedRealName = normalizeRealName(realName);

    setLoading(true);
    const redirectTo = `${window.location.origin}/login`;

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: {
          display_name: normalizedDisplayName,
          real_name: normalizedRealName || null,
          show_real_name: showRealName
        }
      }
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        email: email.trim(),
        display_name: normalizedDisplayName,
        real_name: normalizedRealName || null,
        show_real_name: showRealName
      });
    }

    setCheckInbox(true);
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Set up your profile and start building exam mastery."
      footer={
        <p>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-accent hover:text-white">
            Sign in
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
      ) : checkInbox ? (
        <div className="space-y-3 rounded-xl border border-success/35 bg-success/10 p-4">
          <p className="text-lg font-semibold text-white">Check your inbox</p>
          <p className="text-sm text-white/75">
            We sent a verification link to <span className="font-semibold text-white">{email}</span>. Verify your email before signing in.
          </p>
          <Button asChild className="w-full">
            <Link href="/login">Go to sign in</Link>
          </Button>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="display-name" className="text-xs font-semibold uppercase tracking-[0.14em] text-white/60">
                Display Name
              </label>
              <Input
                id="display-name"
                required
                value={displayName}
                maxLength={getDisplayNameMaxLength()}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="StudyPilot"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="real-name" className="text-xs font-semibold uppercase tracking-[0.14em] text-white/60">
                Real Name (optional)
              </label>
              <Input
                id="real-name"
                value={realName}
                maxLength={getRealNameMaxLength()}
                onChange={(event) => setRealName(event.target.value)}
                placeholder="Alex Student"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-white/75">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-white/25 bg-transparent accent-[hsl(var(--accent))]"
              checked={showRealName}
              onChange={(event) => setShowRealName(event.target.checked)}
            />
            Show my real name on leaderboard
          </label>

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

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-semibold uppercase tracking-[0.14em] text-white/60">
                Password
              </label>
              <Input
                id="password"
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••••"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirm-password" className="text-xs font-semibold uppercase tracking-[0.14em] text-white/60">
                Confirm Password
              </label>
              <Input
                id="confirm-password"
                type="password"
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="••••••••••"
              />
            </div>
          </div>

          <PasswordStrength password={password} />

          {error ? <p className="rounded-lg border border-danger/35 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p> : null}

          <Button type="submit" className="w-full" loading={loading}>
            Create account
          </Button>
        </form>
      )}
    </AuthShell>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050510]" />}>
      <SignupPageContent />
    </Suspense>
  );
}
