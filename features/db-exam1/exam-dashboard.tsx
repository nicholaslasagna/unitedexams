"use client";

import { useMemo } from "react";
import {
  AlertTriangle,
  ArrowLeftRight,
  BookOpenText,
  CalendarDays,
  FlaskConical,
  Flame,
  KeyRound,
  Library,
  ListChecks,
  Play,
  Sigma,
  Timer,
  TrendingUp,
  Zap
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { MasteryRing } from "@/components/ui/mastery-ring";
import { ProgressBar } from "@/components/ui/progress";
import { getStreak } from "@/features/progress/metrics";
import type { Attempt } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  formatExamDate,
  masteryByTopic,
  mistakeCounts,
  nextTopic,
  readiness,
  recentlyMissed,
  weakestTopics,
  type MasteryLevel
} from "./mastery";
import { MOCK_EXAM_LENGTH } from "./practice";
import { rankMistakes } from "./mistakes";
import { TOPICS, topicLabel, type TopicId } from "./topics";

/**
 * The Exam 1 dashboard.
 *
 * Every figure here is computed from recorded answers. A learner who has done
 * nothing sees zeros and an invitation, not a fabricated "68% ready" — a
 * readiness number that does not come from evidence is worse than no number,
 * because it gets believed.
 */

export type ExamView =
  | "dashboard"
  | "path"
  | "table-lab"
  | "division-lab"
  | "key-lab"
  | "algebra"
  | "cheat-sheet"
  | "study-guide"
  | "sources"
  | "mock-exam"
  | "cram";

const LEVEL_STYLE: Record<MasteryLevel, { label: string; dot: string; text: string }> = {
  "not-started": { label: "Not started", dot: "bg-borderc", text: "text-faint" },
  weak: { label: "Weak", dot: "bg-danger", text: "text-danger" },
  learning: { label: "Learning", dot: "bg-warn", text: "text-warn" },
  mastered: { label: "Mastered", dot: "bg-success", text: "text-success" }
};

