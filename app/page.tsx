import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  HeartHandshake
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PublicShell } from "@/components/layout/public-shell";
import { PublicAuthActions } from "@/components/public/public-auth-actions";
import { HeroIndex } from "@/components/marketing/hero-index";
import { StudyModesSection } from "@/components/marketing/study-modes";
import { WorkflowSplit } from "@/components/marketing/workflow-split";
import { InstitutionSection } from "@/components/marketing/institution-section";
import { PricingSection } from "@/components/marketing/pricing-section";
import { AccessModelSection } from "@/components/marketing/access-model-section";
import { TrustSection } from "@/components/marketing/trust-section";
import { SectionHeading } from "@/components/ui/section-heading";
import { courses, quizSets } from "@/data/seed";
import { resolveQuizSetMode } from "@/lib/study/set-mode";

const courseArtworkById: Record<string, string> = {
  "software-engineering": "/images/courses/software-engineering.svg",
  "differential-equations": "/images/courses/differential-equations.svg",
  "computer-architecture": "/images/courses/computer-architecture.svg",
  "theory-of-automata": "/images/courses/theory-of-automata.svg"
};

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="font-mono text-2xl font-bold leading-none text-text">{value}</span>
      <span className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-text-secondary">
        {label}
      </span>
    </div>
  );
}

