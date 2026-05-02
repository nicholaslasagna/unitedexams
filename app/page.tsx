import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Clock3,
  HeartHandshake,
  LibraryBig,
  NotebookTabs,
  ShieldCheck,
  Sparkles,
  Timer
} from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PublicShell } from "@/components/layout/public-shell";
import { PublicAuthActions } from "@/components/public/public-auth-actions";
import { courses, quizSets } from "@/data/seed";
import { resolveQuizSetMode } from "@/lib/study/set-mode";

const courseArtworkById: Record<string, string> = {
  "software-engineering": "/images/courses/software-engineering.svg",
  "differential-equations": "/images/courses/differential-equations.svg",
  "computer-architecture": "/images/courses/computer-architecture.svg",
  "theory-of-automata": "/images/courses/theory-of-automata.svg"
};

const operatingModes = [
  {
    title: "Guided quiz",
    description: "Practice concepts with explanations and hints without leaving the course context.",
    icon: LibraryBig,
    tone: "brand" as const
  },
  {
    title: "Homework mode",
    description: "Slow down hard problems, hide or reveal hints, and work through the method step by step.",
    icon: NotebookTabs,
    tone: "success" as const
  },
  {
    title: "Timed exam",
    description: "Rehearse pacing and pressure before the real section exam window opens.",
    icon: Timer,
    tone: "warn" as const
  }
];

const implementationPaths = [
  {
    title: "Students",
    description:
      "Tell us which class needs a United Exams study hub. We can turn scattered review files, notes, and practice into one focused route.",
    href: "/contact?intent=implementation&role=student"
  },
  {
    title: "Teachers",
    description:
      "Ask about bringing sections, announcements, assignments, exam review, and grade-aware feedback into your course workflow.",
    href: "/contact?intent=implementation&role=teacher"
  }
];

