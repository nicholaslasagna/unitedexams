"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { Clock3, Mail, Send, ShieldCheck } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PublicShell } from "@/components/layout/public-shell";
import { PublicPageHero } from "@/components/public/public-page-hero";
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
      <div className="animate-fade-rise space-y-8 pb-12 md:space-y-10 md:pb-14">
        <PublicPageHero
          eyebrow="Support"
          title="Get help without losing study momentum."
          description="Use the in-app support form when signed in for faster context-aware help, or email support directly if you just need a quick answer."
          actions={
            <>
              <Button asChild size="lg">
                <a href="mailto:support@unitedexams.com">Email support</a>
              </Button>
              {!isAuthenticated ? (
                <Button asChild variant="secondary" size="lg">
                  <a href="/login?next=/contact">Sign in for in-app support</a>
                </Button>
              ) : null}
            </>
          }
          stats={[
            { label: "Support inbox", value: "Live", detail: "Direct route to support@unitedexams.com" },
            { label: "Best path", value: isAuthenticated ? "In-app" : "Email", detail: "Depends on your account state" },
            { label: "Message rule", value: "20+ chars", detail: "Enough detail to actually troubleshoot" }
          ]}
          aside={
            <div className="space-y-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">What happens when you contact us</p>
                <p className="mt-1 text-sm text-text-secondary">
                  Signed-in support requests include the account and study context needed to debug faster.
                </p>
              </div>
              <div className="grid gap-3">
                <div className="rounded-[1.15rem] border border-borderc bg-surface/80 p-4">
                  <ShieldCheck className="h-4 w-4 text-accent" />
                  <p className="mt-3 text-sm font-semibold text-text">Context-aware support</p>
                  <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                    Logged-in messages can include route, browser, and lightweight recent activity context.
                  </p>
                </div>
                <div className="rounded-[1.15rem] border border-borderc bg-surface/80 p-4">
                  <Clock3 className="h-4 w-4 text-accent" />
                  <p className="mt-3 text-sm font-semibold text-text">Clearer troubleshooting</p>
                  <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                    Bug reports, content requests, and account issues are separated before they hit support.
                  </p>
                </div>
                <div className="rounded-[1.15rem] border border-borderc bg-surface/80 p-4">
                  <Mail className="h-4 w-4 text-accent" />
                  <p className="mt-3 text-sm font-semibold text-text">Direct fallback</p>
                  <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                    If you do not need account-linked help, email support directly and skip the form.
                  </p>
                </div>
              </div>
            </div>
          }
        />

        <div className="mx-auto grid w-full max-w-[1240px] gap-4 px-0 sm:px-2 md:grid-cols-[0.85fr_1.15fr] md:px-6">
          <Card className="overflow-hidden border-borderc">
            <CardHeader className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">Support routes</p>
              <h2 className="text-2xl font-display font-semibold text-text">Choose the path that fits the problem.</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="rounded-[1.2rem] border border-borderc bg-soft/70 p-4">
                <p className="text-sm font-semibold text-text">Signed in?</p>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  Use the in-app form for bugs, content requests, or account help. It gives support more context and reduces back-and-forth.
                </p>
              </div>
              <div className="rounded-[1.2rem] border border-borderc bg-soft/70 p-4">
                <p className="text-sm font-semibold text-text">Not signed in?</p>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  Email support directly. The page stays public so anyone can still reach out without being blocked.
                </p>
              </div>
              <div className="rounded-[1.2rem] border border-borderc bg-soft/70 p-4">
                <p className="text-sm font-semibold text-text">Best message structure</p>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  Include what you expected, what happened instead, and the course or route where it happened.
                </p>
              </div>
            </CardBody>
          </Card>

          <Card className="overflow-hidden border-borderc">
            <CardHeader className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">Send feedback</p>
              <h2 className="text-2xl font-display font-semibold text-text">Contact United Exams</h2>
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
                        className="h-11 w-full rounded-[10px] border border-borderc bg-soft px-3.5 text-sm text-text outline-none transition-all duration-200 ease-out-expo focus-visible:ring-2 focus-visible:ring-accent/55"
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
                      className="min-h-44 w-full rounded-xl border border-borderc bg-soft p-3 text-sm text-text outline-none transition-all duration-200 ease-out-expo focus-visible:ring-2 focus-visible:ring-accent/55"
                      placeholder="Describe the issue or request in detail (minimum 20 characters)."
                    />
                  </div>

                  {status ? (
                    <p className="rounded-lg border border-borderc bg-soft px-3 py-2 text-sm text-muted">{status}</p>
                  ) : null}
                  {warning ? (
                    <p className="rounded-lg border border-warn/40 bg-warn/10 px-3 py-2 text-sm text-warn">{warning}</p>
                  ) : null}

                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
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
                  <div className="rounded-[1.2rem] border border-borderc bg-soft/70 p-4">
                    <p className="text-sm font-semibold text-text">In-app support is available after sign-in.</p>
                    <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                      Sign in if you want account-linked support messages with route and activity context, or just email support directly.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button asChild>
                      <a href="/login?next=/contact">Sign in</a>
                    </Button>
                    <Button asChild variant="secondary">
                      <a href="mailto:support@unitedexams.com">Email support@unitedexams.com</a>
                    </Button>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </PublicShell>
  );
}