export default function LandingPage() {
  const totalMinutes = quizSets.reduce((sum, set) => sum + set.estMinutes, 0);
  const totalQuestions = quizSets.reduce((sum, set) => sum + set.questions.length, 0);

  const courseAtlas = courses
    .map((course) => {
      const sets = quizSets.filter((set) => set.courseId === course.id);
      return {
        ...course,
        artwork: courseArtworkById[course.id] ?? "/images/courses/default-course.svg",
        quizCount: sets.filter((set) => resolveQuizSetMode(set) === "quiz").length,
        examCount: sets.filter((set) => resolveQuizSetMode(set) === "exam").length,
        homeworkCount: sets.filter((set) => resolveQuizSetMode(set) === "homework").length,
        estimatedMinutes: sets.reduce((sum, set) => sum + set.estMinutes, 0),
        questionCount: sets.reduce((sum, set) => sum + set.questions.length, 0)
      };
    })
    .sort(
      (left, right) =>
        right.quizCount + right.examCount + right.homeworkCount -
        (left.quizCount + left.examCount + left.homeworkCount)
    );

  return (
    <PublicShell>
      <div className="space-y-16 pb-16 md:space-y-20 md:pb-20">
        {/* ─── HERO ────────────────────────────────────────── */}
        <section className="relative">
          <div className="aurora absolute inset-0 -z-10 rounded-[2rem] opacity-90" aria-hidden />

          <div className="relative grid gap-10 px-1 py-3 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-12 lg:px-2 lg:py-6">
            <div className="space-y-7">
              {/*
               * Publication-style kicker — small caps mono, like a
               * magazine masthead. Just two facts: what this is, when.
               * No marketing voice.
               */}
              <p className="font-mono text-[10.5px] uppercase tracking-[0.32em] text-text-secondary">
                Course-native study platform · Spring 2026
              </p>

              {/*
               * The brand mark IS the hero. Like a real publication —
               * "The New Yorker" doesn't print "Stories that come alive"
               * over their masthead. The wordmark, set huge in editorial
               * Fraunces with one italic word for personality, does the
               * work the marketing tagline used to do.
               *
               * Lifted from the Invincible VS reference: their hero is
               * the game logo, big and confident, with no marketing pitch
               * around it. The brand IS the message.
               */}
              <h1 className="display-hero">
                United <span className="italic text-accent">Exams</span>.
              </h1>

              {/*
               * Description — what this is, in plain language. Reads
               * like a publication's subhead, not a SaaS pitch.
               */}
              <p className="max-w-xl font-display text-[18px] italic leading-relaxed text-text-secondary">
                A workspace for the courses you&apos;re actually taking — quizzes,
                walkthroughs, exam simulations, and notes, kept inside the
                class they belong to.
              </p>

              <PublicAuthActions variant="hero" />

              {/* Quiet masthead-style trust line. */}
              <p className="font-display text-[13px] italic leading-relaxed text-text-secondary">
                No credit card to try · Free is generous · Verified school
                users never see a paywall.
              </p>
            </div>

            <div className="relative">
              <HeroIndex courses={courseAtlas} />
            </div>
          </div>
        </section>

        {/* ─── LIBRARY STATS STRIP ─────────────────────── */}
        <section className="rounded-[1.5rem] border border-borderc bg-surface/85 px-5 py-4 sm:px-7">
          <div className="flex flex-wrap items-center justify-between gap-y-4">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
              <Stat label="Courses" value={courseAtlas.length} />
              <Stat label="Quiz sets" value={quizSets.length} />
              <Stat label="Questions" value={totalQuestions} />
              <Stat label="Practice" value={`${totalMinutes}m`} />
            </div>
            <Button asChild variant="ghost">
              <Link href="/courses">
                Browse the course atlas
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        {/* ─── STUDY MODES ─────────────────────────────────── */}
        <StudyModesSection />

        {/* ─── FEATURED COURSES ────────────────────────────── */}
        <section className="space-y-6">
          <SectionHeading
            title="Open a class. Start studying."
            description="The seeded course hubs are real. Each one bundles practice, walkthroughs, and reference material in one workspace."
            trailing={
              <Button asChild variant="ghost">
                <Link href="/courses">
                  All courses
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            }
          />

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {courseAtlas.map((course, idx) => (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="group relative flex flex-col overflow-hidden rounded-[1.4rem] border border-borderc bg-surface shadow-subtle transition-all duration-200 ease-out-expo hover:-translate-y-0.5 hover:border-border-accent hover:shadow-card-hover"
              >
                <div className="relative h-40 overflow-hidden border-b border-borderc bg-soft">
                  <Image
                    src={course.artwork}
                    alt={`${course.name} artwork`}
                    fill
                    className="object-cover transition-transform duration-500 ease-out-expo group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg/85 via-bg/15 to-transparent" />
                  <div className="absolute left-3 top-3">
                    <Badge tone="accent">{course.code}</Badge>
                  </div>
                  {/* Editorial volume numeral — small serif italic mark in
                      the corner that signals "curated collection," not
                      "generic catalog." Low contrast, intentionally quiet. */}
                  <span
                    aria-hidden
                    className="absolute right-3 top-3 select-none font-display text-[11px] italic text-text-secondary/70"
                    style={{ fontVariantNumeric: "oldstyle-nums" }}
                  >
                    № {String(idx + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <p className="font-display text-base font-semibold text-text">{course.name}</p>
                  <p className="mt-1.5 line-clamp-2 text-[13px] leading-snug text-text-secondary">
                    {course.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="rounded-full border border-borderc bg-soft px-2 py-0.5 text-[10.5px] font-bold text-text-secondary">
                      {course.quizCount} quiz
                    </span>
                    <span className="rounded-full border border-borderc bg-soft px-2 py-0.5 text-[10.5px] font-bold text-text-secondary">
                      {course.examCount} exam
                    </span>
                    <span className="rounded-full border border-borderc bg-soft px-2 py-0.5 text-[10.5px] font-bold text-text-secondary">
                      {course.homeworkCount} hw
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-2 border-t border-borderc pt-3 text-[12px] text-text-secondary">
                    <span>~{course.estimatedMinutes}m</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-accent transition-transform duration-200 group-hover:translate-x-0.5">
                      Open hub
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ─── WORKFLOW SPLIT ──────────────────────────────── */}
        <WorkflowSplit />

        {/* ─── INSTITUTION ─────────────────────────────────── */}
        <InstitutionSection />

        {/* ─── PRICING ─────────────────────────────────────── */}
        <PricingSection />

        {/* ─── ACCESS MODEL ────────────────────────────────── */}
        <AccessModelSection />

        {/* ─── TRUST ───────────────────────────────────────── */}
        <section className="space-y-6">
          <SectionHeading
            eyebrow="Built to be trusted"
            title="Quietly serious about the things that matter."
          />
          <TrustSection />
        </section>

        {/* ─── FINAL CTA ───────────────────────────────────── */}
        {/*
         * Calm closer. No aurora here — the hero already owns the
         * brand-gradient moment; repeating it three times turns the
         * page into an "AI marketing template." A solid surface with
         * strong typography is more sophisticated.
         */}
        <section>
          <div className="grid gap-6 rounded-[1.6rem] border border-borderc bg-surface p-6 sm:p-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-10 lg:p-10">
            <div className="space-y-4">
              {/* No eyebrow — the headline carries the moment. */}
              <h2 className="font-display text-[2.1rem] font-semibold leading-[1.05] tracking-tight text-text sm:text-[2.6rem]">
                The kind of study tool a student wishes their course already had.
              </h2>
              <p className="max-w-xl text-[15px] leading-relaxed text-text-secondary">
                Browse the public course library, or create an account to unlock
                saved progress, sections, mastery analytics, and the rest of the workspace.
              </p>
              <PublicAuthActions variant="closing" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.25rem] border border-borderc bg-surface/85 p-4">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-accent">
                  Already studying?
                </p>
                <p className="mt-1.5 font-display text-base font-semibold text-text">
                  Bring your class with you
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">
                  Ask us to spin up a hub for your course — we&apos;ll work directly with the instructor or department.
                </p>
                <Button asChild variant="ghost" className="mt-3 w-full justify-between">
                  <Link href="/contact?intent=implementation">
                    Request a class
                    <HeartHandshake className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="rounded-[1.25rem] border border-borderc bg-surface/85 p-4">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-accent">
                  Teaching a section?
                </p>
                <p className="mt-1.5 font-display text-base font-semibold text-text">
                  Start with a verified instructor account
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">
                  Sections, assignments, announcements, exam settings, and grading — all in one shell.
                </p>
                <Button asChild variant="ghost" className="mt-3 w-full justify-between">
                  <Link href="/contact?intent=implementation&role=teacher">
                    Talk to us
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
