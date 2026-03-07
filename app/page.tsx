import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ChartNoAxesCombined,
  Clock3,
  GraduationCap,
  LibraryBig,
  NotebookTabs,
  Orbit,
  ShieldCheck,
  Sparkles,
  Target,
  Timer
} from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PublicShell } from "@/components/layout/public-shell";
import { courses, quizSets } from "@/data/seed";
import { resolveQuizSetMode } from "@/lib/study/set-mode";

const courseArtworkById: Record<string, string> = {
  "software-engineering": "/images/courses/software-engineering.svg",
  "differential-equations": "/images/courses/differential-equations.svg",
  "computer-architecture": "/images/courses/computer-architecture.svg",
  "theory-of-automata": "/images/courses/theory-of-automata.svg"
};

const studyLanes = [
  {
    title: "Walkthrough quizzes",
    description: "Get reasoning, not just right-or-wrong feedback, so review sessions actually teach.",
    icon: Orbit
  },
  {
    title: "Timed practice",
    description: "Rehearse pacing under pressure with exam-style runs that feel focused instead of chaotic.",
    icon: Timer
  },
  {
    title: "Notes + references",
    description: "Keep course notes, cheat sheets, and section material in the same flow as the questions.",
    icon: NotebookTabs
  }
];

const platformBenefits = [
  {
    title: "Built around weak topics",
    description: "Momentum, streaks, and topic-level insight make the next study decision obvious.",
    icon: ChartNoAxesCombined
  },
  {
    title: "Clean enough to stay calm",
    description: "The interface is tuned for long study sessions, not noisy dashboards and dead-end clicks.",
    icon: Sparkles
  },
  {
    title: "Ready for real coursework",
    description: "Students, professors, and class sections all live in one academic workflow.",
    icon: GraduationCap
  }
];

const workflowSteps = [
  {
    step: "01",
    title: "Pick your course",
    description: "Open the course hub for software engineering, differential equations, architecture, or automata."
  },
  {
    step: "02",
    title: "Choose the mode",
    description: "Switch between walkthrough quizzes, homework practice, timed runs, and section material."
  },
  {
    step: "03",
    title: "Review with context",
    description: "Use notes, explanations, and progress signals to close gaps before they become exam problems."
  }
];

