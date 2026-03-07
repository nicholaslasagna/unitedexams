import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  LibraryBig,
  NotebookTabs,
  ShieldCheck,
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

export default function LandingPage() {
  const quizCount = quizSets.filter((set) => resolveQuizSetMode(set) === "quiz").length;
  const examCount = quizSets.filter((set) => resolveQuizSetMode(set) === "exam").length;
  const homeworkCount = quizSets.filter((set) => resolveQuizSetMode(set) === "homework").length;
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
          <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <Card className="overflow-hidden border-borderc">
              <CardBody className="space-y-5 p-5 sm:p-6">
                <div className="space-y-2.5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">Study platform</p>
                  <h1 className="max-w-[12ch] text-3xl font-display font-semibold leading-[0.96] tracking-tight text-text sm:text-[3.5rem]">
                    Study smarter for hard classes.
                  </h1>
                  <p className="max-w-xl text-sm leading-relaxed text-text-secondary sm:text-[15px]">
                    United Exams keeps quizzes, homework walkthroughs, notes, and section material inside one course-centered workspace.
                  </p>
                </div>

                <PublicAuthActions variant="hero" />

                <div className="grid gap-3 sm:grid-cols-4">
                  <div className="rounded-[1rem] border border-borderc bg-surface/76 px-4 py-2.5">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-text-secondary">Courses</p>
                    <p className="mt-1.5 font-mono text-xl font-bold text-text">{courseAtlas.length}</p>
                  </div>
                  <div className="rounded-[1rem] border border-borderc bg-surface/76 px-4 py-2.5">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-text-secondary">Quiz sets</p>
                    <p className="mt-1.5 font-mono text-xl font-bold text-text">{quizCount}</p>
                  </div>
                  <div className="rounded-[1rem] border border-borderc bg-surface/76 px-4 py-2.5">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-text-secondary">Exam sets</p>
                    <p className="mt-1.5 font-mono text-xl font-bold text-text">{examCount}</p>
                  </div>
                  <div className="rounded-[1rem] border border-borderc bg-surface/76 px-4 py-2.5">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-text-secondary">Homework</p>
                    <p className="mt-1.5 font-mono text-xl font-bold text-text">{homeworkCount}</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="overflow-hidden border-borderc">
              <div className="relative h-48 overflow-hidden border-b border-borderc bg-surface">
                <Image
                  src={featuredCourse.artwork}
                  alt={`${featuredCourse.name} course artwork`}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">Featured course</p>
                  <p className="mt-1 text-xl font-display font-semibold text-text">{featuredCourse.name}</p>
                  <p className="mt-1 text-sm text-text-secondary">{featuredCourse.code} · {featuredCourse.difficulty}</p>
                </div>
              </div>
              <CardBody className="space-y-4 p-5">
                <p className="text-sm leading-relaxed text-text-secondary">{featuredCourse.description}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge tone="brand">{featuredCourse.quizCount} quizzes</Badge>
                  <Badge tone="warn">{featuredCourse.examCount} exams</Badge>
                  <Badge tone="success">{featuredCourse.homeworkCount} homework</Badge>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1rem] border border-borderc bg-surface/74 p-3.5">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-text-secondary">Question bank</p>
                    <p className="mt-1.5 font-mono text-xl font-bold text-text">{featuredQuestionCount}</p>
                  </div>
                  <div className="rounded-[1rem] border border-borderc bg-surface/74 p-3.5">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-text-secondary">Estimated runway</p>
                    <p className="mt-1.5 font-mono text-xl font-bold text-text">{featuredCourse.estimatedMinutes}m</p>
                  </div>
                </div>
                <Button asChild className="w-full justify-between">
                  <Link href={`/courses/${featuredCourse.id}`}>
                    Open {featuredCourse.name}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardBody>
            </Card>
          </div>
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

          <div className="grid gap-4 lg:grid-cols-[1.04fr_0.96fr]">
            <Card className="story-panel overflow-hidden border-borderc">
              <div className="grid gap-0 lg:grid-cols-[0.98fr_1.02fr]">
                <div className="relative min-h-[240px] overflow-hidden border-b border-borderc lg:min-h-full lg:border-b-0 lg:border-r">
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

            <div className="grid gap-4">
              {secondaryCourses.map((course) => (
                <Card key={course.id} className="story-panel overflow-hidden border-borderc transition-all duration-200 ease-out-expo hover:-translate-y-0.5 hover:border-border-accent hover:shadow-card-hover">
                  <div className="grid gap-0 sm:grid-cols-[0.42fr_0.58fr]">
                    <div className="relative min-h-[150px] overflow-hidden border-b border-borderc sm:min-h-full sm:border-b-0 sm:border-r">
                      <Image
                        src={course.artwork}
                        alt={`${course.name} course artwork`}
                        width={720}
                        height={560}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/30 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-3.5">
                        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-text-secondary">{course.code}</p>
                        <p className="mt-1 text-lg font-semibold text-text">{course.name}</p>
                      </div>
                    </div>
                    <CardBody className="space-y-3.5 p-4 sm:p-5">
                      <div className="flex flex-wrap gap-2">
                        <Badge tone={course.difficulty === "Advanced" ? "warn" : "default"}>{course.difficulty}</Badge>
                        <Badge tone="brand">{course.quizCount} quizzes</Badge>
                        <Badge tone="warn">{course.examCount} exams</Badge>
                      </div>
                      <p className="text-sm leading-relaxed text-text-secondary">{course.description}</p>
                      <Button asChild variant="secondary" className="w-full justify-between">
                        <Link href={`/courses/${course.id}`}>
                          Open course hub
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </CardBody>
                  </div>
                </Card>
              ))}
            </div>
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
