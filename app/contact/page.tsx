"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { Mail, Send } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PublicShell } from "@/components/layout/public-shell";
import { useAppData } from "@/lib/app-data-context";

export default function ContactPage() {
  const { authReady, isAuthenticated } = useAppData();
  const pathname = usePathname();
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState<"Bug" | "Content request" | "Account help" | "Other">(
    "Other"
  );
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setWarning(null);

    if (!isAuthenticated) {
      setStatus("Sign in to submit support messages.");
      return;
    }

    if (message.trim().length < 20) {
      setStatus("Message must be at least 20 characters.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/contact/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim() || undefined,
          category,
          message: message.trim(),
          currentUrl: typeof window !== "undefined" ? window.location.href : null,
          currentRoute: pathname || "/contact"
        })
      });
      const payload = (await response.json()) as { error?: string; warning?: string };
      if (!response.ok) {
        throw new Error(payload.error || "Could not submit right now.");
      }

      setSubject("");
      setMessage("");
      setStatus("Thanks for reaching out. We’ll reply soon.");
      if (payload.warning) {
        setWarning(payload.warning);
      }
    } catch (error) {
      setStatus((error as Error).message || "Could not submit right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicShell>
      <div className="mx-auto w-full max-w-[940px] space-y-6 py-2">
        <section className="space-y-3 text-center">
          <h1 className="font-display text-5xl font-semibold tracking-tight">Contact United Exams</h1>
          <p className="mx-auto max-w-3xl text-sm text-muted">
            United Exams helps students master exam material through guided quizzes, walkthrough solutions, and progress insights.
          </p>
          <p className="inline-flex items-center gap-2 rounded-full border border-borderc bg-soft px-3 py-1.5 text-sm text-text">
            <Mail className="h-4 w-4 text-accent" />
            support@unitedexams.com
          </p>
        </section>

        <Card>
          <CardHeader>
            <h2 className="font-display text-2xl font-semibold">Send feedback</h2>
          </CardHeader>
          <CardBody>
            {!authReady ? (
              <p className="text-sm text-muted">Checking account status…</p>
            ) : isAuthenticated ? (
              <form className="space-y-4" onSubmit={onSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Subject (optional)</label>
                    <Input
                      value={subject}
                      onChange={(event) => setSubject(event.target.value)}
                      maxLength={160}
                      placeholder="Short summary"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Category</label>
                    <select
                      value={category}
                      onChange={(event) => setCategory(event.target.value as typeof category)}
                      className="h-11 w-full rounded-[10px] border border-borderc bg-soft px-3.5 text-sm text-text outline-none focus-visible:ring-2 focus-visible:ring-accent/55"
                    >
                      <option>Bug</option>
                      <option>Content request</option>
                      <option>Account help</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Message</label>
                  <textarea
                    required
                    minLength={20}
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    className="min-h-44 w-full rounded-xl border border-borderc bg-soft p-3 text-sm text-text outline-none focus-visible:ring-2 focus-visible:ring-accent/55"
                    placeholder="Describe the issue or request in detail (minimum 20 characters)."
                  />
                </div>

                {status ? (
                  <p className="rounded-lg border border-borderc bg-soft px-3 py-2 text-sm text-muted">{status}</p>
                ) : null}
                {warning ? (
                  <p className="rounded-lg border border-warn/40 bg-warn/10 px-3 py-2 text-sm text-warn">{warning}</p>
                ) : null}

                <div className="flex flex-wrap gap-3">
                  <Button type="submit" loading={loading}>
                    <Send className="h-4 w-4" />
                    Send message
                  </Button>
                  <Button asChild variant="secondary">
                    <a href="mailto:support@unitedexams.com">Email support@unitedexams.com</a>
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted">
                  Sign in from the top navigation if you want in-app support requests with account context and recent activity.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button asChild variant="secondary">
                    <a href="mailto:support@unitedexams.com">Email support@unitedexams.com</a>
                  </Button>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </PublicShell>
  );
}
