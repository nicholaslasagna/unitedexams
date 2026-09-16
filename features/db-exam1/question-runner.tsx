"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  Lightbulb,
  RotateCcw,
  Sparkles,
  XCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RAExpression } from "@/components/ra/ra-expression";
import { CandidateTable, RelationTable } from "@/components/ra/relation-table";
import { cn } from "@/lib/utils";
import { ExpressionInput } from "./expression-input";
import { getMistake, type MistakeTag } from "./mistakes";
import {
  emptyAnswer,
  gradeQuestion,
  isAnswered,
  type GradeResult,
  type LabAnswer,
  type LabQuestion
} from "./question-model";
import { SchemaCard } from "./schema-card";
import { topicLabel } from "./topics";
import { Walkthrough } from "./walkthrough";

/**
 * Asks one question, grades it, and explains the answer.
 *
 * The feedback is the product. Getting something wrong is the moment a
 * learner is most able to change their mind, so a wrong answer produces the
 * specific correction for the misconception it revealed — not the generic
 * explanation — followed immediately by the offer of a near-transfer question
 * that tests the same thing with different numbers.
 */

export interface QuestionResult {
  question: LabQuestion;
  correct: boolean;
  mistakes: MistakeTag[];
}

const SOURCE_LABEL: Record<LabQuestion["source"], { text: string; tone: "accent" | "default" }> = {
  professor: { text: "Course material", tone: "accent" },
  "study-guide": { text: "Class study guide", tone: "accent" },
  generated: { text: "Generated variant", tone: "default" }
};

