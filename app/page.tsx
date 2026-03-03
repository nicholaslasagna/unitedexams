import Link from "next/link";
import { ArrowRight, BookOpenCheck, ChartNoAxesCombined, Orbit, Sparkles } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { courses, quizSets } from "@/data/seed";
import { testimonials } from "@/data/seed/leaderboard";

const features = [
  {
    title: "Quiz Engine Built for Mastery",
    description:
      "Single-answer, multi-select, and open-ended walkthrough reasoning with clean review loops and keyboard support.",
    icon: Orbit
  },
  {
    title: "Topic-Level Progress Intelligence",
    description:
      "Track momentum by course and concept, with streaks and trend visuals that actually guide next steps.",
    icon: ChartNoAxesCombined
  },
  {
    title: "Premium Notes + Cheat Sheets",
    description:
      "Readable markdown, searchable sections, and quick-reference sheets that keep exam prep fast.",
    icon: BookOpenCheck
  }
];

export default function LandingPage() {
  const totalQuestions = quizSets.reduce((sum, set) => sum + set.questions.length, 0);

  return (
    <div className="min-h-screen bg-bg text-text">
      <header className="mx-auto flex w-full max-w-[1240px] items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-soft">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-base font-bold leading-tight">United Exams</p>
            <p className="text-[11px] tracking-[0.16em] text-muted">UNITEDEXAMS.COM</p>
          </div>
        </Link>
        <Link href="/app/dashboard" className="rounded-xl bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-soft">
          Get Started
        </Link>
      </header>

      <section className="mesh-hero mx-auto w-full max-w-[1240px] px-6 pb-16 pt-8">
        <div className="glass grid gap-10 rounded-[2rem] px-8 py-12 md:grid-cols-[1.3fr_0.9fr] md:px-12 md:py-16">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-2/30 bg-brand-2/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand-2">
              Premium College Study Platform
            </p>
            <h1 className="max-w-[14ch] font-display text-5xl font-semibold leading-[1.03] tracking-tight md:text-6xl">
              Study smarter. Test stronger.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
              United Exams combines cinematic polish with rigorous academic workflows: walkthrough quizzes, streak momentum,
              topic mastery analytics, and clean course notes in one focused experience.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/app/dashboard" className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-5 py-3 text-sm font-semibold text-white shadow-soft">
                Open Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/app/courses" className="inline-flex items-center rounded-xl border border-borderc px-5 py-3 text-sm font-semibold text-text hover:bg-soft">
                Explore Course Catalog
              </Link>
            </div>
          </div>
          <Card className="overflow-hidden border-white/20 bg-surface/70">
            <CardBody className="space-y-5">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">Live Highlights</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-borderc bg-soft p-4">
                  <p className="text-xs text-muted">Quiz Sets</p>
                  <p className="mt-1 font-mono text-3xl font-bold">{quizSets.length}</p>
                </div>
                <div className="rounded-xl border border-borderc bg-soft p-4">
                  <p className="text-xs text-muted">Seed Questions</p>
                  <p className="mt-1 font-mono text-3xl font-bold">{totalQuestions}</p>
                </div>
                <div className="rounded-xl border border-borderc bg-soft p-4">
                  <p className="text-xs text-muted">Courses</p>
                  <p className="mt-1 font-mono text-3xl font-bold">{courses.length}</p>
                </div>
                <div className="rounded-xl border border-borderc bg-soft p-4">
                  <p className="text-xs text-muted">Modes</p>
                  <p className="mt-1 font-mono text-3xl font-bold">Study + Timed</p>
                </div>
              </div>
              <p className="rounded-xl border border-borderc bg-soft px-4 py-3 text-sm text-muted">
                Built for students, TAs, and professors who want clarity, speed, and confidence.
              </p>
            </CardBody>
          </Card>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1240px] px-6 pb-14">
        <div className="grid gap-4 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="hover:-translate-y-0.5 hover:shadow-glass">
                <CardBody>
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="font-display text-xl font-semibold">{feature.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{feature.description}</p>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1240px] px-6 pb-14">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-3xl font-semibold">Course previews</h2>
          <Link href="/app/courses" className="text-sm font-semibold text-brand-2">
            View all courses
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {courses.map((course) => (
            <Card key={course.id} className="group hover:-translate-y-1 hover:shadow-glass">
              <CardBody>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{course.code}</p>
                <h3 className="mt-1 font-display text-xl font-semibold">{course.name}</h3>
                <p className="mt-2 text-sm text-muted">{course.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {course.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-borderc px-2 py-1 text-[11px] text-muted">
                      {tag}
                    </span>
                  ))}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1240px] px-6 pb-16">
        <h2 className="mb-4 font-display text-3xl font-semibold">What students say</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((item) => (
            <Card key={item.name}>
              <CardBody>
                <p className="text-sm leading-relaxed text-text">“{item.quote}”</p>
                <p className="mt-4 text-sm font-semibold">{item.name}</p>
                <p className="text-xs text-muted">{item.role}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      <footer className="border-t border-borderc/70 bg-surface/60">
        <div className="mx-auto flex w-full max-w-[1240px] flex-wrap items-center justify-between gap-3 px-6 py-6 text-sm text-muted">
          <p>© {new Date().getFullYear()} United Exams. Academic-premium by design.</p>
          <div className="flex gap-4">
            <Link href="/app/settings">Settings</Link>
            <Link href="/app/courses">Courses</Link>
            <Link href="/app/leaderboard">Leaderboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
