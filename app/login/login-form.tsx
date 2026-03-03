"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const next = searchParams.get("next") || "/app/dashboard";
  const passwordUpdated = searchParams.get("passwordUpdated") === "1";

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!supabase) {
      setError("Supabase is not configured. Add environment variables first.");
      return;
    }

    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });
    setLoading(false);

    if (signInError) {
      setError(signInError.message);
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
        </p>
      }
    >
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

        {error ? <p className="rounded-lg border border-danger/35 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p> : null}

        <Button type="submit" className="w-full" loading={loading}>
          Sign in
        </Button>
      </form>
    </AuthShell>
  );
}
