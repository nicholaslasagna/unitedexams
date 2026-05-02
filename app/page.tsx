import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  HeartHandshake,
  Sparkles
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PublicShell } from "@/components/layout/public-shell";
import { PublicAuthActions } from "@/components/public/public-auth-actions";
import { HeroPreview } from "@/components/marketing/hero-preview";
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

          <div className="relative grid gap-8 px-1 py-3 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-10 lg:px-2 lg:py-6">
            <div className="space-y-6">
              <span className="eyebrow">
                <Sparkles className="h-3 w-3" />
                The course-native study platform
              </span>

              <h1 className="display-hero">
                Study that{" "}
                <span className="text-gradient">feels alive</span>
                <span className="text-accent">.</span>
              </h1>

              <p className="max-w-xl text-[16px] leading-relaxed text-text-secondary">
                Course-native quizzes, walkthroughs, timed exam simulations, and
                notes — anchored to the class, not a flashcard pile. Built for real
                courses. Calm enough for daily use.
              </p>

              <PublicAuthActions variant="hero" />

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px] text-text-secondary">
                <span className="inline-flex items-center gap-1.5">
                  <span className="live-dot" />
                  No credit card to try
                </span>
                <span className="hidden h-3 w-px bg-borderc sm:inline-block" />
                <span>Free is generous</span>
                <span className="hidden h-3 w-px bg-borderc sm:inline-block" />
                <span>Verified school users see no paywalls</span>
              </div>

              <div className="grid gap-2.5 pt-2 sm:grid-cols-3">
                {[
                  ["Course-native", "Everything stays tied to the class."],
                  ["Immediate feedback", "Practice tells you what to fix."],
                  ["Section-aware", "Sections, assignments, exams, posts."]
                ].map(([title, text]) => (
                  <div
                    key={title}
                    className="rounded-[1rem] border border-borderc bg-surface/72 p-3 backdrop-blur"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
                      {title}
                    </p>
                    <p className="mt-1.5 text-[12.5px] leading-snug text-text-secondary">
                      {text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <HeroPreview />
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
            eyebrow="Course atlas"
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
            {courseAtlas.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="group relative flex flex-col overflow-hidden rounded-[1.4rem] border border-borderc bg-surface shadow-subtle transition-all duration-200 ease-out-expo hover:-translate-y-0.5 hover:border-border-accent hover:shadow-card-hover"
              >
                <div className="relative h-36 overflow-hidden border-b border-borderc bg-soft">
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
        <section className="relative">
          <div className="aurora absolute inset-0 -z-10 rounded-[2rem] opacity-80" aria-hidden />
          <div className="relative grid gap-6 overflow-hidden rounded-[2rem] border border-borderc bg-surface/72 p-6 shadow-elevated backdrop-blur-xl sm:p-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-10 lg:p-10">
            <div className="space-y-4">
              <span className="eyebrow">Step into it</span>
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
