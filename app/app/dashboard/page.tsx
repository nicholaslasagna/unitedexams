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

/* ── 28-day heatmap helper ── */
function buildHeatmap(attempts: { date: string }[]) {
  const today = new Date();
  const cells: { key: string; date: string; count: number; label: string }[] = [];
  for (let i = 27; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const count = attempts.filter((a) => a.date.slice(0, 10) === iso).length;
    const dayLabel = d.toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" });
    cells.push({ key: iso, date: iso, count, label: dayLabel });
  }
  return cells;
}

export default function DashboardPage() {
  const { ready, attempts } = useAppData();

  const streak = useMemo(() => getStreak(attempts), [attempts]);
  const points = useMemo(() => leaderboardPoints(attempts), [attempts]);
  const heatmap = useMemo(() => buildHeatmap(attempts), [attempts]);

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
    <div className="animate-rise space-y-8">
      {/* ── HERO ROW ── */}
      <section className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
        {/* Continue studying */}
        <Card className="mesh-hero overflow-hidden">
          <CardBody className="space-y-5 p-7 md:p-8">
            <div className="inline-flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-[5px] text-accent uppercase">Continue studying</span>
            </div>
            <h1 className="max-w-[22ch] font-display text-[30px] leading-[1.12] font-extrabold tracking-tight text-white md:text-[36px]">
              Build mastery with one focused sprint.
            </h1>
            <p className="max-w-xl text-[15px] leading-relaxed text-white/[0.55]">
              Pick up where you left off. One quality attempt keeps momentum alive.
            </p>
            {continueQuiz ? (
              <div className="rounded-[14px] border border-white/[0.07] bg-white/[0.025] p-5 backdrop-blur-sm">
                <p className="text-[10px] font-bold tracking-[1.5px] text-white/[0.3] uppercase">Next recommendation</p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xl font-bold text-white">{continueQuiz.title}</p>
                    <p className="mt-1 text-[14px] text-white/[0.55]">{continueQuiz.description}</p>
                    <p className="mt-1 text-xs text-white/[0.3]">
                      Last attempt: {continueQuizLast ? formatRelativeDate(continueQuizLast.date) : "No attempts yet"}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-right">
                    <div className="rounded-[10px] bg-white/[0.025] border border-white/[0.07] px-4 py-3">
                      <p className="text-[10px] font-bold tracking-[1.5px] text-white/[0.3] uppercase">Best</p>
                      <p className="font-mono text-2xl font-bold text-accent">{continueQuizBest}%</p>
                    </div>
                    <div className="rounded-[10px] bg-white/[0.025] border border-white/[0.07] px-4 py-3">
                      <p className="text-[10px] font-bold tracking-[1.5px] text-white/[0.3] uppercase">Est</p>
                      <p className="font-mono text-2xl font-bold text-text">{continueQuiz.estMinutes}m</p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Button asChild className="px-7">
                    <Link href={`/app/quiz/${continueQuiz.id}`}>
                      Start quiz
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="secondary" asChild>
                    <Link href={`/app/courses/${continueQuiz.courseId}`}>View course</Link>
                  </Button>
                </div>
              </div>
            ) : null}
          </CardBody>
        </Card>

        {/* Study streak */}
        <Card>
          <CardBody className="space-y-5 p-6">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-[5px] text-accent uppercase">Study streak</span>
              <span className="rounded-full bg-accent/[0.15] px-3 py-1 text-[11px] font-bold text-accent">
                {points} pts
              </span>
            </div>

            <div className="flex items-center gap-5">
              <ProgressRing value={streakGoalPct} size={92} stroke={9} label="7d goal" />
              <div>
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-warn" />
                  <span className="font-mono text-4xl font-bold text-white">{streak.current}</span>
                  <span className="text-sm text-white/[0.55]">days</span>
                </div>
                <p className="mt-1 text-sm text-white/[0.3]">Best streak: {streak.best} days</p>
              </div>
            </div>

            {/* 28-day heatmap calendar */}
            <div className="rounded-[14px] border border-white/[0.07] bg-white/[0.025] p-4">
              <p className="text-[10px] font-bold tracking-[1.5px] text-white/[0.3] uppercase">Last 28 days</p>
              <div className="mt-3 grid grid-cols-7 gap-[6px]">
                {heatmap.map((cell) => (
                  <span
                    key={cell.key}
                    title={`${cell.label}: ${cell.count} ${cell.count === 1 ? "session" : "sessions"}`}
                    className={`h-[14px] w-[14px] rounded-[3px] transition-colors ${
                      cell.count >= 3
                        ? "bg-accent/90"
                        : cell.count === 2
                          ? "bg-accent/60"
                          : cell.count === 1
                            ? "bg-accent/30"
                            : "bg-white/[0.06]"
                    }`}
                    aria-hidden
                  />
                ))}
              </div>
              <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-white/[0.3]">
                <span>Less</span>
                <span className="h-[10px] w-[10px] rounded-[2px] bg-white/[0.06]" />
                <span className="h-[10px] w-[10px] rounded-[2px] bg-accent/30" />
                <span className="h-[10px] w-[10px] rounded-[2px] bg-accent/60" />
                <span className="h-[10px] w-[10px] rounded-[2px] bg-accent/90" />
                <span>More</span>
              </div>
            </div>

            {/* Today's goal */}
            <div className="rounded-[14px] border border-white/[0.07] bg-white/[0.025] p-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold tracking-[1.5px] text-white/[0.3] uppercase">Today&apos;s goal</p>
                {studiedToday ? (
                  <span className="rounded-full bg-success/[0.12] px-2 py-0.5 text-[10px] font-bold text-success">Complete</span>
                ) : null}
              </div>
              <p className="mt-2 text-[14px] font-medium text-text">
                {studiedToday ? "Goal complete. Keep momentum with review mode." : "Finish one 20-minute quiz sprint."}
              </p>
              {studiedToday ? (
                <div className="mt-3 h-[4px] w-full overflow-hidden rounded-full bg-white/[0.06]">
                  <div className="h-full w-full rounded-full bg-success/70" />
                </div>
              ) : (
                <div className="mt-3 h-[4px] w-full overflow-hidden rounded-full bg-white/[0.06]">
                  <div className="h-full w-0 rounded-full bg-accent-gradient" />
                </div>
              )}
              <Button asChild variant={studiedToday ? "secondary" : "primary"} className="mt-4 w-full">
                <Link href={continueQuiz ? `/app/quiz/${continueQuiz.id}` : "/app/courses"}>
                  {studiedToday ? "Run a quick review" : "Start today's sprint"}
                </Link>
              </Button>
            </div>
          </CardBody>
        </Card>
      </section>

      {/* ── COURSE CARDS ── */}
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
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
            <Link
              key={course.id}
              href={`/app/courses/${course.id}`}
              className="group rounded-[20px] border border-white/[0.07] bg-white/[0.035] backdrop-blur-xl shadow-subtle transition duration-200 hover:bg-white/[0.065] hover:shadow-soft hover:border-white/[0.12] hover:-translate-y-[2px]"
            >
              <div className="p-5 space-y-4">
                <div>
                  <span className="text-[10px] font-bold tracking-[1.5px] text-accent uppercase">{course.code}</span>
                  <h2 className="mt-1 font-display text-[16px] font-bold text-white">{course.name}</h2>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="text-white/[0.3]">Mastery</span>
                    <span className="font-mono font-bold text-accent">{progress}%</span>
                  </div>
                  <ProgressBar value={progress} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-white/[0.3]">Last score</span>
                    <span className="font-mono font-bold text-text">{latest ? `${latest.score}%` : "—"}</span>
                  </div>
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-white/[0.3]">Avg best</span>
                    <span className="font-mono font-bold text-text">{avgBest}%</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {course.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="rounded-full bg-accent/[0.1] px-2.5 py-0.5 text-[10px] font-semibold text-accent">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[13px] font-semibold text-white/[0.3] group-hover:text-white/[0.55] transition-colors">
                  <span>Open course</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          );
        })}
      </section>

      {/* ── BOTTOM ROW ── */}
      <section className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        {/* Recent attempts */}
        <Card>
          <CardHeader>
            <h2 className="font-display text-lg font-bold text-white">Recent attempts</h2>
          </CardHeader>
          <CardBody>
            {recent.length === 0 ? (
              <div className="rounded-[14px] border border-white/[0.07] bg-white/[0.025] p-8 text-center">
                <p className="text-[16px] font-bold text-white">Start your first quiz to build momentum.</p>
                <p className="mt-2 text-[14px] text-white/[0.55]">Your latest attempts and topic signals will appear here.</p>
                <Button className="mt-5" asChild>
                  <Link href="/app/courses">Explore courses</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {recent.map((attempt) => (
                  <div
                    key={attempt.id}
                    className="flex items-center justify-between rounded-[10px] border border-white/[0.07] bg-white/[0.025] px-4 py-3"
                  >
                    <div>
                      <p className="text-[14px] font-semibold text-text">{attempt.quizTitle}</p>
                      <p className="text-xs text-white/[0.3]">{formatRelativeDate(attempt.date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-xl font-bold text-text">{attempt.score}%</p>
                      <p className="inline-flex items-center gap-1 text-xs text-white/[0.3]">
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

        {/* Focus lane */}
        <Card>
          <CardHeader>
            <h2 className="inline-flex items-center gap-2 font-display text-lg font-bold text-white">
              <TrendingUp className="h-5 w-5 text-accent" />
              Focus lane
            </h2>
          </CardHeader>
          <CardBody className="space-y-3">
            <p className="text-[14px] text-white/[0.55]">
              Choose one course below for a 20-minute high-focus sprint.
            </p>
            <div className="grid gap-2">
              <div className="flex items-center justify-between rounded-[10px] border border-white/[0.07] bg-white/[0.025] px-4 py-3">
                <span className="inline-flex items-center gap-2 text-[14px] text-text">
                  <Trophy className="h-4 w-4 text-accent" />
                  Personal best
                </span>
                <span className="font-mono text-sm font-bold text-accent">{continueQuizBest}%</span>
              </div>
              <div className="flex items-center justify-between rounded-[10px] border border-white/[0.07] bg-white/[0.025] px-4 py-3">
                <span className="inline-flex items-center gap-2 text-[14px] text-text">
                  <Sparkles className="h-4 w-4 text-brand-2" />
                  Today&apos;s momentum
                </span>
                <span className={`text-[13px] font-semibold ${studiedToday ? "text-success" : "text-white/[0.3]"}`}>
                  {studiedToday ? "Active" : "Not started"}
                </span>
              </div>
            </div>
            {focusCourses.map((course) => (
              <Link
                key={course.id}
                href={`/app/courses/${course.id}`}
                className="flex items-center justify-between rounded-[10px] border border-white/[0.07] bg-white/[0.025] px-4 py-3 text-[14px] transition-all hover:bg-white/[0.05] hover:border-white/[0.12]"
              >
                <span className="inline-flex items-center gap-2">
                  <Target className="h-4 w-4 text-warn" />
                  {course.name}
                </span>
                <ArrowRight className="h-4 w-4 text-white/[0.3]" />
              </Link>
            ))}
          </CardBody>
        </Card>
      </section>
    </div>
  );
}
