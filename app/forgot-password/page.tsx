"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!supabase) {
      setError("Supabase is not configured. Add environment variables first.");
      return;
    }

    setLoading(true);

    const redirectTo = `${window.location.origin}/reset-password`;
    await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });

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

          {error ? <p className="rounded-lg border border-danger/35 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p> : null}

          <Button type="submit" className="w-full" loading={loading}>
            Send reset link
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
