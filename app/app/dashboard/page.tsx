"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Clock3,
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

/**
 * Single hairline-divided cell in the dashboard hero stats strip.
 * Mono numerals where the value is numeric, sans where it's text
 * (e.g. "Done", "1 left") so the typography stays calm.
 */
function DashboardStat({
  label,
  value,
  detail,
  mono = false
}: {
  label: string;
  value: string | number;
  detail?: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 px-0 sm:px-5">
      <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-text-secondary">
        {label}
      </p>
      <p className="flex items-baseline gap-2">
        <span
          className={
            mono
              ? "font-mono text-[1.6rem] font-semibold leading-none text-text"
              : "font-display text-[1.4rem] font-semibold leading-none text-text"
          }
        >
          {value}
        </span>
        {detail ? (
          <span className="text-[12px] text-text-secondary">{detail}</span>
        ) : null}
      </p>
    </div>
  );
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
    <div className="animate-fade-rise space-y-5 md:space-y-6">
      {/*
       * Dashboard hero — calmer than the previous stack of bordered
       * sub-cards. A serif headline + one-line subtitle, then the four
       * key signals laid out as a single hairline-divided strip
       * (Stripe-dashboard pattern), with the "Start" CTA flush right.
       */}
      <section className="space-y-4">
        <div className="space-y-1.5">
          <h1 className="font-display text-[2rem] font-semibold leading-tight tracking-tight text-text sm:text-[2.4rem]">
            Dashboard
          </h1>
          <p className="max-w-[42rem] text-[14px] leading-relaxed text-text-secondary">
            Quick access to the next quiz, your current pace, and the course that needs attention.
          </p>
        </div>

        <Card>
          <CardBody className="grid gap-y-4 p-5 sm:grid-cols-2 sm:divide-x sm:divide-borderc xl:grid-cols-[repeat(4,minmax(0,1fr))_auto] xl:items-center">
            <DashboardStat label="Points" value={points} mono />
            <DashboardStat
              label="Streak"
              value={`${streak.current}d`}
              detail={`best ${streak.best}d`}
              mono
            />
            <DashboardStat
              label="Recommended"
              value={recommendations.length}
              mono
            />
            <DashboardStat
              label="Today"
              value={studiedToday ? "Done" : "1 left"}
              detail={studiedToday ? "Goal complete" : "Need a session"}
            />
            <div className="sm:col-span-2 sm:pl-5 xl:col-span-1">
              <Button
                asChild
                variant={studiedToday ? "secondary" : "primary"}
                className="h-11 w-full xl:w-auto"
              >
                <Link href={continueQuiz ? `/quiz/${continueQuiz.id}` : "/app/courses"}>
                  {studiedToday ? "Run a quick review" : "Start today's practice"}
                </Link>
              </Button>
            </div>
          </CardBody>
        </Card>
      </section>

      {continueQuiz ? (
        <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <Card className="overflow-hidden">
            <CardBody className="grid gap-5 p-5 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-4">
                {/* Mono context line — replaces the previous stack of three
                    coloured badges. Reads as a Stripe-style metadata row. */}
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-text-secondary">
                  {continueCourse ? `${continueCourse.code} · ` : ""}
                  {continueQuiz.difficulty}
                  <span className="mx-2 text-text-secondary/50">·</span>
                  Personal best{" "}
                  <span className="font-semibold text-accent">{continueQuizBest}%</span>
                </p>

                <div>
                  <p className="text-[11.5px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                    Continue where you left off
                  </p>
                  <h2 className="mt-1.5 font-display text-[1.7rem] font-semibold leading-tight tracking-tight text-text">
                    {continueQuiz.title}
                  </h2>
                  <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-text-secondary">
                    {continueQuiz.description}
                  </p>
                </div>

                <dl className="grid gap-3 border-t border-borderc pt-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-text-secondary">
                      Last attempt
                    </dt>
                    <dd className="mt-1 text-[13.5px] font-semibold text-text">
                      {continueQuizLast ? formatRelativeDate(continueQuizLast.date) : "No attempts yet"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-text-secondary">
                      Estimated time
                    </dt>
                    <dd className="mt-1 text-[13.5px] font-semibold text-text">
                      {continueQuiz.estMinutes} minutes
                    </dd>
                  </div>
                </dl>

                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  <Button asChild>
                    <Link href={`/quiz/${continueQuiz.id}`}>
                      Start quiz
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="secondary" asChild>
                    <Link href={`/app/courses/${continueQuiz.courseId}`}>Open course</Link>
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="overflow-hidden rounded-2xl border border-borderc">
                  <div className={`relative h-32 bg-gradient-to-br ${continueVisual.surfaceClass}`}>
                    <Image
                      src={continueVisual.artworkSrc}
                      alt={`${continueQuiz.title} course artwork`}
                      fill
                      className="object-cover opacity-95"
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-borderc bg-soft/60 p-4">
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-text-secondary">
                    Last 28 days
                  </p>
                  <div className="mt-2.5 grid grid-cols-7 gap-1">
                    {heatmap.map((cell) => (
                      <span
                        key={cell.key}
                        title={`${cell.label}: ${cell.count} ${cell.count === 1 ? "session" : "sessions"}`}
                        className={`h-[10px] w-[10px] rounded-[3px] transition-colors ${
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

                {recentCompletedQuizzes.length > 1 ? (
                  <div className="space-y-1.5">
                    <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-text-secondary">
                      Also active
                    </p>
                    <ul className="divide-y divide-borderc rounded-2xl border border-borderc bg-soft/40">
                      {recentCompletedQuizzes.slice(1).map((set) => (
                        <li key={set.id}>
                          <Link
                            href={`/quiz/${set.id}`}
                            className="flex items-center justify-between gap-3 px-4 py-2.5 text-[13px] font-semibold text-text transition-colors hover:bg-soft"
                          >
                            <span className="truncate">{set.title}</span>
                            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-text-secondary" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </CardBody>
          </Card>

          {homeworkDraftSet ? (
            <Card>
              <CardBody className="space-y-2 p-3.5">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-success">Homework draft</p>
                <p className="text-[15px] font-semibold text-text">{homeworkDraftSet.title}</p>
                <p className="text-[13px] leading-relaxed text-text-secondary">
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
        </section>
      ) : homeworkDraftSet ? (
        <Card>
          <CardBody className="space-y-2 p-3.5">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-success">Homework draft</p>
            <p className="text-[15px] font-semibold text-text">{homeworkDraftSet.title}</p>
            <p className="text-[13px] leading-relaxed text-text-secondary">
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

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <div>
              <h2 className="font-display text-[1.55rem] font-semibold tracking-tight text-text">Your courses</h2>
              <p className="mt-1 text-[13.5px] text-text-secondary">
                Open a course with the right context: artwork, mastery, and a clean path into study materials.
              </p>
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
                    className={`group overflow-hidden rounded-2xl border border-borderc bg-surface dark:bg-surface-raised shadow-[0_1px_0_hsl(var(--surface-raised)/0.06)_inset,0_18px_44px_-24px_hsl(var(--text)/0.28),0_6px_16px_-10px_hsl(var(--text)/0.16)] dark:shadow-[0_1px_0_hsl(var(--text)/0.04)_inset,0_18px_44px_-22px_rgba(0,0,0,0.55)] transition-all duration-200 ease-out-expo hover:-translate-y-px hover:border-border-accent stagger-${(i % 6) + 1}`}
                  >
                    <div className={`relative h-32 bg-gradient-to-br ${visual.surfaceClass}`}>
                      <Image
                        src={visual.artworkSrc}
                        alt={`${course.name} course artwork`}
                        fill
                        className="object-cover opacity-95"
                      />
                      <div className="absolute left-3 top-3">
                        <Badge tone="accent">{course.code}</Badge>
                      </div>
                    </div>
                    <div className="space-y-4 p-5">
                      <div>
                        <h3 className="font-display text-[1.15rem] font-semibold leading-tight tracking-tight text-text">
                          {course.name}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-text-secondary">
                          {course.description}
                        </p>
                      </div>

                      <div>
                        <div className="mb-1.5 flex items-baseline justify-between text-[11px]">
                          <span className="font-bold uppercase tracking-[0.18em] text-text-secondary">
                            Mastery
                          </span>
                          <span className="font-mono font-semibold text-text">{progress}%</span>
                        </div>
                        <ProgressBar value={progress} />
                      </div>

                      {/* Last/avg as a single mono context line — replaces the
                          two bordered sub-cards. Calmer + reads as data. */}
                      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-secondary">
                        Last <span className="text-text">{latest ? `${latest.score}%` : "—"}</span>
                        <span className="mx-2 text-text-secondary/50">·</span>
                        Avg best <span className="text-text">{avgBest}%</span>
                        <span className="mx-2 text-text-secondary/50">·</span>
                        {course.difficulty}
                      </p>

                      <div className="flex items-center justify-between border-t border-borderc pt-3 text-[12.5px] font-semibold text-text-secondary transition-colors duration-200 group-hover:text-text">
                        <span>Open course</span>
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
                Up next
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
