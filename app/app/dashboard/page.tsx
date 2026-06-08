"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Clock3 } from "lucide-react";
import { courses, quizSets, getCourse } from "@/data/seed";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppData } from "@/lib/app-data-context";
import {
  courseProgress,
  getStreak,
  leaderboardPoints,
  recentAttempts
} from "@/features/progress/metrics";
import { formatRelativeDate } from "@/lib/utils";
import { getCourseVisual } from "@/features/study/course-branding";

interface HomeworkDraftRow {
  id: string;
  quiz_set_id: string;
  created_at: string;
  settings: Record<string, unknown> | null;
}

export default function DashboardPage() {
  const { ready, attempts, supabase, user } = useAppData();

  const [homeworkDraft, setHomeworkDraft] = useState<HomeworkDraftRow | null>(null);

  const streak = useMemo(() => getStreak(attempts), [attempts]);
  const points = useMemo(() => leaderboardPoints(attempts), [attempts]);

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

  const recent = useMemo(() => recentAttempts(attempts, 4), [attempts]);

  const homeworkDraftSet = useMemo(() => {
    if (!homeworkDraft) return null;
    return quizSets.find((set) => set.id === homeworkDraft.quiz_set_id) ?? null;
  }, [homeworkDraft]);

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
      <section className="space-y-1.5">
        <h1 className="font-display text-[2rem] font-semibold leading-tight tracking-tight text-text sm:text-[2.4rem]">
          Home
        </h1>
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[14px] text-text-secondary">
          <span>
            <span className="font-semibold text-text">{streak.current}-day</span> streak
          </span>
          <span className="text-text-secondary/50">·</span>
          <span>
            <span className="font-semibold text-text">{points}</span> points
          </span>
        </p>
      </section>

      {continueQuiz ? (
        <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <Card className="overflow-hidden">
            <CardBody className="grid gap-5 p-5 sm:grid-cols-[1fr_auto] sm:items-center">
              <div className="space-y-3">
                <p className="text-[11.5px] font-semibold uppercase tracking-[0.18em] text-accent">
                  Pick up where you left off
                </p>
                <h2 className="font-display text-[1.6rem] font-semibold leading-tight tracking-tight text-text">
                  {continueQuiz.title}
                </h2>
                <p className="text-[13px] text-text-secondary">
                  {continueCourse ? `${continueCourse.name} · ` : ""}about {continueQuiz.estMinutes} min
                </p>
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link href={`/quiz/${continueQuiz.id}`}>
                    Start
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="hidden h-28 w-44 shrink-0 overflow-hidden rounded-2xl border border-borderc sm:block">
                <div className={`relative h-full w-full bg-gradient-to-br ${continueVisual.surfaceClass}`}>
                  <Image
                    src={continueVisual.artworkSrc}
                    alt=""
                    fill
                    className="object-cover opacity-95"
                  />
                </div>
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

      <section className="space-y-3">
        <h2 className="font-display text-[1.4rem] font-semibold tracking-tight text-text">Your classes</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {courses.map((course, i) => {
            const progress = courseProgress(attempts, course.id);
            const visual = getCourseVisual(course.id);

            return (
              <Link
                key={course.id}
                href={`/app/courses/${course.id}`}
                className={`group flex items-center gap-4 overflow-hidden rounded-2xl border border-borderc bg-surface dark:bg-surface-raised p-3 shadow-[0_1px_0_hsl(var(--surface-raised)/0.06)_inset,0_18px_44px_-24px_hsl(var(--text)/0.28)] dark:shadow-[0_1px_0_hsl(var(--text)/0.04)_inset,0_18px_44px_-22px_rgba(0,0,0,0.55)] transition-all duration-200 ease-out-expo hover:-translate-y-px hover:border-border-accent stagger-${(i % 6) + 1}`}
              >
                <div className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br ${visual.surfaceClass}`}>
                  <Image
                    src={visual.artworkSrc}
                    alt=""
                    fill
                    className="object-cover opacity-95"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-[1.05rem] font-semibold leading-tight text-text">
                    {course.name}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <ProgressBar value={progress} />
                    <span className="shrink-0 font-mono text-[11px] font-semibold text-text-secondary">
                      {progress}%
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-text-secondary transition-transform duration-200 ease-out-expo group-hover:translate-x-1" />
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-display font-semibold text-text">Recent quizzes</h2>
          </CardHeader>
          <CardBody>
            {recent.length === 0 ? (
              <div className="rounded-[14px] border border-borderc bg-soft p-8 text-center">
                <p className="text-[16px] font-bold text-text">Take your first quiz to get started.</p>
                <p className="mt-2 text-[14px] text-muted text-text-secondary">Your recent quizzes and scores will show up here.</p>
                <Button className="mt-5" asChild>
                  <Link href="/app/courses">Go to my classes</Link>
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