export default function LandingPage() {
  const totalQuestions = quizSets.reduce((sum, set) => sum + set.questions.length, 0);
  const quizCount = quizSets.filter((set) => resolveQuizSetMode(set) === "quiz").length;
  const examCount = quizSets.filter((set) => resolveQuizSetMode(set) === "exam").length;
  const homeworkCount = quizSets.filter((set) => resolveQuizSetMode(set) === "homework").length;

  return (
    <PublicShell>
      <section className="mx-auto w-full max-w-[1240px] px-0 pb-8 pt-4 sm:px-2 md:px-6 md:pb-12 md:pt-8">
        <div className="mesh-hero overflow-hidden rounded-[2rem] border border-borderc/80 bg-surface/60 shadow-[0_24px_80px_hsl(var(--bg)/0.45)] backdrop-blur-xl">
          <div className="grid gap-6 px-5 py-5 sm:px-7 sm:py-7 lg:grid-cols-[1.2fr_0.88fr] lg:px-10 lg:py-10">
            <div className="space-y-6">
              <div className="inline-flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-brand-2/35 bg-brand-2/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-2">
                  Academic study platform
                </span>
                <span className="rounded-full border border-borderc bg-surface/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
                  Cleaner than a folder of tabs
                </span>
              </div>

              <div className="space-y-4">
                <h1 className="max-w-[11ch] text-5xl font-display font-semibold leading-[0.94] tracking-tight text-text sm:max-w-[13ch] sm:text-[4.2rem]">
                  Turn course chaos into a calm study system.
                </h1>
                <p className="max-w-2xl text-base leading-relaxed text-text-secondary sm:text-lg">
                  United Exams brings quizzes, timed runs, notes, homework review, and professor-led class material
                  into one focused workspace so students can move faster without losing context.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button asChild size="lg" className="justify-between px-6">
                  <Link href="/signup">
                    Create account
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <Link href="/courses">Explore study materials</Link>
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.25rem] border border-borderc bg-surface/70 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-secondary">Walkthroughs</p>
                  <p className="mt-2 text-sm text-text-secondary">
                    Study with guidance instead of guessing why a question failed.
                  </p>
                </div>
                <div className="rounded-[1.25rem] border border-borderc bg-surface/70 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-secondary">Sections</p>
                  <p className="mt-2 text-sm text-text-secondary">
                    Open your professor’s material right from the same course flow.
                  </p>
                </div>
                <div className="rounded-[1.25rem] border border-borderc bg-surface/70 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-secondary">Timed practice</p>
                  <p className="mt-2 text-sm text-text-secondary">
                    Simulate pressure before the exam window shows up for real.
                  </p>
                </div>
              </div>
            </div>

            <Card className="relative overflow-hidden border-borderc bg-[linear-gradient(180deg,hsl(var(--surface)/0.92),hsl(var(--surface-raised)/0.82))]">
              <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,hsl(var(--brand-2)/0.18),transparent_70%)]" />
              <CardBody className="relative space-y-5 p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">Tonight&apos;s study flow</p>
                    <p className="mt-1 text-sm text-text-secondary">A cleaner path from “I need to study” to actual progress.</p>
                  </div>
                  <Badge tone="brand">Focus mode</Badge>
                </div>

                <div className="rounded-[1.4rem] border border-borderc bg-bg-inset/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-secondary">Primary route</p>
                      <p className="mt-1 text-lg font-semibold text-text">Course hub → practice mode → review</p>
                    </div>
                    <Target className="h-5 w-5 text-accent" />
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-borderc bg-surface/80 p-3">
                      <LibraryBig className="h-4 w-4 text-accent" />
                      <p className="mt-3 text-sm font-semibold text-text">Browse a course</p>
                      <p className="mt-1 text-xs leading-relaxed text-text-secondary">Open the material you actually need first.</p>
                    </div>
                    <div className="rounded-xl border border-borderc bg-surface/80 p-3">
                      <Clock3 className="h-4 w-4 text-accent" />
                      <p className="mt-3 text-sm font-semibold text-text">Pick the pace</p>
                      <p className="mt-1 text-xs leading-relaxed text-text-secondary">Study calmly or switch to timed practice.</p>
                    </div>
                    <div className="rounded-xl border border-borderc bg-surface/80 p-3">
                      <ShieldCheck className="h-4 w-4 text-accent" />
                      <p className="mt-3 text-sm font-semibold text-text">Review with context</p>
                      <p className="mt-1 text-xs leading-relaxed text-text-secondary">Keep notes and explanations close.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 rounded-[1.4rem] border border-borderc bg-soft/60 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-secondary">Platform snapshot</p>
                      <p className="mt-1 text-sm text-text-secondary">Core material already organized by course and mode.</p>
                    </div>
                    <Sparkles className="h-4 w-4 text-accent" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-borderc bg-surface/85 p-3">
                      <p className="text-[11px] text-text-secondary">Quiz sets</p>
                      <p className="mt-2 font-mono text-3xl font-bold text-text">{quizCount}</p>
                    </div>
                    <div className="rounded-xl border border-borderc bg-surface/85 p-3">
                      <p className="text-[11px] text-text-secondary">Exam sets</p>
                      <p className="mt-2 font-mono text-3xl font-bold text-text">{examCount}</p>
                    </div>
                    <div className="rounded-xl border border-borderc bg-surface/85 p-3">
                      <p className="text-[11px] text-text-secondary">Homework sets</p>
                      <p className="mt-2 font-mono text-3xl font-bold text-text">{homeworkCount}</p>
                    </div>
                    <div className="rounded-xl border border-borderc bg-surface/85 p-3">
                      <p className="text-[11px] text-text-secondary">Seed questions</p>
                      <p className="mt-2 font-mono text-3xl font-bold text-text">{totalQuestions}</p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1240px] px-0 pb-6 sm:px-2 md:px-6 md:pb-10">
        <div className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
          <Card className="overflow-hidden border-borderc bg-[linear-gradient(145deg,hsl(var(--brand-1)/0.12),hsl(var(--surface)),hsl(var(--brand-3)/0.08))]">
            <CardBody className="space-y-4 p-5 sm:p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">Why it feels easier</p>
              <h2 className="max-w-[16ch] text-3xl font-display font-semibold tracking-tight text-text sm:text-4xl">
                The homepage should tell you where to start in seconds.
              </h2>
              <p className="text-sm leading-relaxed text-text-secondary sm:text-base">
                Instead of dropping students into a vague product pitch, United Exams leads with the real workflow:
                pick a course, choose a study mode, then review with course-specific context still visible.
              </p>
              <Button asChild variant="secondary">
                <Link href="/courses">Open the catalog</Link>
              </Button>
            </CardBody>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            {studyLanes.map((lane, idx) => {
              const Icon = lane.icon;
              return (
                <Card
                  key={lane.title}
                  className={`group overflow-hidden border-borderc transition-all duration-200 ease-out-expo hover:border-border-accent hover:shadow-card-hover stagger-${idx + 1}`}
                >
                  <CardBody className="space-y-4 p-5 sm:p-6">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-gradient text-accent-fg shadow-soft">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-text">{lane.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-text-secondary">{lane.description}</p>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1240px] px-0 pb-8 sm:px-2 md:px-6 md:pb-12">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">Course lineup</p>
            <h2 className="mt-2 text-3xl font-display font-semibold tracking-tight text-text sm:text-4xl">
              Built around the classes students actually grind through
            </h2>
          </div>
          <Button asChild variant="ghost">
            <Link href="/courses">View all study materials</Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {courses.map((course, idx) => {
            const courseSets = quizSets.filter((set) => set.courseId === course.id);
            const courseQuizzes = courseSets.filter((set) => resolveQuizSetMode(set) === "quiz").length;
            const courseExams = courseSets.filter((set) => resolveQuizSetMode(set) === "exam").length;
            const courseHomework = courseSets.filter((set) => resolveQuizSetMode(set) === "homework").length;
            const artwork = courseArtworkById[course.id] ?? "/images/courses/default-course.svg";

            return (
              <Card
                key={course.id}
                className={`group overflow-hidden border-borderc transition-all duration-200 ease-out-expo hover:-translate-y-1 hover:border-border-accent hover:shadow-card-hover stagger-${idx + 1}`}
              >
                <div className="relative overflow-hidden border-b border-borderc bg-[radial-gradient(circle_at_top,hsl(var(--brand-2)/0.14),transparent_70%)]">
                  <Image
                    src={artwork}
                    alt={`${course.name} preview artwork`}
                    width={720}
                    height={420}
                    className="h-40 w-full object-cover transition-transform duration-300 ease-out-expo group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg/90 to-transparent px-4 pb-4 pt-10">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-secondary">{course.code}</p>
                        <p className="mt-1 text-xl font-semibold text-text">{course.name}</p>
                      </div>
                      <Badge tone={course.difficulty === "Advanced" ? "warn" : "default"}>{course.difficulty}</Badge>
                    </div>
                  </div>
                </div>

                <CardBody className="space-y-4 p-5 sm:p-6">
                  <p className="text-sm leading-relaxed text-text-secondary">{course.description}</p>

                  <div className="flex flex-wrap gap-2">
                    <Badge tone="brand">{courseQuizzes} quizzes</Badge>
                    <Badge tone="warn">{courseExams} exams</Badge>
                    <Badge tone="success">{courseHomework} homework</Badge>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {course.tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-borderc px-2.5 py-1 text-[11px] text-text-secondary">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <Button asChild variant="secondary" className="w-full justify-between">
                    <Link href={`/courses/${course.id}`}>
                      Open study materials
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1240px] px-0 pb-8 sm:px-2 md:px-6 md:pb-12">
        <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="overflow-hidden border-borderc">
            <CardHeader className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">How it works</p>
              <h2 className="text-3xl font-display font-semibold tracking-tight text-text sm:text-4xl">
                A better study loop in three moves
              </h2>
            </CardHeader>
            <CardBody className="grid gap-4 p-5 sm:p-6">
              {workflowSteps.map((item) => (
                <div
                  key={item.step}
                  className="rounded-[1.35rem] border border-borderc bg-soft/70 p-4 sm:p-5"
                >
                  <div className="flex items-start gap-4">
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent-subtle font-mono text-sm font-bold text-accent">
                      {item.step}
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold text-text">{item.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-text-secondary">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>

          <div className="grid gap-4">
            {platformBenefits.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <Card
                  key={benefit.title}
                  className={`overflow-hidden border-borderc transition-all duration-200 ease-out-expo hover:border-border-accent hover:shadow-card-hover stagger-${idx + 1}`}
                >
                  <CardBody className="flex gap-4 p-5 sm:p-6">
                    <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,hsl(var(--brand-1)/0.18),hsl(var(--brand-3)/0.12))] text-accent">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-text">{benefit.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-text-secondary">{benefit.description}</p>
                    </div>
                  </CardBody>
                </Card>
              );
            })}

            <Card className="overflow-hidden border-borderc bg-[linear-gradient(145deg,hsl(var(--brand-1)/0.16),hsl(var(--surface)),hsl(var(--brand-3)/0.14))]">
              <CardBody className="space-y-4 p-5 sm:p-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">For professors too</p>
                <h3 className="text-2xl font-display font-semibold text-text">Sections, materials, homework, and announcements stay tied to the course.</h3>
                <p className="text-sm leading-relaxed text-text-secondary">
                  Students do not need to hunt through separate tools. Professors can post material and manage class
                  workflows inside the same academic space the students already use for review.
                </p>
                <Button asChild>
                  <Link href="/signup">
                    Start with an account
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1240px] px-0 pb-12 sm:px-2 md:px-6 md:pb-16">
        <div className="overflow-hidden rounded-[2rem] border border-borderc bg-[linear-gradient(135deg,hsl(var(--surface-raised)/0.96),hsl(var(--surface)/0.92),hsl(var(--brand-3)/0.08))] p-5 shadow-subtle sm:p-7 md:p-10">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">Ready to study with more structure</p>
              <h2 className="mt-3 max-w-[14ch] text-4xl font-display font-semibold leading-tight tracking-tight text-text sm:text-5xl">
                Start with a course, not a mess of tabs.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-text-secondary">
                Browse public study material now, or create an account to unlock progress tracking, course enrollment,
                and section-based workflows.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Button asChild size="lg" className="w-full justify-between">
                <Link href="/courses">
                  Browse courses
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="w-full">
                <Link href="/signup">Create account</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
