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
    title: "Walkthrough quiz",
    description: "Reason through questions with explanations and hints while the course context stays visible.",
    icon: Orbit,
    tone: "brand" as const
  },
  {
    title: "Homework breakdown",
    description: "Slow down difficult problems, hide or reveal hints, and learn the full method instead of memorizing outputs.",
    icon: NotebookTabs,
    tone: "success" as const
  },
  {
    title: "Timed exam review",
    description: "Rehearse pacing, pressure, and section-specific expectations before the real window opens.",
    icon: Timer,
    tone: "warn" as const
  }
];

const experiencePillars = [
  {
    title: "Course-first architecture",
    description: "Every route starts from the class itself, so quizzes, notes, homework, and section material stay in one mental model.",
    icon: LibraryBig
  },
  {
    title: "Progress with consequence",
    description: "Weak-topic signals, streaks, and recent attempts make the next move obvious instead of ornamental.",
    icon: ChartNoAxesCombined
  },
  {
    title: "Calm under pressure",
    description: "The interface is tuned to reduce friction in long study sessions, not impress people with noisy dashboards.",
    icon: Sparkles
  }
];

const roleTracks = [
  {
    title: "For students",
    points: [
      "Open a course hub and switch between study modes without losing context.",
      "Join a section to see professor material, homework, and course-specific announcements.",
      "Use the same workspace for notes, guided review, and timed rehearsal."
    ],
    icon: GraduationCap
  },
  {
    title: "For professors",
    points: [
      "Run sections, post material, assign work, and monitor class integrity from the same academic shell.",
      "Publish announcements and grading updates directly to enrolled students.",
      "Keep class content private to the section while the public library remains site-managed."
    ],
    icon: ShieldCheck
  }
];