export function ExamDashboard({
  attempts,
  onStartPractice,
  onNavigate,
  className
}: {
  attempts: Attempt[];
  /** Starts a run. `topic` narrows it; omitted means an adaptive mix. */
  onStartPractice: (options: { topic?: TopicId; label: string }) => void;
  onNavigate: (view: ExamView) => void;
  className?: string;
}) {
  const state = useMemo(() => readiness(attempts), [attempts]);
  const mastery = useMemo(() => masteryByTopic(attempts), [attempts]);
  const weak = useMemo(() => weakestTopics(attempts, 3), [attempts]);
  const missed = useMemo(() => recentlyMissed(attempts, 3), [attempts]);
  const mistakes = useMemo(() => rankMistakes(mistakeCounts(attempts), 3), [attempts]);
  const streak = useMemo(() => getStreak(attempts), [attempts]);
  const next = useMemo(() => nextTopic(attempts), [attempts]);

  const fresh = state.questionsAnswered === 0;

  return (
    <div className={cn("space-y-5", className)}>
      {/* ── Readiness ───────────────────────────────────────────────── */}
      <Card>
        <CardBody className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="relative shrink-0 self-center">
            <MasteryRing
              value={state.percent}
              size={150}
              label="Ready"
              caption={fresh ? "No practice yet" : `${state.questionsAnswered} answered`}
              tone={state.percent >= 80 ? "success" : state.percent >= 50 ? "warn" : "danger"}
            />
          </div>

          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="accent" size="sm">
                <CalendarDays className="mr-1 inline h-3 w-3" aria-hidden />
                Exam 1 · {formatExamDate()}
              </Badge>
              <Badge tone={state.daysUntilExam <= 3 ? "danger" : "default"} size="sm">
                {state.daysUntilExam === 0
                  ? "Exam day"
                  : `${state.daysUntilExam} day${state.daysUntilExam === 1 ? "" : "s"} to go`}
              </Badge>
              {streak.current > 0 ? (
                <Badge tone="warn" size="sm">
                  <Flame className="mr-1 inline h-3 w-3" aria-hidden />
                  {streak.current}-day streak
                </Badge>
              ) : null}
            </div>

            <p className="text-body-sm leading-relaxed text-text-secondary">
              {fresh
                ? "Nothing recorded yet. Readiness is built from questions you actually answer, so it starts at zero and moves as you work."
                : `${state.topicsMastered} of ${state.topicsTotal} topics mastered, ${state.topicsStarted} started. Overall accuracy ${state.accuracy}%.`}
            </p>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "Answered", value: state.questionsAnswered },
                { label: "Accuracy", value: `${state.accuracy}%` },
                { label: "Mastered", value: `${state.topicsMastered}/${state.topicsTotal}` },
                { label: "Days left", value: state.daysUntilExam }
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-borderc bg-soft px-3 py-2">
                  <p className="font-mono text-subheading font-bold text-text">{stat.value}</p>
                  <p className="text-caption uppercase tracking-[0.08em] text-faint">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* ── Primary actions ─────────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <ActionCard
          icon={Play}
          title="Continue learning"
          body={
            fresh
              ? `Start at the beginning: ${topicLabel(next)}.`
              : `Picks up at ${topicLabel(next)} — the topic that needs you most.`
          }
          cta="Start practice"
          primary
          onClick={() => onStartPractice({ topic: next, label: topicLabel(next) })}
        />
        <ActionCard
          icon={AlertTriangle}
          title="Practise weak areas"
          body={
            weak.length > 0
              ? `Targets ${weak.map((entry) => topicLabel(entry.topic)).join(", ")}.`
              : "Nothing is weak yet. Answer a few questions and this will fill in."
          }
          cta="Drill weak areas"
          disabled={weak.length === 0}
          onClick={() => onStartPractice({ label: "Weak areas" })}
        />
        <ActionCard
          icon={Timer}
          title="Mock exam"
          body={`A full ${MOCK_EXAM_LENGTH}-question paper across every examined topic, timed or untimed.`}
          cta="Take mock exam"
          onClick={() => onNavigate("mock-exam")}
        />
        <ActionCard
          icon={FlaskConical}
          title="Table Lab"
          body="Run every join over two relations and watch which tuples match and where the NULLs come from."
          cta="Open the lab"
          onClick={() => onNavigate("table-lab")}
        />
        <ActionCard
          icon={Sigma}
          title="Division Lab"
          body="The coverage grid that makes for all visible."
          cta="Open division"
          onClick={() => onNavigate("division-lab")}
        />
        <ActionCard
          icon={BookOpenText}
          title="Study guide"
          body="The professor's own questions — Homework #1 and the Lecture 2–5 material."
          cta="Open study guide"
          onClick={() => onNavigate("study-guide")}
        />
        <ActionCard
          icon={KeyRound}
          title="Keys & integrity"
          body="Assemble a key from the table, then name the integrity rule a bad insert breaks."
          cta="Open the lab"
          onClick={() => onNavigate("key-lab")}
        />
        <ActionCard
          icon={ArrowLeftRight}
          title="English ↔ algebra"
          body="Write queries from English, read expressions back, or run anything against the course data."
          cta="Open algebra studio"
          onClick={() => onNavigate("algebra")}
        />
        <ActionCard
          icon={Library}
          title="Course sources"
          body="Jump from Lecture 2–5 or a Homework #1 question straight into that material."
          cta="Open sources"
          onClick={() => onNavigate("sources")}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* ── Topic mastery ─────────────────────────────────────────── */}
        <Card>
          <CardHeader className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-subheading font-semibold text-text">Topic mastery</h2>
              <p className="mt-0.5 text-caption text-text-secondary">
                Tracked separately — a strong σ does not cover a weak semijoin.
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate("path")}>
              Learning path
            </Button>
          </CardHeader>
          <CardBody className="space-y-2.5">
            {TOPICS.map((topic) => {
              const entry = mastery[topic.id];
              const style = LEVEL_STYLE[entry.level];
              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => onStartPractice({ topic: topic.id, label: topic.label })}
                  className={cn(
                    "w-full rounded-lg px-2 py-1.5 text-left transition",
                    "hover:bg-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-2/60"
                  )}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        className={cn("h-2 w-2 shrink-0 rounded-full", style.dot)}
                        aria-hidden
                      />
                      <span className="truncate text-body-sm text-text">{topic.label}</span>
                    </span>
                    <span
                      className={cn(
                        "shrink-0 font-mono text-caption uppercase tracking-[0.06em]",
                        style.text
                      )}
                    >
                      {entry.level === "not-started"
                        ? style.label
                        : `${entry.score}% · ${entry.attempted}`}
                    </span>
                  </div>
                  <ProgressBar value={entry.score} className="mt-1" />
                </button>
              );
            })}
          </CardBody>
        </Card>

        {/* ── Diagnostics ───────────────────────────────────────────── */}
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <h2 className="text-subheading font-semibold text-text">What keeps going wrong</h2>
              <p className="mt-0.5 text-caption text-text-secondary">
                Patterns across your answers, not one-off slips.
              </p>
            </CardHeader>
            <CardBody className="space-y-3">
              {mistakes.length === 0 ? (
                <p className="text-body-sm text-text-secondary">
                  {fresh
                    ? "Nothing to show yet. Misconceptions appear here once you have answered some questions."
                    : "No repeating misconceptions so far."}
                </p>
              ) : (
                mistakes.map((entry) => (
                  <div
                    key={entry.tag}
                    className="rounded-xl border border-borderc bg-soft px-3.5 py-3"
                  >
                    <p className="flex items-center gap-2 text-body-sm font-semibold text-text">
                      {entry.definition.label}
                      <Badge tone={entry.count >= 3 ? "danger" : "warn"} size="sm">
                        {entry.count}×
                      </Badge>
                    </p>
                    <p className="mt-1 text-body-sm leading-relaxed text-text-secondary">
                      {entry.definition.correction}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-1.5"
                      onClick={() =>
                        onStartPractice({
                          topic: entry.definition.drillTopic,
                          label: entry.definition.label
                        })
                      }
                    >
                      <Zap className="h-3.5 w-3.5" aria-hidden />
                      Drill this
                    </Button>
                  </div>
                ))
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between gap-3">
              <h2 className="text-subheading font-semibold text-text">Recently missed</h2>
              <Button variant="ghost" size="sm" onClick={() => onNavigate("cram")}>
                <ListChecks className="h-3.5 w-3.5" aria-hidden />
                Final review
              </Button>
            </CardHeader>
            <CardBody>
              {missed.length === 0 ? (
                <p className="text-body-sm text-text-secondary">
                  Nothing missed recently.
                </p>
              ) : (
                <ul className="space-y-2">
                  {missed.map((event) => (
                    <li
                      key={`${event.topic}-${event.questionId}`}
                      className="flex items-center justify-between gap-3"
                    >
                      <span className="flex min-w-0 items-center gap-2 text-body-sm text-text">
                        <TrendingUp className="h-3.5 w-3.5 shrink-0 text-danger" aria-hidden />
                        <span className="truncate">{topicLabel(event.topic)}</span>
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          onStartPractice({ topic: event.topic, label: topicLabel(event.topic) })
                        }
                      >
                        Retry
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ActionCard({
  icon: Icon,
  title,
  body,
  cta,
  onClick,
  primary = false,
  disabled = false
}: {
  icon: typeof Play;
  title: string;
  body: string;
  cta: string;
  onClick: () => void;
  primary?: boolean;
  disabled?: boolean;
}) {
  return (
    <Card className={cn("flex flex-col", disabled && "opacity-60")}>
      <CardBody className="flex flex-1 flex-col gap-2">
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl",
            primary ? "bg-accent text-accent-fg" : "bg-soft text-accent"
          )}
          aria-hidden
        >
          <Icon className="h-4 w-4" />
        </span>
        <h3 className="text-body-sm font-semibold text-text">{title}</h3>
        <p className="flex-1 text-body-sm leading-relaxed text-text-secondary">{body}</p>
        <Button
          variant={primary ? "primary" : "secondary"}
          size="sm"
          className="mt-1 self-start"
          onClick={onClick}
          disabled={disabled}
        >
          {cta}
        </Button>
      </CardBody>
    </Card>
  );
}
