"use client";

import Image from "next/image";
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
import { courses, quizSets, getCourse } from "@/data/seed";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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
import { getCourseVisual } from "@/features/study/course-branding";

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
  const continueCourse = continueQuiz ? getCourse(continueQuiz.courseId) : null;
  const continueVisual = getCourseVisual(continueQuiz?.courseId ?? "");

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
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
      </div>
    );
  }

  return (
    <div className="animate-fade-rise space-y-6 md:space-y-8">
      <section className="mesh-hero overflow-hidden rounded-[2rem] border border-borderc/80 bg-surface/65 shadow-[0_24px_80px_hsl(var(--bg)/0.4)] backdrop-blur-xl">
        <div className="grid gap-6 p-5 sm:p-6 xl:grid-cols-[1.12fr_0.88fr] xl:p-8">
          <div className="space-y-6">
            <span className="inline-flex rounded-full border border-brand-2/35 bg-brand-2/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-2">
              Study command center
            </span>
            <div className="space-y-3">
              <h1 className="max-w-[12ch] text-4xl font-display font-semibold leading-[0.96] tracking-tight text-text sm:text-5xl">
                Build mastery with one well-chosen next move.
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-text-secondary sm:text-base">
                Resume the right quiz, keep the streak alive, and move through courses with a cleaner view of what matters now.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.25rem] border border-borderc bg-surface/70 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-secondary">Points</p>
                <p className="mt-2 font-mono text-3xl font-bold text-text">{points}</p>
                <p className="mt-1 text-xs text-text-secondary">Study momentum across completed attempts.</p>
              </div>
              <div className="rounded-[1.25rem] border border-borderc bg-surface/70 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-secondary">Current streak</p>
                <p className="mt-2 font-mono text-3xl font-bold text-text">{streak.current}d</p>
                <p className="mt-1 text-xs text-text-secondary">Best: {streak.best} days.</p>
              </div>
              <div className="rounded-[1.25rem] border border-borderc bg-surface/70 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-secondary">Recommended</p>
                <p className="mt-2 font-mono text-3xl font-bold text-text">{recommendations.length}</p>
                <p className="mt-1 text-xs text-text-secondary">Fresh next steps based on your recent work.</p>
              </div>
            </div>

            {continueQuiz ? (
              <div className={`relative overflow-hidden rounded-[1.6rem] border border-borderc bg-surface/78 p-5 ${continueVisual.glowClass}`}>
                <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${continueVisual.surfaceClass}`} />
                <div className="relative grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      {continueCourse ? <Badge tone="brand">{continueCourse.code}</Badge> : null}
                      <Badge>{continueQuiz.difficulty}</Badge>
                      <Badge tone="success">Best {continueQuizBest}%</Badge>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-faint">Continue with</p>
                      <h2 className="mt-2 text-2xl font-display font-semibold text-text">{continueQuiz.title}</h2>
                      <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-secondary">{continueQuiz.description}</p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[1rem] border border-borderc bg-surface/70 px-4 py-3">
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-faint">Last attempt</p>
                        <p className="mt-2 text-sm font-semibold text-text">{continueQuizLast ? formatRelativeDate(continueQuizLast.date) : "No attempts yet"}</p>
                      </div>
                      <div className="rounded-[1rem] border border-borderc bg-surface/70 px-4 py-3">
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-faint">Estimated sprint</p>
                        <p className="mt-2 text-sm font-semibold text-text">{continueQuiz.estMinutes} minutes</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                      <Button asChild>
                        <Link href={`/quiz/${continueQuiz.id}`}>
                          Start quiz
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="secondary" asChild>
                        <Link href={`/app/courses/${continueQuiz.courseId}`}>Open course lane</Link>
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="overflow-hidden rounded-[1.35rem] border border-borderc bg-surface/70">
                      <div className={`relative h-44 bg-gradient-to-br ${continueVisual.surfaceClass}`}>
                        <Image
                          src={continueVisual.artworkSrc}
                          alt={`${continueQuiz.title} course artwork`}
                          fill
                          className="object-cover opacity-95"
                        />
                      </div>
                    </div>
                    {recentCompletedQuizzes.length > 1 ? (
                      <div className="space-y-2">
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-faint">Also active</p>
                        {recentCompletedQuizzes.slice(1).map((set) => (
                          <Link
                            key={set.id}
                            href={`/quiz/${set.id}`}
                            className="flex items-center justify-between rounded-[1rem] border border-borderc bg-surface/70 px-4 py-3 text-sm font-semibold text-text transition-all duration-200 ease-out-expo hover:border-border-accent hover:shadow-card-hover"
                          >
                            <span>{set.title}</span>
                            <ArrowRight className="h-4 w-4 text-faint" />
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-4">
            <Card>
              <CardBody className="space-y-5 p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-text-secondary">Streak console</p>
                    <p className="mt-1 text-lg font-semibold text-text">Keep the daily rhythm visible.</p>
                  </div>
                  <span className="rounded-full bg-accent-subtle px-3 py-1 text-[11px] font-mono font-bold text-accent">
                    {studiedToday ? "Goal complete" : "Need 1 session"}
                  </span>
                </div>

                <div className="flex items-center gap-3 rounded-[1.1rem] border border-borderc bg-soft px-4 py-4">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-warn/35 bg-warn/10 text-warn">
                    <Flame className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-mono text-3xl font-bold text-text">{streak.current}</p>
                    <p className="text-sm text-text-secondary">Current streak · best {streak.best} days</p>
                  </div>
                </div>

                <div className="rounded-[1.1rem] border border-borderc bg-soft p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-faint">Last 28 days</p>
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

                <div className="rounded-[1.1rem] border border-borderc bg-soft p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-faint">Today&apos;s goal</p>
                  <p className="mt-2 text-sm font-medium text-text">
                    {studiedToday ? "Goal complete. Run one more review pass if you want extra reps." : "Finish one focused 20-minute quiz sprint."}
                  </p>
                  <Button asChild variant={studiedToday ? "secondary" : "primary"} className="mt-4 w-full">
                    <Link href={continueQuiz ? `/quiz/${continueQuiz.id}` : "/app/courses"}>
                      {studiedToday ? "Run a quick review" : "Start today's sprint"}
                    </Link>
                  </Button>
                </div>
              </CardBody>
            </Card>

            {homeworkDraftSet ? (
              <Card>
                <CardBody className="space-y-3 p-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-success">Homework draft</p>
                  <p className="text-lg font-semibold text-text">{homeworkDraftSet.title}</p>
                  <p className="text-sm text-text-secondary">
                    Draft started {formatRelativeDate(homeworkDraft?.created_at ?? new Date().toISOString())}
                  </p>
                  <Button asChild className="w-full sm:w-auto">
                    <Link href={`/app/homework/${homeworkDraftSet.id}`}>
                      Resume now
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardBody>
              </Card>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <div>
              <h2 className="text-2xl font-display font-semibold text-text">Course lanes</h2>
              <p className="mt-1 text-sm text-text-secondary">Open a course with stronger context: artwork, mastery, and a cleaner path into study materials or active section work.</p>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid gap-4 md:grid-cols-2">
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
                const visual = getCourseVisual(course.id);

                return (
                  <Link
                    key={course.id}
                    href={`/app/courses/${course.id}`}
                    className={`group overflow-hidden rounded-[1.4rem] border border-borderc bg-surface/75 transition-all duration-200 ease-out-expo hover:border-border-accent hover:shadow-card-hover stagger-${(i % 6) + 1}`}
                  >
                    <div className={`relative h-36 bg-gradient-to-br ${visual.surfaceClass}`}>
                      <Image
                        src={visual.artworkSrc}
                        alt={`${course.name} course artwork`}
                        fill
                        className="object-cover opacity-95"
                      />
                    </div>
                    <div className="space-y-4 p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone="brand">{course.code}</Badge>
                        <Badge>{course.difficulty}</Badge>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-text">{course.name}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-text-secondary">{course.description}</p>
                      </div>
                      <div>
                        <div className="mb-2 flex items-center justify-between text-xs">
                          <span className="text-faint">Mastery</span>
                          <span className="font-mono font-bold text-accent">{progress}%</span>
                        </div>
                        <ProgressBar value={progress} />
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-[1rem] border border-borderc bg-soft px-4 py-3">
                          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-faint">Last score</p>
                          <p className="mt-2 font-mono font-bold text-text">{latest ? `${latest.score}%` : "—"}</p>
                        </div>
                        <div className="rounded-[1rem] border border-borderc bg-soft px-4 py-3">
                          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-faint">Avg best</p>
                          <p className="mt-2 font-mono font-bold text-text">{avgBest}%</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm font-semibold text-text-secondary transition-colors duration-200 group-hover:text-text">
                        <span>Open course lane</span>
                        <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-out-expo group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardBody>
        </Card>

        <div className="space-y-5">
          <RecommendationsPanel items={recommendations} blockedByOnboarding={onboardingIncomplete} />

          <Card>
            <CardHeader>
              <h2 className="inline-flex items-center gap-2 text-2xl font-display font-semibold text-text">
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

      <section>
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-display font-semibold text-text">Recent attempts</h2>
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
              <div className="grid gap-3 lg:grid-cols-2">
                {recent.map((attempt, i) => {
                  const course = getCourse(attempt.courseId);
                  const visual = getCourseVisual(attempt.courseId);
                  return (
                    <div
                      key={attempt.id}
                      className={`overflow-hidden rounded-[1.25rem] border border-borderc bg-soft transition-all duration-200 ease-out-expo hover:border-border-accent hover:shadow-card-hover animate-fade-rise stagger-${(i % 6) + 1}`}
                    >
                      <div className={`h-2 bg-gradient-to-r ${visual.surfaceClass}`} />
                      <div className="space-y-3 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-text">{attempt.quizTitle}</p>
                            <p className="mt-1 text-xs text-faint">{course?.name ?? attempt.courseId} · {formatRelativeDate(attempt.date)}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-mono text-xl font-bold text-text">{attempt.score}%</p>
                            <p className="inline-flex items-center gap-1 text-xs font-mono text-faint">
                              <Clock3 className="h-3 w-3" />
                              {Math.round(attempt.timeSpent / 60)} min
                            </p>
                          </div>
                        </div>
                        <ProgressBar value={attempt.score} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>
      </section>
    </div>
  );
}