export default function LandingPage() {
  const totalQuestions = quizSets.reduce((sum, set) => sum + set.questions.length, 0);
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

  const marqueeTopics = [
    "Laplace transforms",
    "UML modeling",
    "Cache pipelines",
    "DFA minimization",
    "Step-by-step homework",
    "Timed exam rehearsal",
    "Professor sections",
    "Integrity monitoring",
    "Course notes",
    "Weak-topic review"
  ];

  return (
    <PublicShell>
      <div className="space-y-8 pb-12 md:space-y-10 md:pb-16">
        <section className="mx-auto w-full max-w-[1280px] px-0 sm:px-2 md:px-6">
          <div className="story-panel signal-grid overflow-hidden rounded-[2.5rem] border border-borderc/80 shadow-[0_28px_90px_hsl(var(--bg)/0.42)]">
            <div className="grid gap-6 px-5 py-5 sm:px-7 sm:py-7 lg:grid-cols-[1.08fr_0.92fr] lg:px-10 lg:py-10">
              <div className="space-y-7">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="editorial-kicker">A study system with taste</span>
                  <span className="rounded-full border border-borderc bg-surface/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                    Built for high-pressure classes
                  </span>
                </div>

                <div className="space-y-4">
                  <h1 className="max-w-[10ch] text-5xl font-display font-semibold leading-[0.9] tracking-tight text-text sm:text-[4.6rem]">
                    A control room for hard coursework.
                  </h1>
                  <p className="max-w-2xl text-base leading-relaxed text-text-secondary sm:text-lg">
                    United Exams turns quizzes, exam reviews, homework walkthroughs, notes, and professor-run sections
                    into one authored workspace. It feels less like a student portal and more like a serious operating system for study.
                  </p>
                </div>

                <PublicAuthActions variant="hero" />

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-[1.35rem] border border-borderc bg-surface/74 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-text-secondary">Public library</p>
                    <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                      Site-managed course material stays clean, curated, and separate from professor-only class content.
                    </p>
                  </div>
                  <div className="rounded-[1.35rem] border border-borderc bg-surface/74 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-text-secondary">Section-aware</p>
                    <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                      Join a class and the same course flow can route you straight into your professor’s material.
                    </p>
                  </div>
                  <div className="rounded-[1.35rem] border border-borderc bg-surface/74 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-text-secondary">Built for long sessions</p>
                    <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                      Homework, notes, and timed practice live together so the workflow stays calm instead of fragmented.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                <Card className="story-panel overflow-hidden border-borderc bg-surface/84 shadow-[0_20px_60px_hsl(var(--bg)/0.28)]">
                  <CardBody className="space-y-5 p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">Tonight&apos;s route</p>
                        <p className="mt-1 text-sm text-text-secondary">How the product is meant to feel in a real study session.</p>
                      </div>
                      <Badge tone="accent">Live flow</Badge>
                    </div>

                    <div className="rounded-[1.45rem] border border-borderc bg-bg-inset/72 p-4">
                      <div className="grid gap-3 sm:grid-cols-[0.88fr_1.12fr]">
                        <div className="space-y-3">
                          <div className="rounded-[1.1rem] border border-borderc bg-surface/82 p-3">
                            <p className="text-[10px] uppercase tracking-[0.18em] text-text-secondary">Current course</p>
                            <p className="mt-2 text-xl font-semibold text-text">{featuredCourse.name}</p>
                            <p className="mt-1 text-xs text-text-secondary">{featuredCourse.code} · {featuredCourse.difficulty}</p>
                          </div>
                          <div className="rounded-[1.1rem] border border-borderc bg-surface/82 p-3">
                            <p className="text-[10px] uppercase tracking-[0.18em] text-text-secondary">Pressure mix</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <Badge tone="brand">{featuredCourse.quizCount} quizzes</Badge>
                              <Badge tone="warn">{featuredCourse.examCount} exams</Badge>
                              <Badge tone="success">{featuredCourse.homeworkCount} homework</Badge>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-[1.1rem] border border-borderc bg-surface/82 p-4">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-secondary">Mission board</p>
                                <p className="mt-1 text-sm font-semibold text-text">Course hub → homework breakdown → timed exam review</p>
                              </div>
                              <Target className="h-4 w-4 text-accent" />
                            </div>
                            <div className="space-y-3">
                              <div className="flex items-start gap-3">
                                <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent-subtle text-xs font-bold text-accent">1</span>
                                <div>
                                  <p className="text-sm font-semibold text-text">Rebuild the method</p>
                                  <p className="text-xs leading-relaxed text-text-secondary">Start in homework mode with hints hidden until needed.</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-3">
                                <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent-subtle text-xs font-bold text-accent">2</span>
                                <div>
                                  <p className="text-sm font-semibold text-text">Open the professor section</p>
                                  <p className="text-xs leading-relaxed text-text-secondary">Read announcements, notes, and assignment context without leaving the course.</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-3">
                                <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent-subtle text-xs font-bold text-accent">3</span>
                                <div>
                                  <p className="text-sm font-semibold text-text">Switch into timed pressure</p>
                                  <p className="text-xs leading-relaxed text-text-secondary">Use exam mode when you want pacing, not when you still need the method.</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                <div className="grid gap-4 md:grid-cols-[1.02fr_0.98fr]">
                  <Card className="story-panel overflow-hidden border-borderc bg-surface/82">
                    <CardBody className="p-5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">Platform inventory</p>
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-[1rem] border border-borderc bg-surface/78 p-3">
                          <p className="text-[10px] uppercase tracking-[0.16em] text-text-secondary">Quiz sets</p>
                          <p className="mt-2 font-mono text-3xl font-bold text-text">{quizCount}</p>
                        </div>
                        <div className="rounded-[1rem] border border-borderc bg-surface/78 p-3">
                          <p className="text-[10px] uppercase tracking-[0.16em] text-text-secondary">Exam sets</p>
                          <p className="mt-2 font-mono text-3xl font-bold text-text">{examCount}</p>
                        </div>
                        <div className="rounded-[1rem] border border-borderc bg-surface/78 p-3">
                          <p className="text-[10px] uppercase tracking-[0.16em] text-text-secondary">Homework</p>
                          <p className="mt-2 font-mono text-3xl font-bold text-text">{homeworkCount}</p>
                        </div>
                        <div className="rounded-[1rem] border border-borderc bg-surface/78 p-3">
                          <p className="text-[10px] uppercase tracking-[0.16em] text-text-secondary">Question bank</p>
                          <p className="mt-2 font-mono text-3xl font-bold text-text">{totalQuestions}</p>
                        </div>
                      </div>
                    </CardBody>
                  </Card>

                  <Card className="story-panel overflow-hidden border-borderc bg-surface/82">
                    <CardBody className="p-5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">Why it feels different</p>
                      <div className="mt-4 space-y-3 text-sm text-text-secondary">
                        <p>The platform is organized around course hubs instead of disconnected tools.</p>
                        <p>You can move from public study material to section-only content without changing mental context.</p>
                        <p className="flex items-center gap-2 text-text">
                          <Clock3 className="h-4 w-4 text-accent" />
                          Roughly {totalMinutes} minutes of seed practice already structured into routes.
                        </p>
                      </div>
                    </CardBody>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1280px] px-0 sm:px-2 md:px-6">
          <div className="signal-band course-marquee rounded-[1.6rem] px-4 py-3 sm:px-5">
            <div className="course-marquee-track">
              {[...marqueeTopics, ...marqueeTopics].map((topic, index) => (
                <span
                  key={`${topic}-${index}`}
                  className="rounded-full border border-borderc bg-surface/78 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1280px] px-0 sm:px-2 md:px-6">
          <div className="grid gap-4 lg:grid-cols-[1.06fr_0.94fr]">
            <Card className="story-panel overflow-hidden border-borderc">
              <CardHeader className="space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">One library, three pressures</p>
                <h2 className="max-w-[14ch] text-3xl font-display font-semibold tracking-tight text-text sm:text-4xl">
                  Study mode should change the pressure, not the whole interface.
                </h2>
              </CardHeader>
              <CardBody className="grid gap-4 p-5 sm:p-6 md:grid-cols-3">
                {operatingModes.map((mode) => {
                  const Icon = mode.icon;
                  return (
                    <div key={mode.title} className="rounded-[1.35rem] border border-borderc bg-surface/76 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <Icon className="h-5 w-5 text-accent" />
                        <Badge tone={mode.tone}>{mode.title}</Badge>
                      </div>
                      <p className="mt-4 text-lg font-semibold text-text">{mode.title}</p>
                      <p className="mt-2 text-sm leading-relaxed text-text-secondary">{mode.description}</p>
                    </div>
                  );
                })}
              </CardBody>
            </Card>

            <div className="grid gap-4">
              <Card className="story-panel overflow-hidden border-borderc">
                <CardHeader className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">What the product optimizes for</p>
                  <h2 className="text-2xl font-display font-semibold text-text">Clarity before velocity.</h2>
                </CardHeader>
                <CardBody className="space-y-4 p-5 sm:p-6">
                  {experiencePillars.map((pillar) => {
                    const Icon = pillar.icon;
                    return (
                      <div key={pillar.title} className="flex gap-4 rounded-[1.2rem] border border-borderc bg-surface/74 p-4">
                        <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent-subtle text-accent">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-text">{pillar.title}</p>
                          <p className="mt-2 text-sm leading-relaxed text-text-secondary">{pillar.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </CardBody>
              </Card>

              <Card className="story-panel overflow-hidden border-borderc bg-[linear-gradient(145deg,hsl(var(--brand-1)/0.16),hsl(var(--surface)),hsl(var(--brand-3)/0.14))]">
                <CardBody className="space-y-4 p-5 sm:p-6">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">If you are serious about studying</p>
                  <h3 className="max-w-[15ch] text-2xl font-display font-semibold text-text">
                    Start from the course, not from a random list of tools.
                  </h3>
                  <p className="text-sm leading-relaxed text-text-secondary">
                    That one decision shapes the whole product. It keeps notes, questions, section material, and exam rehearsal aligned to the class you actually need to pass.
                  </p>
                  <Button asChild>
                    <Link href="/courses">
                      Explore the course atlas
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardBody>
              </Card>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1280px] px-0 sm:px-2 md:px-6">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">Course atlas</p>
              <h2 className="mt-2 text-3xl font-display font-semibold tracking-tight text-text sm:text-4xl">
                Each course gets its own visual center of gravity.
              </h2>
            </div>
            <Button asChild variant="ghost">
              <Link href="/courses">View all course hubs</Link>
            </Button>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.04fr_0.96fr]">
            <Card className="story-panel overflow-hidden border-borderc">
              <div className="grid gap-0 lg:grid-cols-[0.98fr_1.02fr]">
                <div className="relative min-h-[320px] overflow-hidden border-b border-borderc lg:min-h-full lg:border-b-0 lg:border-r">
                  <Image
                    src={featuredCourse.artwork}
                    alt={`${featuredCourse.name} course artwork`}
                    width={960}
                    height={720}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/35 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">Featured lane</p>
                    <p className="mt-2 text-3xl font-display font-semibold text-text">{featuredCourse.name}</p>
                    <p className="mt-1 text-sm text-text-secondary">{featuredCourse.code} · {featuredCourse.difficulty}</p>
                  </div>
                </div>
                <CardBody className="space-y-5 p-5 sm:p-6">
                  <div className="flex flex-wrap gap-2">
                    <Badge tone="brand">{featuredCourse.quizCount} quizzes</Badge>
                    <Badge tone="warn">{featuredCourse.examCount} exams</Badge>
                    <Badge tone="success">{featuredCourse.homeworkCount} homework</Badge>
                  </div>
                  <p className="text-sm leading-relaxed text-text-secondary">{featuredCourse.description}</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1.1rem] border border-borderc bg-surface/74 p-4">
                      <p className="text-[10px] uppercase tracking-[0.16em] text-text-secondary">Topics</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {featuredCourse.tags.map((tag) => (
                          <span key={tag} className="rounded-full border border-borderc px-2.5 py-1 text-[11px] text-text-secondary">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-[1.1rem] border border-borderc bg-surface/74 p-4">
                      <p className="text-[10px] uppercase tracking-[0.16em] text-text-secondary">Estimated runway</p>
                      <p className="mt-3 font-mono text-3xl font-bold text-text">{featuredCourse.estimatedMinutes}m</p>
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
                    <div className="relative min-h-[190px] overflow-hidden border-b border-borderc sm:min-h-full sm:border-b-0 sm:border-r">
                      <Image
                        src={course.artwork}
                        alt={`${course.name} course artwork`}
                        width={720}
                        height={560}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/30 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-4">
                        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-text-secondary">{course.code}</p>
                        <p className="mt-1 text-xl font-semibold text-text">{course.name}</p>
                      </div>
                    </div>
                    <CardBody className="space-y-4 p-5">
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
          <div className="grid gap-4 lg:grid-cols-[0.94fr_1.06fr]">
            <Card className="story-panel overflow-hidden border-borderc">
              <CardHeader className="space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">One system, two roles</p>
                <h2 className="max-w-[13ch] text-3xl font-display font-semibold tracking-tight text-text sm:text-4xl">
                  Student flow and professor flow are different, but they live in the same grammar.
                </h2>
              </CardHeader>
              <CardBody className="space-y-4 p-5 sm:p-6">
                {roleTracks.map((track) => {
                  const Icon = track.icon;
                  return (
                    <div key={track.title} className="rounded-[1.35rem] border border-borderc bg-surface/76 p-4">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-subtle text-accent">
                          <Icon className="h-5 w-5" />
                        </span>
                        <p className="text-xl font-semibold text-text">{track.title}</p>
                      </div>
                      <div className="mt-4 grid gap-3">
                        {track.points.map((point) => (
                          <div key={point} className="rounded-[1rem] border border-borderc bg-surface/72 px-3 py-3 text-sm leading-relaxed text-text-secondary">
                            {point}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </CardBody>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="story-panel overflow-hidden border-borderc md:col-span-2">
                <CardBody className="grid gap-4 p-5 sm:p-6 md:grid-cols-[0.78fr_1.22fr]">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">What makes the product memorable</p>
                    <h3 className="mt-2 text-2xl font-display font-semibold text-text">It does not look like a generic LMS.</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-text-secondary">
                    The visual language is meant to feel deliberate: dark glass, authored hierarchy, course artwork, tighter typography, and layouts that point users toward the next action instead of surrounding them with administrative clutter.
                  </p>
                </CardBody>
              </Card>

              <Card className="story-panel overflow-hidden border-borderc">
                <CardBody className="p-5 sm:p-6">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">Hidden power</p>
                  <p className="mt-3 text-xl font-semibold text-text">Hints can appear and disappear instead of trapping the student in reveal-only flows.</p>
                  <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                    That matters for difficult classes. Sometimes the right move is to peek. Sometimes it is to hide the crutch and try the step again.
                  </p>
                </CardBody>
              </Card>

              <Card className="story-panel overflow-hidden border-borderc">
                <CardBody className="p-5 sm:p-6">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">Section-aware routing</p>
                  <p className="mt-3 text-xl font-semibold text-text">Public course hubs and professor-owned section content stay separate by design.</p>
                  <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                    The public library teaches. The section workspace handles the class. They connect cleanly, but they are not the same surface.
                  </p>
                </CardBody>
              </Card>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1280px] px-0 sm:px-2 md:px-6">
          <div className="story-panel signal-grid overflow-hidden rounded-[2.2rem] border border-borderc px-5 py-6 shadow-subtle sm:px-7 md:px-10 md:py-10">
            <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">Ready to step into it</p>
                <h2 className="mt-3 max-w-[13ch] text-4xl font-display font-semibold leading-tight tracking-tight text-text sm:text-5xl">
                  Start with a course hub and let the rest of the system click into place.
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-text-secondary">
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
