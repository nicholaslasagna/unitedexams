"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { resolveNextAfterLogin } from "@/lib/auth/guards";
import { useAppData } from "@/lib/app-data-context";

type StatusTone = "info" | "success" | "error";

function ApprovalRequiredContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signOut } = useAppData();

  const next = useMemo(
    () => resolveNextAfterLogin(searchParams.get("next")),
    [searchParams]
  );

  const [checking, setChecking] = useState(false);
  const [sending, setSending] = useState(false);
  const [statusTone, setStatusTone] = useState<StatusTone>("info");
  const [status, setStatus] = useState("Check your email to approve this sign-in.");

  const sendChallenge = async (action: "send" | "resend") => {
    setSending(true);
    try {
      const response = await fetch("/api/auth/ip-challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        approved?: boolean;
        warning?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || "Unable to send approval email.");
      }

      if (payload.approved) {
        setStatusTone("success");
        setStatus("This network is already approved. Redirecting…");
        router.replace(next);
        router.refresh();
        return;
      }

      if (payload.warning) {
        setStatusTone("error");
        setStatus(payload.warning);
      } else {
        setStatusTone("success");
        setStatus("Approval email sent. Open it and click Approve sign-in.");
      }
    } catch (error) {
      setStatusTone("error");
      setStatus((error as Error).message || "Unable to send approval email.");
    } finally {
      setSending(false);
    }
  };

  const checkStatus = async () => {
    setChecking(true);
    try {
      const response = await fetch("/api/auth/ip-check", {
        method: "GET",
        cache: "no-store"
      });
      const payload = (await response.json()) as {
        approved?: boolean;
        requiresApproval?: boolean;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || "Unable to check approval status.");
      }

      if (payload.requiresApproval && !payload.approved) {
        setStatusTone("info");
        setStatus("Still waiting for approval. Check your inbox and click the approval link.");
        return;
      }

      setStatusTone("success");
      setStatus("Approved. Redirecting to your dashboard…");
      router.replace(next);
      router.refresh();
    } catch (error) {
      setStatusTone("error");
      setStatus((error as Error).message || "Unable to check approval status.");
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    void sendChallenge("send");
    // Intentional one-time send when arriving at this gate.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthShell
      title="Approve this sign-in"
      subtitle="For extra account protection, confirm this network from your email before continuing."
      footer={
        <p>
          Need help?{" "}
          <Link href="/contact" className="font-semibold text-accent hover:text-white">
            Contact support
          </Link>
        </p>
      }
    >
      <div
        className={`rounded-xl border px-4 py-3 text-sm ${
          statusTone === "success"
            ? "border-success/35 bg-success/10 text-success"
            : statusTone === "error"
              ? "border-danger/35 bg-danger/10 text-danger"
              : "border-brand-2/35 bg-brand-2/10 text-white/85"
        }`}
      >
        {status}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => sendChallenge("resend")} loading={sending}>
          Resend approval email
        </Button>
        <Button variant="secondary" onClick={checkStatus} loading={checking}>
          I already approved
        </Button>
        <Button
          variant="ghost"
          onClick={async () => {
            await signOut();
            router.push("/login");
            router.refresh();
          }}
        >
          Sign out
        </Button>
      </div>
    </AuthShell>
  );
}

export default function ApprovalRequiredPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050510]" />}>
      <ApprovalRequiredContent />
    </Suspense>
  );
}
