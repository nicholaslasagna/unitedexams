"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordStrength } from "@/components/auth/password-strength";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { validatePassword } from "@/lib/auth/password";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setReady(true);
      setHasSession(false);
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(async ({ data }) => {
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
  }, [supabase]);

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

          <Button type="submit" className="w-full" loading={loading}>
            Update password
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