export function QuestionRunner({
  question,
  onAnswered,
  onNext,
  nextLabel = "Next question",
  onPractiseSimilar,
  showWalkthroughOption = true,
  autoFocus = true,
  deferFeedback = false,
  className
}: {
  question: LabQuestion;
  onAnswered?: (result: QuestionResult) => void;
  onNext?: () => void;
  nextLabel?: string;
  /** Offers a near-transfer follow-up after a wrong answer. */
  onPractiseSimilar?: (question: LabQuestion) => void;
  showWalkthroughOption?: boolean;
  autoFocus?: boolean;
  /** Record the answer and move on without showing the verdict — used by the timed mock exam. */
  deferFeedback?: boolean;
  className?: string;
}) {
  const [answer, setAnswer] = useState<LabAnswer>(() => emptyAnswer(question));
  const [result, setResult] = useState<GradeResult | null>(null);
  const [hintsShown, setHintsShown] = useState(0);
  const [walkthroughOpen, setWalkthroughOpen] = useState(false);
  const [seenId, setSeenId] = useState(question.id);

  if (question.id !== seenId) {
    setSeenId(question.id);
    setAnswer(emptyAnswer(question));
    setResult(null);
    setHintsShown(0);
    setWalkthroughOpen(false);
  }

  const submit = useCallback(() => {
    if (result || !isAnswered(answer, question)) return;
    const graded = gradeQuestion(question, answer);
    onAnswered?.({
      question,
      correct: graded.correct,
      mistakes: graded.mistakes
    });
    if (deferFeedback) {
      onNext?.();
      return;
    }
    setResult(graded);
  }, [answer, deferFeedback, onAnswered, onNext, question, result]);

  const toggleIndex = useCallback(
    (index: number) => {
      if (result) return;
      setAnswer((current) => {
        if (current.kind === "choice") {
          const multiple = question.kind === "choice" && question.multiple;
          if (!multiple) return { kind: "choice", selected: [index] };
          return {
            kind: "choice",
            selected: current.selected.includes(index)
              ? current.selected.filter((value) => value !== index)
              : [...current.selected, index]
          };
        }
        if (current.kind === "rows") {
          return {
            kind: "rows",
            selected: current.selected.includes(index)
              ? current.selected.filter((value) => value !== index)
              : [...current.selected, index]
          };
        }
        return current;
      });
    },
    [question, result]
  );

  // Number keys pick options; Enter submits. Fast repetition is the point of a drill.
  useEffect(() => {
    if (result) return;
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && /input|textarea/i.test(target.tagName)) return;
      if (question.kind === "choice") {
        const index = Number(event.key) - 1;
        if (Number.isInteger(index) && index >= 0 && index < question.options.length) {
          event.preventDefault();
          toggleIndex(index);
        }
      }
      if (event.key === "Enter") {
        event.preventDefault();
        submit();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [question, result, submit, toggleIndex]);

  const correction = useMemo(() => {
    if (!result || result.correct || result.mistakes.length === 0) return null;
    const primary = result.mistakes.find((tag) => tag !== "unclassified") ?? result.mistakes[0];
    return getMistake(primary);
  }, [result]);

  const sourceBadge = SOURCE_LABEL[question.source];

  return (
    <div className={cn("space-y-5", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="brand" size="sm">
          {topicLabel(question.topic)}
        </Badge>
        <Badge tone={sourceBadge.tone} size="sm">
          {sourceBadge.text}
        </Badge>
        {question.sourceNote ? (
          <span className="text-caption text-faint">{question.sourceNote}</span>
        ) : null}
      </div>

      <h2 className="text-subheading font-semibold leading-snug text-text">{question.prompt}</h2>

      {question.context?.note ? (
        <p className="text-body-sm text-text-secondary">{question.context.note}</p>
      ) : null}

      {question.context?.expression ? (
        <div className="overflow-x-auto rounded-xl border border-border-accent bg-accent-wash px-4 py-3">
          <RAExpression source={question.context.expression} block className="text-[1.05rem]" />
        </div>
      ) : null}

      {question.context?.schemaId ? (
        <SchemaCard
          schemaId={question.context.schemaId}
          highlight={question.kind === "expression" ? question.available : []}
        />
      ) : null}

      {question.context?.relations?.length ? (
        <div
          className={cn(
            "grid gap-4",
            question.context.relations.length > 1 ? "lg:grid-cols-2" : ""
          )}
        >
          {question.context.relations.map((relation, index) => (
            <RelationTable
              key={`${relation.name}-${index}`}
              relation={relation}
              caption={relation.name}
            />
          ))}
        </div>
      ) : null}

      {/* ── Answer input ─────────────────────────────────────────────── */}

      {question.kind === "choice" ? (
        <div className="space-y-2" role="group" aria-label="Answer options">
          {question.options.map((option, index) => {
            const selected = answer.kind === "choice" && answer.selected.includes(index);
            const reveal = Boolean(result);
            const isCorrect = option.correct;
            return (
              <button
                key={index}
                type="button"
                disabled={Boolean(result)}
                onClick={() => toggleIndex(index)}
                aria-pressed={selected}
                autoFocus={autoFocus && index === 0}
                className={cn(
                  "flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-2/60",
                  !reveal && selected && "border-border-accent bg-accent/10",
                  !reveal && !selected && "border-borderc bg-surface hover:bg-soft dark:bg-surface-raised",
                  reveal && isCorrect && "border-success/50 bg-success/10",
                  reveal && !isCorrect && selected && "border-danger/50 bg-danger/10",
                  reveal && !isCorrect && !selected && "border-borderc opacity-60"
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border text-[0.7rem] font-bold",
                    selected
                      ? "border-transparent bg-accent text-accent-fg"
                      : "border-borderc text-faint"
                  )}
                  aria-hidden
                >
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1 text-body-sm leading-relaxed text-text">
                  {option.text}
                  {reveal && option.note ? (
                    <span className="mt-1.5 block text-body-sm text-text-secondary">
                      {option.note}
                    </span>
                  ) : null}
                </span>
                {reveal ? (
                  isCorrect ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
                  ) : selected ? (
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden />
                  ) : null
                ) : null}
              </button>
            );
          })}
          {question.multiple ? (
            <p className="text-caption text-faint">
              Select every option that applies. Leave all unchecked if none do.
            </p>
          ) : null}
        </div>
      ) : null}

      {question.kind === "shape" ? (
        <div className="flex flex-wrap gap-4">
          {(["degree", "cardinality"] as const).map((field) => (
            <label key={field} className="flex flex-col gap-1.5">
              <span className="text-caption font-semibold uppercase tracking-[0.08em] text-text-secondary">
                {field}
                <span className="ml-1.5 font-normal normal-case tracking-normal text-faint">
                  {field === "degree" ? "attributes" : "tuples"}
                </span>
              </span>
              <input
                type="number"
                min={0}
                inputMode="numeric"
                disabled={Boolean(result)}
                autoFocus={autoFocus && field === "degree"}
                value={
                  answer.kind === "shape"
                    ? (field === "degree" ? answer.degree : answer.cardinality) ?? ""
                    : ""
                }
                onChange={(event) =>
                  setAnswer((current) =>
                    current.kind === "shape"
                      ? {
                          ...current,
                          [field]: event.target.value === "" ? null : Number(event.target.value)
                        }
                      : current
                  )
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    submit();
                  }
                }}
                className="h-11 w-28 rounded-xl border border-borderc bg-surface px-3 font-mono text-body text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-2/60 dark:bg-surface-raised"
              />
            </label>
          ))}
        </div>
      ) : null}

      {question.kind === "rows" ? (
        <div className="space-y-2">
          <p className="text-caption text-faint">
            Tick every tuple that belongs in the result. Submit with none ticked if the result is
            empty.
          </p>
          <CandidateTable
            attributes={question.attributes}
            rows={question.candidates.map((candidate) => candidate.values)}
            selected={answer.kind === "rows" ? answer.selected : []}
            onToggleRow={toggleIndex}
            disabled={Boolean(result)}
            verdicts={
              result
                ? question.candidates.map((candidate, index) => {
                    const picked = answer.kind === "rows" && answer.selected.includes(index);
                    if (candidate.inResult && picked) return "correct";
                    if (candidate.inResult && !picked) return "missed";
                    if (!candidate.inResult && picked) return "wrong";
                    return null;
                  })
                : undefined
            }
          />
        </div>
      ) : null}

      {question.kind === "expression" ? (
        <ExpressionInput
          value={answer.kind === "expression" ? answer.text : ""}
          onChange={(text) => setAnswer({ kind: "expression", text })}
          available={question.available}
          disabled={Boolean(result)}
          onSubmit={submit}
          autoFocus={autoFocus}
        />
      ) : null}

      {/* ── Hints and walkthrough ────────────────────────────────────── */}

      {!result && !deferFeedback ? (
        <div className="flex flex-wrap gap-2">
          {question.hints && hintsShown < question.hints.length ? (
            <Button variant="ghost" size="sm" onClick={() => setHintsShown((n) => n + 1)}>
              <Lightbulb className="h-3.5 w-3.5" aria-hidden />
              {hintsShown === 0 ? "Need a hint?" : "Another hint"}
            </Button>
          ) : null}
          {showWalkthroughOption && question.walkthrough?.length ? (
            <Button variant="ghost" size="sm" onClick={() => setWalkthroughOpen(true)}>
              <GraduationCap className="h-3.5 w-3.5" aria-hidden />
              Work through it with me
            </Button>
          ) : null}
        </div>
      ) : null}

      {hintsShown > 0 && question.hints ? (
        <ol className="space-y-2">
          {question.hints.slice(0, hintsShown).map((hint, index) => (
            <li
              key={index}
              className="flex gap-2.5 rounded-xl border border-warn/30 bg-warn/10 px-3.5 py-2.5 text-body-sm text-text"
            >
              <span className="font-mono text-caption font-bold text-warn">{index + 1}</span>
              <span>{hint}</span>
            </li>
          ))}
        </ol>
      ) : null}

      {walkthroughOpen && question.walkthrough?.length ? (
        <Walkthrough
          steps={question.walkthrough}
          onClose={() => setWalkthroughOpen(false)}
        />
      ) : null}

      {/* ── Verdict ──────────────────────────────────────────────────── */}

      {result ? (
        <div
          className={cn(
            "rounded-xl border px-4 py-3.5",
            result.correct ? "border-success/40 bg-success/10" : "border-danger/40 bg-danger/10"
          )}
          role="status"
        >
          <p className="flex items-center gap-2 text-subheading font-semibold text-text">
            {result.correct ? (
              <CheckCircle2 className="h-5 w-5 text-success" aria-hidden />
            ) : (
              <XCircle className="h-5 w-5 text-danger" aria-hidden />
            )}
            {result.correct ? "Correct" : "Not quite"}
          </p>

          <p className="mt-2 text-body-sm leading-relaxed text-text">{result.feedback}</p>

          {correction ? (
            <div className="mt-3 rounded-lg border border-borderc bg-surface px-3.5 py-3 dark:bg-surface-raised">
              <p className="text-caption font-semibold uppercase tracking-[0.08em] text-danger">
                {correction.label}
              </p>
              <p className="mt-1.5 text-body-sm leading-relaxed text-text-secondary">
                {correction.correction}
              </p>
            </div>
          ) : null}

          {!result.correct && result.expectedRelation ? (
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              <RelationTable
                relation={result.expectedRelation}
                caption="The correct answer returns"
              />
              {result.producedRelation ? (
                <RelationTable
                  relation={result.producedRelation}
                  caption="Your expression returned"
                />
              ) : null}
            </div>
          ) : null}

          {question.kind === "expression" && !result.correct ? (
            <div className="mt-3 rounded-lg border border-borderc bg-surface px-3.5 py-3 dark:bg-surface-raised">
              <p className="text-caption font-semibold uppercase tracking-[0.08em] text-text-secondary">
                One correct answer
              </p>
              <div className="mt-1.5 overflow-x-auto">
                <RAExpression source={question.referenceText} />
              </div>
            </div>
          ) : null}

          {!result.correct || question.explanation !== result.feedback ? (
            <p className="mt-3 text-body-sm leading-relaxed text-text-secondary">
              {question.explanation}
            </p>
          ) : null}
        </div>
      ) : null}

      {/* ── Actions ──────────────────────────────────────────────────── */}

      <div className="flex flex-wrap gap-2">
        {!result ? (
          <Button onClick={submit} disabled={!isAnswered(answer, question)}>
            {deferFeedback ? "Save and continue" : "Check answer"}
          </Button>
        ) : (
          <>
            {onNext ? (
              <Button onClick={onNext}>
                {nextLabel}
                <ChevronRight className="h-4 w-4" aria-hidden />
              </Button>
            ) : null}
            {!result.correct && onPractiseSimilar ? (
              <Button variant="secondary" onClick={() => onPractiseSimilar(question)}>
                <Sparkles className="h-4 w-4" aria-hidden />
                Try a similar one
              </Button>
            ) : null}
            {!result.correct ? (
              <Button
                variant="ghost"
                title="Work it through again. Your first answer is the one that counts."
                onClick={() => {
                  setAnswer(emptyAnswer(question));
                  setResult(null);
                }}
              >
                <RotateCcw className="h-4 w-4" aria-hidden />
                Try it again
              </Button>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
