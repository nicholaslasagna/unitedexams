"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Clock3, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { MasteryRing } from "@/components/ui/mastery-ring";
import { useAppData } from "@/lib/app-data-context";
import {
  buildLabAttempt,
  completeUnanswered,
  type LabMode,
  type RecordedAnswer
} from "./mastery";
import { getMistake, rankMistakes, type MistakeTag } from "./mistakes";
import { followUpQuestion } from "./practice";
import type { LabQuestion } from "./question-model";
import { QuestionRunner, type QuestionResult } from "./question-runner";
import { topicLabel, type TopicId } from "./topics";

/**
 * A run of questions, from start to summary.
 *
 * The attempt is saved once, at the end, in the same shape the quiz engine
 * produces — so streaks, the activity feed and course analytics pick it up
 * with no special cases. A session abandoned halfway records nothing, which
 * is the honest outcome: half a drill is not evidence of mastery.
 */

export interface SessionSummary {
  total: number;
  correct: number;
  byTopic: Record<string, { correct: number; total: number; seconds: number }>;
  mistakes: Partial<Record<MistakeTag, number>>;
  seconds: number;
  missedQuestions: LabQuestion[];
}

function formatClock(totalSeconds: number) {
  const clamped = Math.max(0, totalSeconds);
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function PracticeSession({
  questions,
  mode,
  title,
  subtitle,
  timed = false,
  timeLimitMinutes,
  onExit,
  onFinished,
  onPracticeMissed,
  className
}: {
  questions: LabQuestion[];
  mode: LabMode;
  title: string;
  subtitle?: string;
  timed?: boolean;
  timeLimitMinutes?: number;
  onExit?: () => void;
  onFinished?: (summary: SessionSummary) => void;
  onPracticeMissed?: (questions: LabQuestion[]) => void;
  className?: string;
}) {
  const { saveAttempt } = useAppData();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<RecordedAnswer[]>([]);
  const [finished, setFinished] = useState(false);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [detour, setDetour] = useState<LabQuestion | null>(null);
  const [remaining, setRemaining] = useState(
    timed && timeLimitMinutes ? timeLimitMinutes * 60 : null
  );
  const startedAt = useRef(0);
  const questionStartedAt = useRef(0);
  const savedRef = useRef(false);
  const answersRef = useRef<RecordedAnswer[]>([]);
  const indexRef = useRef(0);
  const missedRef = useRef<LabQuestion[]>([]);
  const topicSecondsRef = useRef<Record<string, number>>({});

  const active = detour ?? questions[index];
  const progress = questions.length > 0 ? (index / questions.length) * 100 : 0;
  const deferFeedback = timed;

  useEffect(() => {
    const now = Date.now();
    startedAt.current = now;
    questionStartedAt.current = now;
  }, []);

  const bumpTopicTime = useCallback((topic: TopicId) => {
    const elapsed = Math.max(1, Math.round((Date.now() - questionStartedAt.current) / 1000));
    const next = {
      ...topicSecondsRef.current,
      [topic]: (topicSecondsRef.current[topic] ?? 0) + elapsed
    };
    topicSecondsRef.current = next;
    questionStartedAt.current = Date.now();
  }, []);

  const finish = useCallback(
    async (collected: RecordedAnswer[], missed: LabQuestion[]) => {
      if (savedRef.current) return;
      savedRef.current = true;

      const seconds = Math.round((Date.now() - startedAt.current) / 1000);
      const attempt = buildLabAttempt({ mode, answers: collected, timeSpentSeconds: seconds });

      try {
        await saveAttempt(attempt);
      } catch {
        // A failed save must not lose the learner their summary.
      }

      const byTopic: SessionSummary["byTopic"] = {};
      const mistakes: SessionSummary["mistakes"] = {};
      collected.forEach((answer) => {
        const entry = byTopic[answer.topic] ?? {
          correct: 0,
          total: 0,
          seconds: topicSecondsRef.current[answer.topic] ?? 0
        };
        entry.total += 1;
        if (answer.correct) entry.correct += 1;
        byTopic[answer.topic] = entry;
        answer.mistakes.forEach((tag) => {
          mistakes[tag] = (mistakes[tag] ?? 0) + 1;
        });
      });

      const summary: SessionSummary = {
        total: collected.length,
        correct: collected.filter((answer) => answer.correct).length,
        byTopic,
        mistakes,
        seconds,
        missedQuestions: missed
      };
      setSummary(summary);
      setFinished(true);
      onFinished?.(summary);
    },
    [mode, onFinished, saveAttempt]
  );

  const handleAnswered = useCallback(
    (result: QuestionResult) => {
      if (!detour) bumpTopicTime(result.question.topic);
      setAnswers((current) => {
        /*
         * One record per question. "Retry this one" clears the verdict so the
         * question can be answered again, and appending each time meant an
         * eight-question set could record nine answers — the retry inflating
         * the denominator, and the discarded attempt lingering in mastery.
         *
         * The first answer is the one kept. A retry after reading the
         * correction is practice, and letting it overwrite a wrong answer
         * would make readiness measure what you can do once told, which is
         * not what the exam asks.
         */
        if (current.some((answer) => answer.questionId === result.question.id)) {
          return current;
        }
        const next = [
          ...current,
          {
            questionId: result.question.id,
            topic: result.question.topic,
            correct: result.correct,
            mistakes: result.mistakes
          }
        ];
        answersRef.current = next;
        return next;
      });
      if (!result.correct && !missedRef.current.some((q) => q.id === result.question.id)) {
        missedRef.current = [...missedRef.current, result.question];
      }
    },
    [bumpTopicTime, detour]
  );

  const advance = useCallback(() => {
    if (detour) {
      setDetour(null);
      questionStartedAt.current = Date.now();
      return;
    }
    const next = index + 1;
    indexRef.current = next;
    if (next >= questions.length) {
      void finish(answersRef.current, missedRef.current);
      return;
    }
    questionStartedAt.current = Date.now();
    setIndex(next);
  }, [detour, finish, index, questions.length]);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    if (!timed || finished) return;
    const timer = window.setInterval(() => {
      setRemaining((value) => {
        if (value === null || value <= 0) return 0;
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [finished, timed]);

  useEffect(() => {
    if (!timed || remaining !== 0 || finished) return;
    const { answers: collected, missed: newlyMissed } = completeUnanswered(
      questions,
      answersRef.current,
      indexRef.current
    );
    const missed = [...missedRef.current, ...newlyMissed];
    answersRef.current = collected;
    missedRef.current = missed;
    void finish(collected, missed);
  }, [finished, finish, questions, remaining, timed]);

  if (finished && summary) {
    const score = summary.total > 0 ? Math.round((summary.correct / summary.total) * 100) : 0;
    const ranked = rankMistakes(summary.mistakes, 4);

    return (
      <Card className={className}>
        <CardHeader>
          <h2 className="text-heading font-semibold text-text">{title} — results</h2>
          <p className="mt-0.5 text-body-sm text-text-secondary">
            {summary.correct} of {summary.total} correct in {formatClock(summary.seconds)}.
          </p>
        </CardHeader>
        <CardBody className="space-y-6">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
            <div className="relative shrink-0">
              <MasteryRing
                value={score}
                label="Score"
                tone={score >= 85 ? "success" : score >= 60 ? "warn" : "danger"}
              />
            </div>

            <div className="min-w-0 flex-1 space-y-2">
              <h3 className="text-body-sm font-semibold text-text">How each topic went</h3>
              {Object.entries(summary.byTopic)
                .sort((a, b) => a[1].correct / a[1].total - b[1].correct / b[1].total)
                .map(([topic, stats]) => {
                  const percent = Math.round((stats.correct / stats.total) * 100);
                  return (
                    <div key={topic} className="space-y-1">
                      <div className="flex items-baseline justify-between gap-3 text-body-sm">
                        <span className="truncate text-text">{topicLabel(topic as TopicId)}</span>
                        <span className="shrink-0 font-mono text-caption text-text-secondary">
                          {stats.correct}/{stats.total}
                          {stats.seconds > 0 ? ` · ${formatClock(stats.seconds)}` : ""}
                        </span>
                      </div>
                      <ProgressBar value={percent} />
                    </div>
                  );
                })}
            </div>
          </div>

          {ranked.length > 0 ? (
            <div className="space-y-2">
              <h3 className="text-body-sm font-semibold text-text">What to fix</h3>
              {ranked.map((entry) => (
                <div
                  key={entry.tag}
                  className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3"
                >
                  <p className="flex items-center gap-2 text-body-sm font-semibold text-text">
                    {entry.definition.label}
                    {entry.count > 1 ? (
                      <Badge tone="danger" size="sm">
                        {entry.count}×
                      </Badge>
                    ) : null}
                  </p>
                  <p className="mt-1 text-body-sm leading-relaxed text-text-secondary">
                    {entry.definition.correction}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-body-sm text-text">
              No recurring misconceptions in this run.
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {summary.missedQuestions.length > 0 && onPracticeMissed ? (
              <Button onClick={() => onPracticeMissed(summary.missedQuestions)}>
                Practise the {summary.missedQuestions.length} missed
              </Button>
            ) : null}
            {onExit ? (
              <Button variant={summary.missedQuestions.length > 0 ? "secondary" : "primary"} onClick={onExit}>
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Back to Exam 1
              </Button>
            ) : null}
          </div>
        </CardBody>
      </Card>
    );
  }

  if (!active) {
    return (
      <Card className={className}>
        <CardBody>
          <p className="text-body-sm text-text-secondary">No questions available for this selection.</p>
          {onExit ? (
            <Button className="mt-3" variant="secondary" onClick={onExit}>
              Back
            </Button>
          ) : null}
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-heading font-semibold text-text">{title}</h2>
            {subtitle ? <p className="mt-0.5 text-body-sm text-text-secondary">{subtitle}</p> : null}
          </div>
          <div className="flex items-center gap-2">
            {remaining !== null ? (
              <Badge tone={remaining <= 120 ? "danger" : "warn"} size="sm">
                <Clock3 className="mr-1 inline h-3 w-3" aria-hidden />
                {formatClock(remaining)} left
              </Badge>
            ) : timed && timeLimitMinutes ? (
              <Badge tone="warn" size="sm">
                <Clock3 className="mr-1 inline h-3 w-3" aria-hidden />
                {timeLimitMinutes} min
              </Badge>
            ) : null}
            {onExit ? (
              <Button variant="ghost" size="sm" onClick={onExit}>
                Exit
              </Button>
            ) : null}
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between text-caption text-text-secondary">
            <span>
              {detour ? (
                <span className="inline-flex items-center gap-1.5 text-accent">
                  <Target className="h-3 w-3" aria-hidden />
                  Extra practice
                </span>
              ) : (
                `Question ${index + 1} of ${questions.length}`
              )}
            </span>
            <span className="font-mono">
              {timed ? `${index + 1}/${questions.length}` : `${answers.filter((answer) => answer.correct).length} correct`}
            </span>
          </div>
          <ProgressBar value={progress} />
        </div>
      </CardHeader>

      <CardBody>
        <QuestionRunner
          key={active.id}
          question={active}
          onAnswered={handleAnswered}
          onNext={advance}
          deferFeedback={deferFeedback && !detour}
          nextLabel={
            detour
              ? "Back to the set"
              : index + 1 >= questions.length
                ? "Finish and see results"
                : "Next question"
          }
          onPractiseSimilar={
            deferFeedback
              ? undefined
              : (question) => {
                  const follow = followUpQuestion(question, answers.length);
                  if (follow) setDetour(follow);
                }
          }
        />
      </CardBody>
    </Card>
  );
}

export function mistakeSummaryLine(tag: MistakeTag): string {
  return getMistake(tag).correction;
}
