"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Clock3,
  Flame,
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
  recentAttempts
} from "@/features/progress/metrics";
import { formatRelativeDate } from "@/lib/utils";
import { fetchUserCourses } from "@/features/account/api";
import { getRecommendations } from "@/features/recommendations/api";
import { RecommendationsPanel } from "@/features/recommendations/components/recommendations-panel";
import type { RecommendationItem } from "@/features/recommendations/scoring";

interface HomeworkDraftRow {
  id: string;
  quiz_set_id: string;
  created_at: string;
  settings: Record<string, unknown> | null;
}

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
  const { ready, attempts, supabase, user } = useAppData();

  const [userCourseIds, setUserCourseIds] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [homeworkDraft, setHomeworkDraft] = useState<HomeworkDraftRow | null>(null);

  const streak = useMemo(() => getStreak(attempts), [attempts]);
  const points = useMemo(() => leaderboardPoints(attempts), [attempts]);
  const heatmap = useMemo(() => buildHeatmap(attempts), [attempts]);

  const recentCompletedQuizzes = useMemo(() => {
    const sorted = [...attempts].sort((a, b) => +new Date(b.date) - +new Date(a.date));
    const seen = new Set<string>();
    const result: typeof quizSets = [];

    for (const attempt of sorted) {
      if (seen.has(attempt.quizId)) continue;
      const found = quizSets.find((quiz) => quiz.id === attempt.quizId);
      if (found) {
        seen.add(found.id);
        result.push(found);
      }
      if (result.length >= 3) break;
    }

    if (result.length === 0 && quizSets[0]) result.push(quizSets[0]);
    return result;
  }, [attempts]);

  const continueQuiz = recentCompletedQuizzes[0];

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

  const onboardingIncomplete = Boolean(user) && userCourseIds.length === 0;
  const homeworkDraftSet = useMemo(() => {
    if (!homeworkDraft) return null;
    return quizSets.find((set) => set.id === homeworkDraft.quiz_set_id) ?? null;
  }, [homeworkDraft]);

  useEffect(() => {
    if (!supabase || !user) {
      setUserCourseIds([]);
      return;
    }

    fetchUserCourses(supabase, user.id)
      .then((ids) => setUserCourseIds(ids))
      .catch(() => setUserCourseIds([]));
  }, [supabase, user]);

  useEffect(() => {
    if (!supabase || !user) {
      setHomeworkDraft(null);
      return;
    }

    const run = async () => {
      try {
        const { data } = await supabase
          .from("attempts")
          .select("id, quiz_set_id, created_at, settings")
          .eq("user_id", user.id)
          .is("completed_at", null)
          .eq("settings->>mode", "homework")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        setHomeworkDraft((data as HomeworkDraftRow | null) ?? null);
      } catch {
        setHomeworkDraft(null);
      }
    };

    run();
  }, [supabase, user]);

  useEffect(() => {
    if (!ready) return;
    if (!user || userCourseIds.length === 0) {
      setRecommendations([]);
      return;
    }

    setRecommendationsLoading(true);
    getRecommendations(supabase, {
      limit: 6,
      attempts,
      userCourseIds
    })
      .then((items) => setRecommendations(items))
      .catch(() => setRecommendations([]))
      .finally(() => setRecommendationsLoading(false));
  }, [ready, attempts, userCourseIds, supabase, user]);

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
    <div className="animate-fade-rise space-y-6 md:space-y-10">
      <section className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <Card className="mesh-hero overflow-hidden">
          <CardBody className="space-y-5 p-5 sm:p-6 md:p-8">
            <div className="inline-flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-[0.28em] text-accent uppercase sm:text-[11px] sm:tracking-[5px]">
                Continue studying
              </span>
            </div>
            <h1 className="max-w-[14ch] text-4xl font-display font-extrabold leading-[0.98] tracking-tight text-accent-fg sm:max-w-[18ch] sm:text-display-lg">
              Build mastery with one focused sprint.
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-muted text-text-secondary sm:text-[15px]">
              Pick up where you left off. One quality attempt keeps momentum alive.
            </p>

            {continueQuiz ? (
              <div className="rounded-[18px] border border-borderc bg-soft/90 p-4 backdrop-blur-sm sm:p-5">
                <p className="text-[10px] font-bold tracking-[1.5px] text-faint uppercase">Continue with</p>
                <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <p className="text-lg font-bold text-accent-fg sm:text-xl">{continueQuiz.title}</p>
                    <p className="mt-1 text-sm text-muted text-text-secondary">{continueQuiz.description}</p>
                    <p className="mt-1 text-xs text-faint">
                      Last attempt: {continueQuizLast ? formatRelativeDate(continueQuizLast.date) : "No attempts yet"}
                    </p>
                  </div>
                  <div className="grid w-full grid-cols-2 gap-3 text-right md:w-auto">
                    <div className="rounded-[10px] border border-borderc bg-soft px-4 py-3">
                      <p className="text-[10px] font-bold tracking-[1.5px] text-faint uppercase">Best</p>
                      <p className="font-mono text-2xl font-bold text-accent">{continueQuizBest}%</p>
                    </div>
                    <div className="rounded-[10px] border border-borderc bg-soft px-4 py-3">
                      <p className="text-[10px] font-bold tracking-[1.5px] text-faint uppercase">Est</p>
                      <p className="font-mono text-2xl font-bold text-text">{continueQuiz.estMinutes}m</p>
                    </div>
                  </div>
                </div>

                {recentCompletedQuizzes.length > 1 ? (
                  <div className="mt-4 grid gap-2">
                    <p className="text-[10px] font-bold tracking-[1.5px] text-faint uppercase">Also continue</p>
                    {recentCompletedQuizzes.slice(1).map((set) => (
                      <Link
                        key={set.id}
                        href={`/quiz/${set.id}`}
                        className="rounded-lg border border-borderc bg-soft px-3 py-2 text-sm text-text transition-all duration-200 ease-out-expo hover:shadow-card-hover hover:border-border-accent"
                      >
                        {set.title}
                      </Link>
                    ))}
                  </div>
                ) : null}

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <Button asChild className="w-full px-7 sm:w-auto">
                    <Link href={`/quiz/${continueQuiz.id}`}>
                      Start quiz
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="secondary" asChild className="w-full sm:w-auto">
                    <Link href={`/app/courses/${continueQuiz.courseId}`}>View course</Link>
                  </Button>
                </div>
              </div>
            ) : null}

            {homeworkDraftSet ? (
              <div className="rounded-[18px] border border-success/30 bg-success/10 p-4">
                <p className="text-[10px] font-bold tracking-[1.5px] text-success uppercase">Resume homework</p>
                <p className="mt-2 text-sm font-semibold text-text">{homeworkDraftSet.title}</p>
                <p className="mt-1 text-xs text-muted text-text-secondary">
                  Draft started {formatRelativeDate(homeworkDraft?.created_at ?? new Date().toISOString())}
                </p>
                <Button asChild className="mt-3 w-full sm:w-auto">
                  <Link href={`/app/homework/${homeworkDraftSet.id}`}>
                    Resume now
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ) : null}
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-5 p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-[0.28em] text-accent uppercase sm:text-[11px] sm:tracking-[5px]">
                Study streak
              </span>
              <span className="rounded-full bg-accent-subtle px-3 py-1 text-[11px] font-mono font-bold text-accent">
                {points} pts
              </span>
            </div>

            <div className="flex items-center gap-4">
              <ProgressRing value={streakGoalPct} size={92} stroke={9} label="7d goal" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-warn" />
                  <span className="font-mono text-4xl font-bold text-text">{streak.current}</span>
                  <span className="text-sm text-muted">days</span>
                </div>
                <p className="mt-1 text-sm text-faint">Best streak: <span className="font-mono">{streak.best}</span> days</p>
              </div>
            </div>

            <div className="rounded-[14px] border border-borderc bg-soft p-4">
              <p className="text-[10px] font-bold tracking-[1.5px] text-faint uppercase">Last 28 days</p>
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
                            : "bg-overlay"
                    }`}
                    aria-hidden
                  />
                ))}
              </div>
            </div>

            <div className="rounded-[14px] border border-borderc bg-soft p-4">
              <p className="text-[10px] font-bold tracking-[1.5px] text-faint uppercase">Today&apos;s goal</p>
              <p className="mt-2 text-[14px] font-medium text-text">
                {studiedToday ? "Goal complete. Keep momentum with review mode." : "Finish one 20-minute quiz sprint."}
              </p>
              <Button asChild variant={studiedToday ? "secondary" : "primary"} className="mt-4 w-full">
                <Link href={continueQuiz ? `/quiz/${continueQuiz.id}` : "/app/courses"}>
                  {studiedToday ? "Run a quick review" : "Start today's sprint"}
                </Link>
              </Button>
            </div>
          </CardBody>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {courses.map((course, i) => {
          const progress = courseProgress(attempts, course.id);
          const courseQuizzes = quizSets.filter((quiz) => quiz.courseId === course.id);
          const latest = attempts
            .filter((attempt) => attempt.courseId === course.id)
            .sort((a, b) => +new Date(b.date) - +new Date(a.date))[0];
          const avgBest =
            courseQuizzes.length > 0
              ? Math.round(courseQuizzes.reduce((sum, quiz) => sum + bestScoreForQuiz(attempts, quiz.id), 0) / courseQuizzes.length)
              : 0;
          const stagger = `stagger-${i + 1}` as const;

          return (
            <Link
              key={course.id}
              href={`/app/courses/${course.id}`}
              className={`group animate-fade-rise ${stagger} rounded-[20px] border border-borderc bg-soft shadow-subtle backdrop-blur-xl transition-all duration-200 ease-out-expo hover:shadow-card-hover hover:border-border-accent hover:bg-overlay`}
            >
              <div className="space-y-4 p-5 sm:p-6">
                <div>
                  <span className="text-[10px] font-bold tracking-[1.5px] text-accent uppercase">{course.code}</span>
                  <h2 className="mt-1 font-display text-[16px] font-bold text-text">{course.name}</h2>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="text-faint">Mastery</span>
                    <span className="font-mono font-bold text-accent">{progress}%</span>
                  </div>
                  <ProgressBar value={progress} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-faint">Last score</span>
                    <span className="font-mono font-bold text-text">{latest ? `${latest.score}%` : "—"}</span>
                  </div>
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-faint">Avg best</span>
                    <span className="font-mono font-bold text-text">{avgBest}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[13px] font-semibold text-faint transition-all duration-200 ease-out-expo group-hover:text-muted">
                  <span>Open course</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-out-expo group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-display font-bold text-text sm:text-display-md">Recent attempts</h2>
          </CardHeader>
          <CardBody>
            {recent.length === 0 ? (
              <div className="rounded-[14px] border border-borderc bg-soft p-8 text-center">
                <p className="text-[16px] font-bold text-text">Start your first quiz to build momentum.</p>
                <p className="mt-2 text-[14px] text-muted text-text-secondary">Your latest attempts and topic signals will appear here.</p>
                <Button className="mt-5" asChild>
                  <Link href="/app/courses">Explore courses</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {recent.map((attempt, i) => (
                  <div
                    key={attempt.id}
                    className={`flex flex-col gap-2 rounded-[14px] border border-borderc bg-soft px-4 py-3 animate-fade-rise sm:flex-row sm:items-center sm:justify-between stagger-${i + 1}`}
                  >
                    <div>
                      <p className="text-[14px] font-semibold text-text">{attempt.quizTitle}</p>
                      <p className="text-xs text-faint">{formatRelativeDate(attempt.date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-xl font-bold text-text">{attempt.score}%</p>
                      <p className="inline-flex items-center gap-1 text-xs font-mono text-faint">
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

        <div className="space-y-5">
          <RecommendationsPanel items={recommendations} blockedByOnboarding={onboardingIncomplete} />

          <Card>
            <CardHeader>
              <h2 className="inline-flex items-center gap-2 text-2xl font-display font-bold text-text sm:text-display-md">
                <TrendingUp className="h-5 w-5 text-accent" />
                Focus lane
              </h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="grid gap-2">
                <div className="flex items-center justify-between rounded-[10px] border border-borderc bg-soft px-4 py-3">
                  <span className="inline-flex items-center gap-2 text-[14px] text-text">
                    <Trophy className="h-4 w-4 text-accent" />
                    Personal best
                  </span>
                  <span className="font-mono text-sm font-bold text-accent">{continueQuizBest}%</span>
                </div>
                <div className="flex items-center justify-between rounded-[10px] border border-borderc bg-soft px-4 py-3">
                  <span className="inline-flex items-center gap-2 text-[14px] text-text">
                    <Target className="h-4 w-4 text-brand-2" />
                    Recommendation status
                  </span>
                  <span className="text-[13px] font-semibold text-muted">
                    {recommendationsLoading ? "Loading" : onboardingIncomplete ? "Needs onboarding" : "Ready"}
                  </span>
                </div>
              </div>
              {focusCourses.map((course, i) => (
                <Link
                  key={course.id}
                  href={`/app/courses/${course.id}`}
                  className={`flex items-center justify-between rounded-[10px] border border-borderc bg-soft px-4 py-3 text-[14px] transition-all duration-200 ease-out-expo hover:shadow-card-hover hover:border-border-accent animate-fade-rise stagger-${i + 1}`}
                >
                  <span className="inline-flex items-center gap-2">
                    <Target className="h-4 w-4 text-warn" />
                    {course.name}
                  </span>
                  <ArrowRight className="h-4 w-4 text-faint" />
                </Link>
              ))}
            </CardBody>
          </Card>
        </div>
      </section>
    </div>
  );
}
