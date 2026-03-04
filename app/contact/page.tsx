"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Mail, Send } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function ContactPage() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);

    if (!message.trim()) return;

    if (!supabase) {
      setStatus("Email us directly at support@unitedexams.com.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: name.trim() || null,
      email: email.trim() || "support@unitedexams.com",
      message: message.trim()
    });
    setLoading(false);

    if (error) {
      setStatus("Could not submit right now. Email support@unitedexams.com.");
      return;
    }

    setName("");
    setEmail("");
    setMessage("");
    setStatus("Thanks for reaching out. We’ll reply soon.");
  };

  return (
    <div className="min-h-screen bg-bg text-text">
      <div className="ambient-glow" />
      <main className="relative z-[1] mx-auto w-full max-w-[940px] space-y-6 px-5 py-10">
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
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Name (optional)</label>
                  <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Email (optional)</label>
                  <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@university.edu" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Message</label>
                <textarea
                  required
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  className="min-h-40 w-full rounded-xl border border-borderc bg-soft p-3 text-sm text-text outline-none focus-visible:ring-2 focus-visible:ring-accent/55"
                  placeholder="Tell us what would improve your study experience."
                />
              </div>

              {status ? <p className="rounded-lg border border-borderc bg-soft px-3 py-2 text-sm text-muted">{status}</p> : null}

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
          </CardBody>
        </Card>

        <footer className="border-t border-borderc/75 pt-6 text-center text-sm text-muted">
          <p>
            © {new Date().getFullYear()} Imagicast Studios ·{" "}
            <Link href="https://imagicaststudios.com" target="_blank" rel="noreferrer" className="font-semibold text-accent hover:text-text">
              imagicaststudios.com
            </Link>
          </p>
        </footer>
      </main>
    </div>
  );
}
