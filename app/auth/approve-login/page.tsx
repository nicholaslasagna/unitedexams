"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";

type ApprovalState = "loading" | "success" | "error";

function ApproveLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [state, setState] = useState<ApprovalState>("loading");
  const [message, setMessage] = useState("Validating your sign-in approval link…");

  useEffect(() => {
    const token = searchParams.get("token");
    const cid = searchParams.get("cid");

    if (!token || !cid) {
      setState("error");
      setMessage("This approval link is incomplete.");
      return;
    }

    let active = true;

    const run = async () => {
      try {
        const response = await fetch("/api/auth/approve-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, cid })
        });

        const payload = (await response.json()) as { ok?: boolean; error?: string };
        if (!response.ok || !payload.ok) {
          throw new Error(payload.error || "Approval failed.");
        }

        if (!active) return;
        setState("success");
        setMessage("Sign-in approved. You can now continue to your dashboard.");
      } catch (error) {
        if (!active) return;
        setState("error");
        setMessage((error as Error).message || "Approval failed.");
      }
    };

    void run();
    return () => {
      active = false;
    };
  }, [searchParams]);

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
              : "border-brand-2/35 bg-brand-2/10 text-white/85"
        }`}
      >
        {message}
      </div>

      <div className="flex flex-wrap gap-2">
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

