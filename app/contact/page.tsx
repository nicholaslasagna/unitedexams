"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  ArrowRight,
  BookOpenCheck,
  Building2,
  GraduationCap,
  Mail,
  Send,
  Sparkles,
  UsersRound
} from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/ui/section-heading";
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

const paths = [
  {
    role: "student",
    icon: <UsersRound className="h-5 w-5" />,
    tag: "Students",
    title: "Bring this to a class I'm taking",
    text: "Tell us which class is rough. We'll work with the instructor to spin up a course-native study hub for it.",
    cta: "Suggest a class",
    href: "/contact?intent=implementation&role=student",
    accent: "from-cyan-500/15 to-blue-500/15",
    border: "border-cyan-400/30"
  },
  {
    role: "teacher",
    icon: <BookOpenCheck className="h-5 w-5" />,
    tag: "Instructors",
    title: "Use this for a course I teach",
    text: "Sections, assignments, announcements, exam settings, and grading — all in one place. We handle the setup with you.",
    cta: "Talk to us",
    href: "/contact?intent=implementation&role=teacher",
    accent: "from-fuchsia-500/15 to-violet-500/15",
    border: "border-fuchsia-400/30"
  },
  {
    role: "institution",
    icon: <Building2 className="h-5 w-5" />,
    tag: "Departments / Programs",
    title: "Cover access for my department",
    text: "Centralized billing, verified students, and a clean rollout across multiple sections. Premium gates disappear.",
    cta: "Discuss a program",
    href: "/contact?intent=implementation&role=institution",
    accent: "from-emerald-500/15 to-teal-500/15",
    border: "border-emerald-400/30"
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
      if (role === "institution") {
        return "I would like to discuss covering access for a department or program. The school is: ";
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
      <div className="mx-auto w-full max-w-[1080px] space-y-10 pb-16">
        {/* Hero */}
        <section className="relative">
          <div className="aurora absolute inset-0 -z-10 rounded-[2rem] opacity-90" aria-hidden />
          <div className="premium-card glow-border p-5 sm:p-7 md:p-9">
            <div className="grid gap-7 lg:grid-cols-[1fr_0.85fr] lg:items-center">
              <div className="space-y-4">
                <span className="eyebrow">
                  <Sparkles className="h-3 w-3" />
                  Contact United Exams
                </span>
                <h1 className="font-display text-[2.4rem] font-semibold leading-[1.02] tracking-tight text-text sm:text-[3.25rem]">
                  Bring better study into the room.
                </h1>
                <p className="max-w-xl text-[15px] leading-relaxed text-text-secondary">
                  Whether you&apos;re a student asking us to support a hard class,
                  an instructor planning a section, or a department thinking about
                  rollout — start here. We&apos;ll meet you where you are.
                </p>

                <div className="flex flex-wrap gap-2">
                  <Badge tone="brand">Real humans reply</Badge>
                  <Badge tone="success">Free to ask</Badge>
                  <Badge>No sales calls unless you want one</Badge>
                </div>

                <p className="inline-flex items-center gap-2 rounded-full border border-borderc bg-surface/85 px-3 py-1.5 text-[13px] text-text">
                  <Mail className="h-4 w-4 text-accent" />
                  support@unitedexams.com
                </p>
              </div>

              <div className="rounded-[1.4rem] border border-borderc bg-surface/85 p-5">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-accent">
                  How this works
                </p>
                <ol className="mt-3 space-y-2.5">
                  {[
                    "Pick the path that matches you.",
                    "We reply with a short plan and any questions.",
                    "We work directly with the instructor or department to set things up.",
                    "Verified students never see a paywall."
                  ].map((step, idx) => (
                    <li key={step} className="flex items-start gap-3">
                      <span className="step-badge mt-0.5 shrink-0">{idx + 1}</span>
                      <span className="text-[13px] leading-relaxed text-text-secondary">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* Three paths */}
        <section className="space-y-5">
          <SectionHeading
            eyebrow="Pick a path"
            title="Three ways to bring this to your class."
          />
          <div className="grid gap-4 lg:grid-cols-3">
            {paths.map((p) => (
              <Link
                key={p.role}
                href={p.href}
                className={`group relative flex flex-col overflow-hidden rounded-[1.4rem] border ${p.border} bg-gradient-to-br ${p.accent} p-5 transition-all duration-200 ease-out-expo hover:-translate-y-0.5 hover:shadow-card-hover`}
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-borderc bg-surface text-accent">
                  {p.icon}
                </span>
                <p className="mt-4 text-[10.5px] font-bold uppercase tracking-[0.18em] text-accent">
                  {p.tag}
                </p>
                <p className="mt-1 font-display text-lg font-semibold text-text">{p.title}</p>
                <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-text-secondary">{p.text}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-accent transition-transform duration-200 group-hover:translate-x-0.5">
                  {p.cta}
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Form */}
        <Card>
          <CardHeader>
            <SectionHeading
              eyebrow="Send a message"
              title="Tell us about your class."
              description="Include the course code, school, and what kind of help you're looking for. The more context, the faster we can respond."
            />
          </CardHeader>
          <CardBody>
            {!authReady ? (
              <p className="text-sm text-text-secondary">Checking account status…</p>
            ) : isAuthenticated ? (
              <form className="space-y-4" onSubmit={onSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-text-secondary">
                      Subject (optional)
                    </label>
                    <Input
                      value={subject}
                      onChange={(event) => setSubject(event.target.value)}
                      maxLength={160}
                      placeholder="Short summary"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-text-secondary">
                      Category
                    </label>
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
                  <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-text-secondary">
                    Message
                  </label>
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
                  <p className="rounded-lg border border-borderc bg-soft px-3 py-2 text-sm text-text-secondary">
                    {status}
                  </p>
                ) : null}
                {warning ? (
                  <p className="rounded-lg border border-warn/40 bg-warn/10 px-3 py-2 text-sm text-warn">
                    {warning}
                  </p>
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
                <p className="text-[14px] leading-relaxed text-text-secondary">
                  Email us directly, or sign in from the top navigation if you want
                  an in-app request with account context attached.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button asChild variant="secondary">
                    <a href="mailto:support@unitedexams.com?subject=Bring%20United%20Exams%20to%20a%20class">
                      <Mail className="h-4 w-4" />
                      Email support@unitedexams.com
                    </a>
                  </Button>
                  <Button asChild variant="ghost">
                    <Link href="/signup">
                      <GraduationCap className="h-4 w-4" />
                      Create an account first
                    </Link>
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
