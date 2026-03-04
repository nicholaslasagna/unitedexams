"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";

type ApprovalState = "ready" | "loading" | "success" | "error";

function ApproveLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [state, setState] = useState<ApprovalState>("ready");
  const [message, setMessage] = useState("Approve this new sign-in request to continue.");
  const [trustDevice, setTrustDevice] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [cid, setCid] = useState<string | null>(null);

  useEffect(() => {
    const nextToken = searchParams.get("token");
    const nextCid = searchParams.get("cid");

    if (!nextToken || !nextCid) {
      setState("error");
      setMessage("This approval link is incomplete.");
      return;
    }

    setToken(nextToken);
    setCid(nextCid);
    setState("ready");
    setMessage("Approve this new sign-in request to continue.");
  }, [searchParams]);

  const approveLogin = async () => {
    if (!token || !cid) return;
    setState("loading");
    setMessage("Validating your sign-in approval link…");
    try {
      const response = await fetch("/api/auth/approve-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, cid, trustDevice })
      });

      const payload = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Approval failed.");
      }

      setState("success");
      setMessage(
        trustDevice
          ? "Sign-in approved. This device is trusted for 30 days."
          : "Sign-in approved. You can now continue."
      );
    } catch (error) {
      setState("error");
      setMessage((error as Error).message || "Approval failed.");
    }
  };

  return (
    <AuthShell
      title="Approve sign-in"
      subtitle="We’re securely verifying your new sign-in."
      footer={
        <p>
          Need help? <Link href="/contact" className="font-semibold text-accent hover:text-white">Contact support</Link>
        </p>
      }
    >
      <div
        className={`rounded-xl border px-4 py-3 text-sm ${
          state === "success"
            ? "border-success/35 bg-success/10 text-success"
            : state === "error"
              ? "border-danger/35 bg-danger/10 text-danger"
              : state === "loading"
                ? "border-brand-2/35 bg-brand-2/10 text-white/85"
                : "border-borderc bg-soft text-muted"
        }`}
      >
        {message}
      </div>

      {state === "ready" ? (
        <label className="flex items-center gap-2 rounded-xl border border-borderc bg-soft px-3 py-2 text-sm text-text">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-white/25 bg-transparent accent-[hsl(var(--accent))]"
            checked={trustDevice}
            onChange={(event) => setTrustDevice(event.target.checked)}
          />
          Trust this device for 30 days
        </label>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {state === "ready" ? (
          <Button onClick={approveLogin}>Approve sign-in</Button>
        ) : null}
        <Button onClick={() => router.push("/app/dashboard")} disabled={state !== "success"}>
          Continue to dashboard
        </Button>
        <Button variant="secondary" asChild>
          <Link href="/auth/approval-required">Back to approval page</Link>
        </Button>
      </div>
    </AuthShell>
  );
}

export default function ApproveLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050510]" />}>
      <ApproveLoginContent />
    </Suspense>
  );
}
