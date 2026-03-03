"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  ArrowRight,
  Clock3,
  Flame,
  Sparkles,
  Target,
  TrendingUp,
  Trophy
} from "lucide-react";
import { courses, quizSets } from "@/data/seed";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ProgressBar, ProgressRing } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkline } from "@/components/charts/sparkline";
import { useAppData } from "@/lib/app-data-context";
import {
  bestScoreForQuiz,
  courseProgress,
  getStreak,
  leaderboardPoints,
  recentAttempts,
  streakSparkline
} from "@/features/progress/metrics";
import { formatRelativeDate } from "@/lib/utils";

export default function DashboardPage() {
  const { ready, attempts } = useAppData();

  const streak = useMemo(() => getStreak(attempts), [attempts]);
  const points = useMemo(() => leaderboardPoints(attempts), [attempts]);
  const spark = useMemo(() => streakSparkline(attempts, 14), [attempts]);

  const continueQuiz = useMemo(() => {
    const latest = [...attempts].sort((a, b) => +new Date(b.date) - +new Date(a.date))[0];
    return latest ? quizSets.find((quiz) => quiz.id === latest.quizId) : quizSets[0];
  }, [attempts]);

  const continueQuizBest = useMemo(() => {
    if (!continueQuiz) return 0;
    return bestScoreForQuiz(attempts, continueQuiz.id);
  }, [attempts, continueQuiz]);

  const continueQuizLast = useMemo(() => {
    if (!continueQuiz) return null;
    const matches = attempts.filter((attempt) => attempt.quizId === continueQuiz.id);
    return matches.sort((a, b) => +new Date(b.date) - +new Date(a.date))[0] ?? null;
  }, [attempts, continueQuiz]);

  const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const studiedToday = useMemo(
    () => attempts.some((attempt) => attempt.date.slice(0, 10) === todayKey),
    [attempts, todayKey]
  );

  const streakGoalPct = Math.min(100, Math.round((streak.current / 7) * 100));

  const focusCourses = useMemo(
    () =>
      [...courses]
        .map((course) => ({ ...course, progress: courseProgress(attempts, course.id) }))
        .sort((a, b) => a.progress - b.progress)
        .slice(0, 3),
    [attempts]
  );

  const recent = useMemo(() => recentAttempts(attempts, 6), [attempts]);

  if (!ready) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-64" />
        <Skeleton className="h-72" />
        <Skeleton className="h-80" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-[1.7fr_1fr]">
        <Card className="mesh-hero overflow-hidden border-white/10">
          <CardBody className="space-y-5 p-7 md:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Continue studying</p>
            <h1 className="max-w-[16ch] font-display text-[40px] leading-[1.08] font-semibold tracking-tight md:text-[44px]">
              Build mastery with one focused sprint.
            </h1>
            <p className="max-w-2xl text-[15px] leading-6 text-muted">
              Clean repetition beats cramming. Use one high-quality quiz attempt to improve topic confidence and keep your streak alive.
            </p>
            {continueQuiz ? (
              <div className="rounded-2xl border border-white/15 bg-[linear-gradient(145deg,hsl(var(--surface)/0.92),hsl(var(--surface)/0.74))] p-4 shadow-elevated">
                <p className="text-[11px] uppercase tracking-[0.15em] text-muted">Next recommendation</p>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xl font-semibold text-text">{continueQuiz.title}</p>
                    <p className="text-sm text-muted">{continueQuiz.description}</p>
                    <p className="mt-1 text-xs text-muted">
                      Last attempt: {continueQuizLast ? formatRelativeDate(continueQuizLast.date) : "No attempts yet"}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-right">
                    <div className="rounded-xl border border-borderc/70 bg-soft/70 px-3 py-2">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-muted">Best</p>
                      <p className="font-mono text-lg font-semibold text-text">{continueQuizBest}%</p>
                    </div>
                    <div className="rounded-xl border border-borderc/70 bg-soft/70 px-3 py-2">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-muted">Est</p>
                      <p className="font-mono text-lg font-semibold text-text">{continueQuiz.estMinutes}m</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button asChild>
                    <Link href={`/app/quiz/${continueQuiz.id}`}>
                      Start quiz
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="secondary" asChild>
                    <Link href={`/app/courses/${continueQuiz.courseId}`}>Open course</Link>
                  </Button>
                </div>
              </div>
            ) : null}
          </CardBody>
        </Card>

        <Card className="border-white/10">
          <CardBody className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted">Study streak</p>
              <span className="rounded-full border border-brand-2/35 bg-brand-2/10 px-2 py-1 text-[11px] font-semibold text-brand-2">
                {points} pts
              </span>
            </div>
            <div className="flex items-center gap-4">
              <ProgressRing value={streakGoalPct} size={102} stroke={10} label="7d target" />
              <div>
                <p className="inline-flex items-center gap-2 text-2xl font-bold text-text">
                  <Flame className="h-6 w-6 text-warn" />
                  {streak.current} days
                </p>
                <p className="text-sm text-muted">Best streak: {streak.best} days</p>
              </div>
            </div>
            <div className="rounded-xl border border-borderc/70 bg-soft/70 p-3">
              <p className="text-xs text-muted">Last 14 days activity</p>
              <div className="mt-2">
                <Sparkline values={spark} />
              </div>
              <div className="mt-3 grid grid-cols-7 gap-1">
                {spark.map((value, idx) => (
                  <span
                    key={`streak-dot-${idx}`}
                    className={`h-2.5 w-2.5 rounded-full border ${
                      value > 0 ? "border-brand-2/45 bg-brand-2/80" : "border-borderc/75 bg-transparent"
                    }`}
                    aria-hidden
                  />
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-borderc/70 bg-soft/70 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-muted">Today&apos;s goal</p>
              <p className="mt-1 text-sm text-text">
                {studiedToday ? "Goal complete. Keep momentum with review mode." : "Finish one 20-minute quiz sprint."}
              </p>
              <Button asChild variant={studiedToday ? "secondary" : "primary"} className="mt-3 w-full">
                <Link href={continueQuiz ? `/app/quiz/${continueQuiz.id}` : "/app/courses"}>
                  {studiedToday ? "Run a quick review" : "Start today's sprint"}
                </Link>
              </Button>
            </div>
          </CardBody>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {courses.map((course) => {
          const progress = courseProgress(attempts, course.id);
          const courseQuizzes = quizSets.filter((quiz) => quiz.courseId === course.id);
          const latest = attempts
            .filter((attempt) => attempt.courseId === course.id)
            .sort((a, b) => +new Date(b.date) - +new Date(a.date))[0];
          const avgBest =
            courseQuizzes.length > 0
              ? Math.round(courseQuizzes.reduce((sum, quiz) => sum + bestScoreForQuiz(attempts, quiz.id), 0) / courseQuizzes.length)
              : 0;

          return (
            <Card key={course.id} className="overflow-hidden border-white/10">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.14em] text-muted">{course.code}</p>
                    <h2 className="mt-1 font-display text-lg font-semibold text-text">{course.name}</h2>
                  </div>
                  <span className="rounded-full border border-borderc/80 bg-soft/70 px-2 py-1 text-[11px] text-muted">
                    {progress}%
                  </span>
                </div>
              </CardHeader>
              <CardBody className="space-y-3">
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs text-muted">
                    <span>Course mastery</span>
                    <span className="font-mono">{progress}%</span>
                  </div>
                    <ProgressBar value={progress} />
                  </div>
                <div className="flex items-center justify-between rounded-xl border border-borderc/70 bg-soft/65 px-3 py-2 text-sm">
                  <span className="text-muted">Last score</span>
                  <span className="font-mono font-semibold text-text">{latest ? `${latest.score}%` : "—"}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-borderc/70 bg-soft/65 px-3 py-2 text-sm">
                  <span className="text-muted">Average best</span>
                  <span className="font-mono font-semibold text-text">{avgBest}%</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {course.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="rounded-full border border-borderc/75 bg-soft/75 px-2 py-1 text-[11px] text-muted">
                      {tag}
                    </span>
                  ))}
                </div>
                <Button variant="ghost" asChild className="w-full justify-between">
                  <Link href={`/app/courses/${course.id}`}>
                    Open course
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardBody>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.55fr_1fr]">
        <Card className="border-white/10">
          <CardHeader>
            <h2 className="font-display text-xl font-semibold">Recent attempts</h2>
          </CardHeader>
          <CardBody>
            {recent.length === 0 ? (
              <div className="rounded-xl border border-dashed border-borderc/75 bg-soft/70 p-6 text-center">
                <p className="font-semibold text-text">Start your first quiz to build momentum.</p>
                <p className="mt-1 text-sm text-muted">Your latest attempts and topic signals will appear here.</p>
                <Button className="mt-4" asChild>
                  <Link href="/app/courses">Explore courses</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {recent.map((attempt) => (
                  <div
                    key={attempt.id}
                    className="flex items-center justify-between rounded-xl border border-borderc/70 bg-soft/65 px-3 py-2.5"
                  >
                    <div>
                      <p className="text-sm font-semibold text-text">{attempt.quizTitle}</p>
                      <p className="text-xs text-muted">{formatRelativeDate(attempt.date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-lg font-semibold text-text">{attempt.score}%</p>
                      <p className="inline-flex items-center gap-1 text-xs text-muted">
                        <Clock3 className="h-3 w-3" />
                        {Math.round(attempt.timeSpent / 60)} min
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card className="border-white/10">
          <CardHeader>
            <h2 className="inline-flex items-center gap-2 font-display text-xl font-semibold">
              <TrendingUp className="h-5 w-5 text-brand-2" />
              Focus lane
            </h2>
          </CardHeader>
          <CardBody className="space-y-3">
            <p className="text-sm text-muted">
              Choose one course below for a 20-minute high-focus sprint. Keep quality high and streak pressure low.
            </p>
            <div className="grid gap-2">
              <div className="flex items-center justify-between rounded-xl border border-borderc/70 bg-soft/65 px-3 py-2">
                <span className="inline-flex items-center gap-2 text-sm text-text">
                  <Trophy className="h-4 w-4 text-brand-2" />
                  Personal best (recommended quiz)
                </span>
                <span className="font-mono text-sm text-text">{continueQuizBest}%</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-borderc/70 bg-soft/65 px-3 py-2">
                <span className="inline-flex items-center gap-2 text-sm text-text">
                  <Sparkles className="h-4 w-4 text-brand-2" />
                  Today&apos;s momentum
                </span>
                <span className="text-sm text-muted">{studiedToday ? "Active" : "Not started"}</span>
              </div>
            </div>
            {focusCourses.map((course) => (
              <Link
                key={course.id}
                href={`/app/courses/${course.id}`}
                className="flex items-center justify-between rounded-xl border border-borderc/75 bg-soft/65 px-3 py-2 text-sm hover:border-brand-2/45"
              >
                <span className="inline-flex items-center gap-2">
                  <Target className="h-4 w-4 text-warn" />
                  {course.name}
                </span>
                <ArrowRight className="h-4 w-4 text-muted" />
              </Link>
            ))}
          </CardBody>
        </Card>
      </section>
    </div>
  );
}
