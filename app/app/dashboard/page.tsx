"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, Flame, TrendingUp } from "lucide-react";
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

  const recent = useMemo(() => recentAttempts(attempts, 6), [attempts]);

  if (!ready) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40" />
        <Skeleton className="h-32" />
        <Skeleton className="h-72" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
        <Card className="mesh-hero overflow-hidden">
          <CardBody className="space-y-5 p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">Continue studying</p>
            <h1 className="max-w-[18ch] font-display text-4xl font-semibold tracking-tight md:text-5xl">
              Build momentum one focused session at a time.
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted">
              Keep your streak active today with one high-quality quiz attempt. United Exams saves your progress by topic so every
              session compounds.
            </p>
            {continueQuiz ? (
              <div className="rounded-xl border border-borderc bg-surface/85 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-muted">Next recommendation</p>
                <p className="mt-1 text-lg font-semibold text-text">{continueQuiz.title}</p>
                <p className="text-sm text-muted">{continueQuiz.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
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

        <Card>
          <CardBody className="space-y-5 p-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Study Streak</p>
              <span className="rounded-full border border-brand-2/35 bg-brand-2/10 px-2 py-1 text-xs font-semibold text-brand-2">
                {points} pts
              </span>
            </div>
            <div className="flex items-center gap-4">
              <ProgressRing value={Math.min(100, streak.current * 12)} size={108} stroke={10} label="Current" />
              <div>
                <p className="inline-flex items-center gap-2 text-2xl font-bold text-text">
                  <Flame className="h-6 w-6 text-warn" />
                  {streak.current} days
                </p>
                <p className="text-sm text-muted">Best streak: {streak.best} days</p>
              </div>
            </div>
            <div className="rounded-xl border border-borderc bg-soft p-3">
              <p className="text-xs text-muted">Last 14 days activity</p>
              <div className="mt-2">
                <Sparkline values={spark} />
              </div>
            </div>
          </CardBody>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {courses.map((course) => {
          const progress = courseProgress(attempts, course.id);
          const courseQuizzes = quizSets.filter((quiz) => quiz.courseId === course.id);
          const avgBest =
            courseQuizzes.length > 0
              ? Math.round(courseQuizzes.reduce((sum, quiz) => sum + bestScoreForQuiz(attempts, quiz.id), 0) / courseQuizzes.length)
              : 0;

          return (
            <Card key={course.id} className="overflow-hidden">
              <CardHeader>
                <p className="text-xs uppercase tracking-[0.14em] text-muted">{course.code}</p>
                <h2 className="mt-1 font-display text-xl font-semibold text-text">{course.name}</h2>
              </CardHeader>
              <CardBody className="space-y-3">
                <p className="text-sm text-muted">{course.description}</p>
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs text-muted">
                    <span>Course mastery</span>
                    <span className="font-mono">{progress}%</span>
                  </div>
                  <ProgressBar value={progress} />
                </div>
                <div className="flex items-center justify-between rounded-xl border border-borderc bg-soft px-3 py-2 text-sm">
                  <span className="text-muted">Average best score</span>
                  <span className="font-mono font-semibold text-text">{avgBest}%</span>
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

      <section className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardHeader>
            <h2 className="font-display text-xl font-semibold">Recent attempts</h2>
          </CardHeader>
          <CardBody>
            {recent.length === 0 ? (
              <div className="rounded-xl border border-dashed border-borderc bg-soft p-6 text-center">
                <p className="font-semibold text-text">Start your first quiz to build momentum.</p>
                <p className="mt-1 text-sm text-muted">Your latest attempts and topic signals will appear here.</p>
                <Button className="mt-4" asChild>
                  <Link href="/app/courses">Explore courses</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {recent.map((attempt) => (
                  <div key={attempt.id} className="flex items-center justify-between rounded-xl border border-borderc bg-soft px-3 py-2">
                    <div>
                      <p className="text-sm font-semibold text-text">{attempt.quizTitle}</p>
                      <p className="text-xs text-muted">{formatRelativeDate(attempt.date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-lg font-semibold text-text">{attempt.score}%</p>
                      <p className="text-xs text-muted">{Math.round(attempt.timeSpent / 60)} min</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
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
            {courses.slice(0, 3).map((course) => (
              <Link
                key={course.id}
                href={`/app/courses/${course.id}`}
                className="flex items-center justify-between rounded-xl border border-borderc bg-soft px-3 py-2 text-sm hover:border-brand-2/45"
              >
                <span>{course.name}</span>
                <ArrowRight className="h-4 w-4 text-muted" />
              </Link>
            ))}
          </CardBody>
        </Card>
      </section>
    </div>
  );
}
