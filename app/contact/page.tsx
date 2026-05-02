"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { BookOpenCheck, Building2, Mail, Send, UsersRound } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PublicShell } from "@/components/layout/public-shell";
import { useAppData } from "@/lib/app-data-context";

type ContactCategory = "Bug" | "Content request" | "Account help" | "Class implementation" | "Other";

const categories: ContactCategory[] = [
  "Class implementation",
  "Content request",
  "Account help",
  "Bug",
  "Other"
];

const implementationCards = [
  {
    title: "Students",
    description: "Ask us to help turn your class material into a focused United Exams study path.",
    icon: UsersRound
  },
  {
    title: "Teachers",
    description: "Reach out about sections, assignments, announcements, exams, and course-specific review support.",
    icon: BookOpenCheck
  }
];

export default function ContactPage() {
  const { authReady, isAuthenticated } = useAppData();
  const pathname = usePathname();
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState<ContactCategory>("Class implementation");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const intent = params.get("intent");
    const role = params.get("role");

    if (intent !== "implementation") return;

    setCategory("Class implementation");
    setSubject((current) => current || "Bring United Exams to a class");
    setMessage((current) => {
      if (current) return current;
      if (role === "teacher") {
        return "I am interested in bringing United Exams into a course I teach. I would like to discuss section setup, course material, and how students would use it.";
      }
      if (role === "student") {
        return "I am a student and would like United Exams implemented for one of my classes. The course is: ";
      }
      return "I would like to learn how United Exams could be implemented for a class, course, or academic program.";
    });
  }, []);

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
      <div className="animate-fade-rise mx-auto w-full max-w-[1040px] space-y-6 py-2">
        <section className="story-panel signal-grid overflow-hidden rounded-[1.6rem] border border-border-accent/70 p-5 shadow-elevated sm:p-6">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div className="space-y-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/25 bg-accent-subtle text-accent">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">Contact United Exams</p>
                <h1 className="mt-2 max-w-[12ch] text-4xl font-display font-semibold leading-[0.96] tracking-tight text-text sm:text-[3.5rem]">
                  Bring better study into the room.
                </h1>
              </div>
              <p className="max-w-2xl text-sm leading-relaxed text-text-secondary">
                Students can request support for a hard class. Teachers can ask about using United Exams for course material, sections, review, assignments, and exam prep.
              </p>
              <p className="inline-flex items-center gap-2 rounded-full border border-borderc bg-surface/70 px-3 py-1.5 text-sm text-text transition-all duration-200 ease-out-expo">
                <Mail className="h-4 w-4 text-accent" />
                support@unitedexams.com
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {implementationCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.title} className="rounded-[1.25rem] border border-borderc bg-surface/70 p-4 shadow-subtle backdrop-blur">
                    <Icon className="h-5 w-5 text-accent" />
                    <p className="mt-3 text-lg font-display font-semibold text-text">{card.title}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">{card.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <Card>
          <CardHeader>
            <h2 className="text-display-md font-display font-semibold">Send a message</h2>
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
                      onChange={(event) => setCategory(event.target.value as ContactCategory)}
                      className="h-11 w-full rounded-[10px] border border-borderc bg-soft px-3.5 text-sm text-text outline-none transition-all duration-200 ease-out-expo focus-visible:ring-2 focus-visible:ring-accent/55"
                    >
                      {categories.map((option) => (
                        <option key={option}>{option}</option>
                      ))}
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
                    placeholder="Tell us the course, school, role, and what you want United Exams to help with."
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
                <p className="text-sm text-muted text-text-secondary">
                  Email us directly, or sign in from the top navigation if you want an in-app request with account context and recent activity attached.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button asChild variant="secondary">
                    <a href="mailto:support@unitedexams.com?subject=Bring%20United%20Exams%20to%20a%20class">
                      Email support@unitedexams.com
                    </a>
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
