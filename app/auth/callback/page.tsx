"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type CallbackStatus = "loading" | "success" | "error";

function AuthCallbackContent() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<CallbackStatus>("loading");
  const [message, setMessage] = useState("Confirming your email change…");

  useEffect(() => {
    if (!supabase) {
      setStatus("error");
      setMessage("We can’t reach the account service right now. Please try again in a moment.");
      return;
    }

    let mounted = true;

    const run = async () => {
      const url = new URL(window.location.href);
      const code = searchParams.get("code") ?? url.searchParams.get("code");
      const tokenHash = searchParams.get("token_hash") ?? url.searchParams.get("token_hash");
      const type = searchParams.get("type") ?? url.searchParams.get("type");
      const accessToken = searchParams.get("access_token");
      const refreshToken = searchParams.get("refresh_token");

      try {
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else if (tokenHash && type) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as EmailOtpType
          });
          if (error) throw error;
        } else if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          if (error) throw error;
        } else if (url.hash.includes("access_token=")) {
          const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));
          const hashAccess = hashParams.get("access_token");
          const hashRefresh = hashParams.get("refresh_token");
          if (hashAccess && hashRefresh) {
            const { error } = await supabase.auth.setSession({
              access_token: hashAccess,
              refresh_token: hashRefresh
            });
            if (error) throw error;
          }
        }

        const {
          data: { user }
        } = await supabase.auth.getUser();

        if (!user) {
          throw new Error("Session unavailable after confirmation.");
        }

        await supabase
          .from("email_change_requests")
          .update({ status: "confirmed", updated_at: new Date().toISOString() })
          .eq("user_id", user.id)
          .eq("status", "pending");

        await supabase.rpc("sync_profile_email");

        if (!mounted) return;
        setStatus("success");
        setMessage("Email confirmed. Your login email has been updated.");
      } catch (error) {
        if (!mounted) return;
        setStatus("error");
        setMessage((error as Error).message || "We could not confirm your email change.");
      } finally {
        if (window.location.hash) {
          window.history.replaceState({}, "", `${url.pathname}${url.search}`);
        }
      }
    };

    void run();

    return () => {
      mounted = false;
    };
  }, [searchParams, supabase]);

  return (
    <AuthShell
      title="Email confirmation"
      subtitle="We’re finalizing your account email update securely."
      footer={
        <p>
          Need help? <Link href="/contact" className="font-semibold text-accent hover:text-text">Contact support</Link>
        </p>
      }
    >
      <div
        className={`rounded-xl border px-4 py-3 text-sm ${
          status === "success"
            ? "border-success/35 bg-success/10 text-success"
            : status === "error"
              ? "border-danger/35 bg-danger/10 text-danger"
              : "border-brand-2/35 bg-brand-2/10 text-text-secondary"
        }`}
      >
        {message}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <Link href="/app/settings">Return to Settings</Link>
        </Button>
        {status !== "success" ? (
          <Button variant="secondary" asChild>
            <Link href="/app/settings">Try again later</Link>
          </Button>
        ) : (
          <Button variant="secondary" asChild>
            <Link href="/app/dashboard">Go to Dashboard</Link>
          </Button>
        )}
      </div>
    </AuthShell>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050510]" />}>
      <AuthCallbackContent />
    </Suspense>
  );
}