export default function LandingPage() {
  const totalMinutes = quizSets.reduce((sum, set) => sum + set.estMinutes, 0);

  const courseAtlas = courses
    .map((course) => {
      const sets = quizSets.filter((set) => set.courseId === course.id);
      return {
        ...course,
        artwork: courseArtworkById[course.id] ?? "/images/courses/default-course.svg",
        quizCount: sets.filter((set) => resolveQuizSetMode(set) === "quiz").length,
        examCount: sets.filter((set) => resolveQuizSetMode(set) === "exam").length,
        homeworkCount: sets.filter((set) => resolveQuizSetMode(set) === "homework").length,
        estimatedMinutes: sets.reduce((sum, set) => sum + set.estMinutes, 0)
      };
    })
    .sort((left, right) => (right.quizCount + right.examCount + right.homeworkCount) - (left.quizCount + left.examCount + left.homeworkCount));

  const featuredCourse =
    courseAtlas.find((course) => course.id === "differential-equations") ?? courseAtlas[0];
  const secondaryCourses = courseAtlas.filter((course) => course.id !== featuredCourse.id);
  const featuredQuestionCount = quizSets
    .filter((set) => set.courseId === featuredCourse.id)
    .reduce((sum, set) => sum + set.questions.length, 0);

  return (
    <PublicShell>
      <div className="space-y-8 pb-12 md:space-y-10 md:pb-16">
        <section className="mx-auto w-full max-w-[1280px] px-0 sm:px-2 md:px-6">
          <Card className="story-panel signal-grid overflow-hidden border-border-accent/70 shadow-elevated">
            <CardBody className="relative grid gap-6 p-5 sm:p-6 lg:grid-cols-[1.04fr_0.96fr] lg:p-7">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent-subtle/70 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-accent">
                  <Sparkles className="h-3.5 w-3.5" />
                  Built for classes that deserve better
                </div>
                <div className="space-y-3">
                  <h1 className="max-w-[11ch] text-4xl font-display font-semibold leading-[0.94] tracking-tight text-text sm:text-[4.25rem]">
                    Study that feels alive.
                  </h1>
                  <p className="max-w-2xl text-sm leading-relaxed text-text-secondary sm:text-[15px]">
                    United Exams turns course material into beautiful practice: guided quizzes, homework walkthroughs, notes, timed simulations, sections, grades, and professor updates in one calm academic workspace.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <PublicAuthActions variant="hero" />
                  <Button asChild variant="secondary">
                    <Link href="/contact?intent=implementation">
                      Bring this to a class
                      <HeartHandshake className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-3">
                  {[
                    ["Course-native", "Everything stays tied to the class."],
                    ["Immediate feedback", "Practice tells you what to fix."],
                    ["Teacher-ready", "Sections, assignments, exams, and posts."]
                  ].map(([title, text]) => (
                    <div key={title} className="rounded-[1rem] border border-borderc/80 bg-surface/58 p-3 backdrop-blur">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-accent">{title}</p>
                      <p className="mt-1.5 text-xs leading-relaxed text-text-secondary">{text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4">
                <Link
                  href={`/courses/${featuredCourse.id}`}
                  className="group overflow-hidden rounded-[1.35rem] border border-borderc bg-bg/58 shadow-glass transition-all duration-200 ease-out-expo hover:-translate-y-0.5 hover:border-border-accent hover:shadow-glow"
                >
                  <div className="relative h-56 overflow-hidden border-b border-borderc bg-surface sm:h-64">
                    <Image
                      src={featuredCourse.artwork}
                      alt={`${featuredCourse.name} course artwork`}
                      fill
                      className="object-cover transition-transform duration-500 ease-out-expo group-hover:scale-[1.035]"
                    />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,hsl(var(--accent)/0.28),transparent_30%),linear-gradient(to_top,hsl(var(--bg)/0.94),transparent_72%)]" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <Badge tone="brand">Featured course</Badge>
                      <p className="mt-3 text-2xl font-display font-semibold tracking-tight text-text">
                        {featuredCourse.name}
                      </p>
                      <p className="mt-1 text-sm text-text-secondary">
                        {featuredCourse.code} · {featuredQuestionCount} questions · {featuredCourse.estimatedMinutes}m
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 p-4 text-sm font-semibold text-text">
                    <span>Open course hub</span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </div>
                </Link>

                <div className="rounded-[1.35rem] border border-borderc bg-surface/70 p-4 shadow-subtle backdrop-blur">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">Campus signal</p>
                  <p className="mt-2 text-lg font-display font-semibold text-text">Want this for your own course?</p>
                  <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                    Students and teachers can request a class-ready implementation with the material they already have.
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </section>

        <section className="mx-auto w-full max-w-[1280px] px-0 sm:px-2 md:px-6">
          <div className="grid gap-4 md:grid-cols-3">
            {operatingModes.map((mode) => {
              const Icon = mode.icon;
              return (
                <Card key={mode.title} className="overflow-hidden border-borderc">
                  <CardBody className="space-y-4 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <Icon className="h-5 w-5 text-accent" />
                      <Badge tone={mode.tone}>{mode.title}</Badge>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-text">{mode.title}</p>
                      <p className="mt-2 text-sm leading-relaxed text-text-secondary">{mode.description}</p>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1280px] px-0 sm:px-2 md:px-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="overflow-hidden border-borderc">
              <CardBody className="space-y-3 p-5">
                <LibraryBig className="h-5 w-5 text-accent" />
                <p className="text-lg font-semibold text-text">Course-first</p>
                <p className="text-sm leading-relaxed text-text-secondary">
                  Every route starts from the class itself so notes, quizzes, homework, and section material stay aligned.
                </p>
              </CardBody>
            </Card>
            <Card className="overflow-hidden border-borderc">
              <CardBody className="space-y-3 p-5">
                <Clock3 className="h-5 w-5 text-accent" />
                <p className="text-lg font-semibold text-text">Structured practice</p>
                <p className="text-sm leading-relaxed text-text-secondary">
                  Roughly {totalMinutes} minutes of seed practice are already organized into course-specific routes.
                </p>
              </CardBody>
            </Card>
            <Card className="overflow-hidden border-borderc">
              <CardBody className="space-y-3 p-5">
                <ShieldCheck className="h-5 w-5 text-accent" />
                <p className="text-lg font-semibold text-text">Section-aware</p>
                <p className="text-sm leading-relaxed text-text-secondary">
                  Public course hubs stay separate from professor-only class content, but the transition between them stays clean.
                </p>
              </CardBody>
            </Card>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1280px] px-0 sm:px-2 md:px-6">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">Course atlas</p>
              <h2 className="mt-1.5 text-2xl font-display font-semibold tracking-tight text-text sm:text-3xl">
                Course hubs, not bloated menus.
              </h2>
            </div>
            <Button asChild variant="ghost">
              <Link href="/courses">View all course hubs</Link>
            </Button>
          </div>

          <div className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
            <Card className="overflow-hidden border-borderc">
              <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
                <div className="relative min-h-[220px] overflow-hidden border-b border-borderc lg:min-h-full lg:border-b-0 lg:border-r">
                  <Image
                    src={featuredCourse.artwork}
                    alt={`${featuredCourse.name} course artwork`}
                    width={960}
                    height={720}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/35 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">Featured lane</p>
                    <p className="mt-1.5 text-2xl font-display font-semibold text-text">{featuredCourse.name}</p>
                    <p className="mt-1 text-sm text-text-secondary">{featuredCourse.code} · {featuredCourse.difficulty}</p>
                  </div>
                </div>
                <CardBody className="space-y-4 p-5">
                  <div className="flex flex-wrap gap-2">
                    <Badge tone="brand">{featuredCourse.quizCount} quizzes</Badge>
                    <Badge tone="warn">{featuredCourse.examCount} exams</Badge>
                    <Badge tone="success">{featuredCourse.homeworkCount} homework</Badge>
                  </div>
                  <p className="text-sm leading-relaxed text-text-secondary">{featuredCourse.description}</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1rem] border border-borderc bg-surface/74 p-3.5">
                      <p className="text-[10px] uppercase tracking-[0.16em] text-text-secondary">Topics</p>
                      <div className="mt-2.5 flex flex-wrap gap-2">
                        {featuredCourse.tags.map((tag) => (
                          <span key={tag} className="rounded-full border border-borderc px-2.5 py-1 text-[11px] text-text-secondary">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-[1rem] border border-borderc bg-surface/74 p-3.5">
                      <p className="text-[10px] uppercase tracking-[0.16em] text-text-secondary">Estimated runway</p>
                      <p className="mt-2 font-mono text-2xl font-bold text-text">{featuredCourse.estimatedMinutes}m</p>
                      <p className="mt-1 text-xs text-text-secondary">Across current study material.</p>
                    </div>
                  </div>
                  <Button asChild className="w-full justify-between">
                    <Link href={`/courses/${featuredCourse.id}`}>
                      Open {featuredCourse.name}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardBody>
              </div>
            </Card>

            <Card className="overflow-hidden border-borderc">
              <CardHeader className="space-y-2 pb-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">Other courses</p>
                <h3 className="text-xl font-display font-semibold text-text">A direct list, not another card wall.</h3>
              </CardHeader>
              <CardBody className="space-y-0 p-0">
                {secondaryCourses.map((course, index) => (
                  <Link
                    key={course.id}
                    href={`/courses/${course.id}`}
                    className={`flex items-center justify-between gap-4 px-5 py-4 text-sm transition-colors duration-200 hover:bg-surface/70 ${index !== 0 ? "border-t border-borderc" : ""}`}
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-text">{course.name}</p>
                        <span className="text-xs uppercase tracking-[0.14em] text-text-secondary">{course.code}</span>
                      </div>
                      <p className="mt-1 text-sm text-text-secondary">
                        {course.quizCount} quizzes · {course.examCount} exams · {course.homeworkCount} homework
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-text-secondary" />
                  </Link>
                ))}
              </CardBody>
            </Card>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1280px] px-0 sm:px-2 md:px-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="overflow-hidden border-borderc">
              <CardHeader className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">For students</p>
                <h2 className="text-xl font-display font-semibold text-text">Keep everything in one study flow.</h2>
              </CardHeader>
              <CardBody className="space-y-3 p-5 sm:p-6">
                <div className="rounded-[1rem] border border-borderc bg-surface/72 px-4 py-3 text-sm leading-relaxed text-text-secondary">
                  Open a course hub and switch between study modes without losing context.
                </div>
                <div className="rounded-[1rem] border border-borderc bg-surface/72 px-4 py-3 text-sm leading-relaxed text-text-secondary">
                  Join a section to see professor material, homework, and announcements for that specific class.
                </div>
                <div className="rounded-[1rem] border border-borderc bg-surface/72 px-4 py-3 text-sm leading-relaxed text-text-secondary">
                  Use the same workspace for notes, guided review, and timed rehearsal.
                </div>
              </CardBody>
            </Card>

            <Card className="overflow-hidden border-borderc">
              <CardHeader className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">For professors</p>
                <h2 className="text-xl font-display font-semibold text-text">Manage the class from one shell.</h2>
              </CardHeader>
              <CardBody className="space-y-3 p-5 sm:p-6">
                <div className="rounded-[1rem] border border-borderc bg-surface/72 px-4 py-3 text-sm leading-relaxed text-text-secondary">
                  Run sections, post material, assign work, and monitor exam integrity from one place.
                </div>
                <div className="rounded-[1rem] border border-borderc bg-surface/72 px-4 py-3 text-sm leading-relaxed text-text-secondary">
                  Publish announcements and grading updates directly to enrolled students.
                </div>
                <div className="rounded-[1rem] border border-borderc bg-surface/72 px-4 py-3 text-sm leading-relaxed text-text-secondary">
                  Keep section content private while the public study library remains site-managed and separate.
                </div>
              </CardBody>
            </Card>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1280px] px-0 sm:px-2 md:px-6">
          <div className="overflow-hidden rounded-[1.6rem] border border-borderc bg-[linear-gradient(135deg,hsl(var(--surface-raised)/0.96),hsl(var(--accent-wash)/0.8))] shadow-elevated">
            <div className="grid gap-0 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="border-b border-borderc p-5 sm:p-6 lg:border-b-0 lg:border-r">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-accent/25 bg-accent-subtle text-accent">
                  <Building2 className="h-5 w-5" />
                </div>
                <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.18em] text-accent">Class implementation</p>
                <h2 className="mt-2 max-w-[15ch] text-2xl font-display font-semibold leading-tight tracking-tight text-text sm:text-3xl">
                  Bring United Exams into a real course.
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                  If a student wants better study support or a teacher wants a cleaner class workflow, this is the handoff point.
                </p>
              </div>

              <div className="grid gap-0 md:grid-cols-2">
                {implementationPaths.map((path, index) => (
                  <Link
                    key={path.title}
                    href={path.href}
                    className={`group flex min-h-[220px] flex-col justify-between p-5 transition-colors duration-200 hover:bg-surface/72 sm:p-6 ${index > 0 ? "border-t border-borderc md:border-l md:border-t-0" : ""}`}
                  >
                    <div>
                      <Badge tone={path.title === "Students" ? "success" : "warn"}>{path.title}</Badge>
                      <p className="mt-4 text-xl font-display font-semibold text-text">
                        {path.title === "Students" ? "Request this for my class" : "Explore this for my course"}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-text-secondary">{path.description}</p>
                    </div>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent">
                      Contact United Exams
                      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1280px] px-0 sm:px-2 md:px-6">
          <div className="overflow-hidden rounded-[1.6rem] border border-borderc bg-panel px-5 py-5 shadow-subtle sm:px-6">
            <div className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">Ready to step into it</p>
                <h2 className="mt-2 max-w-[16ch] text-2xl font-display font-semibold leading-tight tracking-tight text-text sm:text-3xl">
                  Start with a course hub, then move into the app when you need more.
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-text-secondary">
                  Browse the public study library now, or create an account to unlock saved progress, sections, professor workflows, and a tighter academic routine.
                </p>
              </div>

              <PublicAuthActions variant="closing" />
            </div>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
