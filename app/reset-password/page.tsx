"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordStrength } from "@/components/auth/password-strength";
import { TurnstileWidget } from "@/components/auth/turnstile-widget";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { validatePassword } from "@/lib/auth/password";
import {
  isTurnstileClientEnabled,
  verifyTurnstileClient
} from "@/lib/security/turnstile-client";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileEnabled = isTurnstileClientEnabled();

  useEffect(() => {
    if (!supabase) {
      setReady(true);
      setHasSession(false);
      return;
    }

    let mounted = true;

    const hydrateFromResetLink = async () => {
      const url = new URL(window.location.href);
      const code = searchParams.get("code") ?? url.searchParams.get("code");
      const tokenHash = searchParams.get("token_hash") ?? url.searchParams.get("token_hash");
      const type = searchParams.get("type") ?? url.searchParams.get("type");
      const accessToken = searchParams.get("access_token");
      const refreshToken = searchParams.get("refresh_token");

      try {
        // PKCE flow support (web/email links)
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            throw exchangeError;
          }
        } else if (tokenHash && type === "recovery") {
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: "recovery"
          });
          if (verifyError) {
            throw verifyError;
          }
        } else if (accessToken && refreshToken) {
          // Deep-link compatibility for implicit token links
          const { error: setSessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          if (setSessionError) {
            throw setSessionError;
          }
        } else if (url.hash.includes("access_token=")) {
          // Handle hash-based auth links from older/mobile flows.
          const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));
          const hashAccess = hashParams.get("access_token");
          const hashRefresh = hashParams.get("refresh_token");
          if (hashAccess && hashRefresh) {
            const { error: hashSessionError } = await supabase.auth.setSession({
              access_token: hashAccess,
              refresh_token: hashRefresh
            });
            if (hashSessionError) {
              throw hashSessionError;
            }
          }
          if (window.location.hash) {
            window.history.replaceState({}, "", `${url.pathname}${url.search}`);
          }
        }
      } catch (linkErr) {
        if (mounted) {
          setLinkError((linkErr as Error).message);
        }
      }

      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      const active = Boolean(data.session?.user);
      setHasSession(active);
      setReady(true);

      if (active) {
        await supabase
          .from("profiles")
          .update({ reset_required: true })
          .eq("id", data.session?.user.id ?? "");
      }
    };

    hydrateFromResetLink().catch(() => {
      if (!mounted) return;
      setReady(true);
      setHasSession(false);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(Boolean(session?.user));
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [searchParams, supabase]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!supabase) {
      setError("Supabase is not configured. Add environment variables first.");
      return;
    }

    if (!hasSession) {
      setError("Your reset session is missing or expired. Request a new reset link.");
      return;
    }

    if (turnstileEnabled) {
      if (!turnstileToken) {
        setError("Please complete the verification challenge.");
        return;
      }
      try {
        await verifyTurnstileClient({ token: turnstileToken, action: "reset-password" });
      } catch (turnstileError) {
        setError((turnstileError as Error).message);
        return;
      }
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const validation = validatePassword(newPassword);
    if (!validation.valid) {
      setError(validation.message ?? "Please use a stronger password.");
      return;
    }

    setLoading(true);

    const {
      data: { user },
      error: updateError
    } = await supabase.auth.updateUser({ password: newPassword });

    if (updateError || !user) {
      setLoading(false);
      setError(updateError?.message ?? "Failed to update password.");
      return;
    }

    await supabase
      .from("profiles")
      .update({
        reset_required: false,
        password_changed_at: new Date().toISOString()
      })
      .eq("id", user.id);

    await supabase.auth.signOut();

    setLoading(false);
    router.replace("/login?passwordUpdated=1");
    router.refresh();
  };

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Set a new secure password to continue."
      footer={
        <p>
          Need another link?{" "}
          <Link href="/forgot-password" className="font-semibold text-accent hover:text-white">
            Request a new reset email
          </Link>
        </p>
      }
    >
      {!ready ? (
        <p className="text-sm text-white/70">Preparing secure reset session…</p>
      ) : !hasSession ? (
        <div className="space-y-3 rounded-xl border border-warn/35 bg-warn/10 p-4 text-sm text-white/80">
          <p>Your password reset link is invalid or expired.</p>
          {linkError ? <p className="text-xs text-warn">Details: {linkError}</p> : null}
          <Button asChild className="w-full">
            <Link href="/forgot-password">Request new link</Link>
          </Button>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-1.5">
            <label htmlFor="new-password" className="text-xs font-semibold uppercase tracking-[0.14em] text-white/60">
              New password
            </label>
            <Input
              id="new-password"
              type="password"
              required
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="••••••••••"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirm-password" className="text-xs font-semibold uppercase tracking-[0.14em] text-white/60">
              Confirm new password
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

          <PasswordStrength password={newPassword} />

          {error ? <p className="rounded-lg border border-danger/35 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p> : null}

          {turnstileEnabled ? (
            <TurnstileWidget action="reset-password" onToken={setTurnstileToken} />
          ) : null}

          <Button type="submit" className="w-full" loading={loading}>
            Update password
          </Button>
        </form>
      )}
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050510]" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
