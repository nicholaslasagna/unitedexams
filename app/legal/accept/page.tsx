"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { PublicShell } from "@/components/layout/public-shell";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/lib/app-data-context";
import { LEGAL_VERSION } from "@/lib/auth/legal";

function resolveNextPath(rawNext: string | null) {
  if (!rawNext) return "/app/dashboard";
  if (!rawNext.startsWith("/")) return "/app/dashboard";
  if (rawNext.startsWith("//")) return "/app/dashboard";
  return rawNext;
}

function LegalAcceptPageContent() {
  const params = useSearchParams();
  const { authReady, isAuthenticated } = useAppData();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);
  const next = resolveNextPath(params.get("next"));

  const submit = async () => {
    if (!accepted) return;
    setLoading(true);
    setError(null);
    try {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 15000);
      const response = await fetch("/api/legal/accept", {
        method: "POST",
        signal: controller.signal
      });
      window.clearTimeout(timeout);
      const payload = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Unable to record consent.");
      }
      // Use a hard navigation so middleware/session reads the fresh profile flags immediately.
      window.location.assign(next);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicShell>
      <div className="mx-auto w-full max-w-[760px] py-8">
        <div className="rounded-2xl border border-borderc bg-surface p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Required update · {LEGAL_VERSION}</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">Accept updated legal terms</h1>
          <p className="mt-3 text-sm text-muted">
            You must accept the latest Privacy Policy and Terms of Service before continuing in the app.
          </p>

          {!authReady ? (
            <p className="mt-4 text-sm text-muted">Checking session…</p>
          ) : !isAuthenticated ? (
            <>
              <p className="mt-4 text-sm text-muted">
                Sign in first, then return here to complete acceptance.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="secondary" asChild>
                  <Link href={`/login?next=${encodeURIComponent(next)}`}>Sign in</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/courses">Back to public courses</Link>
                </Button>
              </div>
            </>
          ) : (
            <>
              <label className="mt-5 flex items-start gap-2 rounded-lg border border-borderc bg-soft px-3 py-2 text-sm text-text">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 accent-[hsl(var(--accent))]"
                  checked={accepted}
                  onChange={(event) => setAccepted(event.target.checked)}
                />
                <span>
                  I agree to the{" "}
                  <Link href="/privacy" className="font-semibold text-accent hover:text-text">
                    Privacy Policy
                  </Link>{" "}
                  and{" "}
                  <Link href="/terms" className="font-semibold text-accent hover:text-text">
                    Terms of Service
                  </Link>
                  .
                </span>
              </label>

              {error ? (
                <p className="mt-3 rounded-lg border border-danger/35 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-2">
                <Button onClick={submit} disabled={!accepted} loading={loading}>
                  Accept and continue
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/courses">Back to public courses</Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </PublicShell>
  );
}

export default function LegalAcceptPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050510]" />}>
      <LegalAcceptPageContent />
    </Suspense>
  );
}
