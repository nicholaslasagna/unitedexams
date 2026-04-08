"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Lightbulb, BookCheck, GraduationCap, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Markdown } from "@/components/ui/markdown";
import { AssessmentChoiceRow } from "@/components/ui/assessment-choice-row";
import { choiceMarkerForIndex, cn } from "@/lib/utils";
import type { Question } from "@/lib/types";

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  selected: number[];
  responseText: string;
  onToggleOption: (index: number) => void;
  onResponseChange: (value: string) => void;
  onSubmitQuestion: () => void;
  submitted: boolean;
  isCorrect: boolean | null;
  selfMarked?: boolean;
  onSelfMark: (isCorrect: boolean) => void;
  lockInteraction?: boolean;
  disableSelfMark?: boolean;
  showExplanation: boolean;
  onToggleExplanation: () => void;
  studyMode?: boolean;
  showHintsBeforeSubmit?: boolean;
  revealCorrectness?: boolean;
  interactionNotice?: string;
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selected,
  responseText,
  onToggleOption,
  onResponseChange,
  onSubmitQuestion,
  submitted,
  isCorrect,
  selfMarked,
  onSelfMark,
  lockInteraction = false,
  disableSelfMark = false,
  showExplanation,
  onToggleExplanation,
  studyMode = false,
  showHintsBeforeSubmit = true,
  revealCorrectness = true,
  interactionNotice
}: QuestionCardProps) {
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [revealedSteps, setRevealedSteps] = useState(0);
  const [revealedHints, setRevealedHints] = useState(0);

  useEffect(() => {
    setShowWalkthrough(false);
    setRevealedSteps(0);
    setRevealedHints(0);
  }, [question.id]);

  const isLongResponse = question.type === "free";
  const isShortResponse = question.type === "fill";
  const isTextResponse = isLongResponse || isShortResponse;
  const optionRole = question.type === "single" ? "radiogroup" : "group";
  const promptId = `prompt-${question.id}`;
  const canSubmit = isTextResponse ? responseText.trim().length > 0 : selected.length > 0;

  const options = question.options ?? [];
  const correctSet = useMemo(() => new Set(question.correct ?? []), [question.correct]);
  const hints = question.hintSteps ?? [];
  const effectiveHintCount = studyMode && submitted ? hints.length : revealedHints;
  const hintedSteps = hints.slice(0, effectiveHintCount);
  const walkthroughSteps = question.walkthroughSteps ?? [];
  const effectiveRevealedSteps = studyMode && submitted ? walkthroughSteps.length : revealedSteps;
  const visibleSteps = walkthroughSteps.slice(0, effectiveRevealedSteps);
  const walkthroughExpanded = (studyMode && submitted) || showWalkthrough;

  return (
    <Card className="overflow-hidden">
      <CardBody className="space-y-6 p-6 md:p-7">
        {/* Header with question number and topic tags */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-2/15 font-mono text-xs font-bold text-brand-2">
              {questionNumber}
            </span>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-secondary">
              of <span className="font-mono">{totalQuestions}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {question.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} tone="brand">
                {tag.replace(/-/g, " ")}
              </Badge>
            ))}
          </div>
        </div>

        {/* Question prompt */}
        <div id={promptId} className="space-y-4">
          <Markdown content={question.prompt} className="quiz-question-prompt" promoteMathInInlineCode />
          {question.imageUrl ? (
            <img src={question.imageUrl} alt="Question visual" className="max-h-72 w-full rounded-xl border border-borderc object-cover" />
          ) : null}
        </div>

        {/* Free response or multiple choice options */}
        {isTextResponse ? (
          <div className="space-y-3">
            <label htmlFor={`free-response-${question.id}`} className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              {isShortResponse ? "Your Answer" : "Your Solution"}
            </label>
            {isShortResponse ? (
              <Input
                id={`free-response-${question.id}`}
                value={responseText}
                onChange={(event) => onResponseChange(event.target.value)}
                placeholder="Enter a short answer."
                disabled={lockInteraction}
                spellCheck={false}
                aria-labelledby={promptId}
                className={cn("font-mono", lockInteraction && "cursor-not-allowed opacity-90")}
              />
            ) : (
              <textarea
                id={`free-response-${question.id}`}
                value={responseText}
                onChange={(event) => onResponseChange(event.target.value)}
                placeholder="Work through the problem step by step. Show your method and write your final answer."
                disabled={lockInteraction}
                className={cn(
                  "min-h-40 w-full rounded-xl border border-borderc bg-soft p-4 font-mono text-sm leading-relaxed text-text outline-none transition placeholder:text-muted",
                  "focus-visible:ring-2 focus-visible:ring-brand-2/65",
                  lockInteraction && "cursor-not-allowed opacity-90"
                )}
                aria-labelledby={promptId}
              />
            )}

            {isLongResponse && hints.length > 0 && (showHintsBeforeSubmit || submitted) ? (
              <div className="rounded-xl border border-brand-2/30 bg-brand-2/10 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-brand-2" />
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-2">
                      Guided Hints ({effectiveHintCount}/{hints.length})
                    </p>
                  </div>
                  {!submitted && showHintsBeforeSubmit ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        variant="ghost"
                        disabled={revealedHints >= hints.length}
                        onClick={() => setRevealedHints((prev) => Math.min(hints.length, prev + 1))}
                      >
                        <ChevronRight className="h-4 w-4" />
                        {revealedHints >= hints.length ? "All hints revealed" : `Reveal hint ${revealedHints + 1}`}
                      </Button>
                      <Button
                        variant="ghost"
                        disabled={revealedHints <= 0}
                        onClick={() => setRevealedHints((prev) => Math.max(0, prev - 1))}
                      >
                        Hide last hint
                      </Button>
                      <Button
                        variant="ghost"
                        disabled={revealedHints <= 0}
                        onClick={() => setRevealedHints(0)}
                      >
                        Hide all
                      </Button>
                    </div>
                  ) : null}
                </div>

                {/* Progress dots */}
                <div className="mt-3 flex gap-1.5">
                  {hints.map((_, idx) => (
                    <div
                      key={`hint-dot-${idx}`}
                      className={cn(
                        "h-1.5 flex-1 rounded-full transition-all duration-300",
                        idx < effectiveHintCount ? "bg-brand-2" : "bg-brand-2/20"
                      )}
                    />
                  ))}
                </div>

                {hintedSteps.length > 0 ? (
                  <ol className="mt-4 space-y-3">
                    {hintedSteps.map((hint, idx) => (
                      <li
                        key={`${question.id}-hint-${idx}`}
                        className="flex gap-3 rounded-lg border border-brand-2/20 bg-brand-2/5 p-3 text-sm text-text"
                      >
                        <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-2/20 text-[10px] font-bold text-brand-2">
                          {idx + 1}
                        </span>
                        <div className="flex-1">
                          <Markdown content={hint} promoteMathInInlineCode />
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="mt-3 text-sm text-text-secondary">Stuck? Reveal hints one at a time to guide your thinking.</p>
                )}

                {question.sampleAnswer && effectiveHintCount === hints.length ? (
                  <div className="mt-4 rounded-lg border border-success/30 bg-success/10 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-success">Guided Final Answer</p>
                    <div className="mt-2 text-sm text-text">
                      <Markdown content={question.sampleAnswer} promoteMathInInlineCode />
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : (
          <div role={optionRole} aria-labelledby={promptId} className="space-y-2.5">
            {options.map((option, index) => {
              const key = choiceMarkerForIndex(index);
              const checked = selected.includes(index);
              const isCorrectOption = correctSet.has(index);
              const optionState = submitted
                ? revealCorrectness
                  ? checked && isCorrectOption
                    ? "ok"
                    : checked && !isCorrectOption
                      ? "bad"
                      : !checked && isCorrectOption
                        ? "missed"
                        : "default"
                  : checked
                    ? "selected"
                    : "default"
                : checked
                  ? "selected"
                  : "default";

              return (
                <AssessmentChoiceRow
                  key={`${question.id}-${index}`}
                  kind={question.type === "single" ? "single" : "multi"}
                  marker={key}
                  content={option}
                  checked={checked}
                  state={optionState}
                  role={question.type === "single" ? "radio" : "checkbox"}
                  disabled={lockInteraction}
                  onClick={() => onToggleOption(index)}
                />
              );
            })}
          </div>
        )}

        {/* Pre-submit action bar */}
        {!submitted ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-borderc bg-soft p-3">
            <p className="text-xs text-text-secondary">
              {interactionNotice
                ? interactionNotice
                : isTextResponse
                ? "Work through the problem step by step, then submit. Use hints if stuck."
                : "Keyboard: A/B/C/D choose • Enter submit • Arrow keys navigate"}
            </p>
            {lockInteraction ? null : (
              <Button onClick={onSubmitQuestion} disabled={!canSubmit || lockInteraction}>
                Submit Answer
              </Button>
            )}
          </div>
        ) : (
          /* Post-submit feedback banner */
          <div
            className={cn(
              "rounded-xl border p-4",
              !revealCorrectness && "border-brand-2/35 bg-brand-2/10",
              revealCorrectness && isCorrect === null && "border-brand-2/35 bg-brand-2/10",
              revealCorrectness && isCorrect === true && "border-success/40 bg-success/10",
              revealCorrectness && isCorrect === false && "border-danger/40 bg-danger/10"
            )}
          >
            <div className="flex items-start gap-3">
              {!revealCorrectness ? (
                <GraduationCap className="mt-0.5 h-5 w-5 shrink-0 text-brand-2" />
              ) : isCorrect === true ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
              ) : isCorrect === false ? (
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
              ) : (
                <GraduationCap className="mt-0.5 h-5 w-5 shrink-0 text-brand-2" />
              )}
              <div className="flex-1">
                <p className="text-sm font-semibold text-text">
                  {!revealCorrectness
                    ? "Answer recorded. Correctness and full explanation will be shown at the end."
                    : isCorrect === null
                      ? "Response submitted — now review the solution step by step."
                      : isCorrect
                        ? "Correct! Well done."
                        : "Not quite. Study the walkthrough below to understand why."}
                </p>
                {revealCorrectness && isCorrect === false && !isTextResponse ? (
                  <p className="mt-1 text-xs text-text-secondary">
                    Your answer is highlighted in red. The correct answer is highlighted in yellow.
                  </p>
                ) : null}
              </div>
            </div>

            {revealCorrectness ? (
              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="secondary" onClick={onToggleExplanation}>
                  <BookCheck className="h-4 w-4" />
                  {showExplanation ? "Hide explanation" : "Show explanation"}
                </Button>
                {walkthroughSteps.length > 0 && !studyMode ? (
                  <Button variant="ghost" onClick={() => {
                    setShowWalkthrough((prev) => !prev);
                    if (!showWalkthrough && revealedSteps === 0) setRevealedSteps(1);
                  }}>
                    <GraduationCap className="h-4 w-4" />
                    {showWalkthrough ? "Hide walkthrough" : "Step-by-step walkthrough"}
                  </Button>
                ) : null}
                {walkthroughSteps.length > 0 && studyMode ? (
                  <span className="inline-flex items-center gap-2 rounded-lg border border-brand-2/35 bg-brand-2/10 px-3 py-1.5 text-xs font-semibold text-brand-2">
                    <GraduationCap className="h-3.5 w-3.5" />
                    Guided walkthrough enabled
                  </span>
                ) : null}
              </div>
            ) : null}

            {/* Self-check for free response */}
            {isLongResponse && !disableSelfMark ? (
              <div className="mt-3 rounded-lg border border-borderc bg-soft p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Self-check</p>
                <p className="mt-1 text-sm text-text-secondary">
                  Compare your work with the walkthrough. Did you get it right?
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    variant={selfMarked === true ? "primary" : "secondary"}
                    onClick={() => onSelfMark(true)}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    I got this
                  </Button>
                  <Button
                    variant={selfMarked === false ? "primary" : "ghost"}
                    onClick={() => onSelfMark(false)}
                  >
                    <XCircle className="h-4 w-4" />
                    Need review
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Explanation panel */}
        {submitted && showExplanation ? (
          <div className="space-y-3">
            <div className="rounded-xl border border-borderc bg-soft p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted">Explanation</p>
              <div className="prose-sm">
                <Markdown content={question.explanation} promoteMathInInlineCode />
              </div>
              {question.sampleAnswer ? (
                <div className="mt-4 rounded-lg border border-success/30 bg-success/10 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-success">Correct Answer</p>
                  <div className="mt-1 text-sm text-text">
                    <Markdown content={question.sampleAnswer} promoteMathInInlineCode />
                  </div>
                </div>
              ) : null}
              {question.references && question.references.length > 0 ? (
                <div className="mt-4 rounded-lg border border-borderc bg-surface p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Source</p>
                  {question.references.map((ref) => (
                    <p key={ref} className="mt-1 text-xs text-muted">
                      {ref}
                    </p>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* Progressive walkthrough panel */}
        {submitted && walkthroughExpanded && walkthroughSteps.length > 0 ? (
          <div className="rounded-xl border border-brand-2/35 bg-brand-2/[0.06] p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-brand-2" />
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-2">
                  Step-by-Step Solution
                </p>
              </div>
              <p className="text-xs font-mono text-brand-2/70">
                {effectiveRevealedSteps}/{walkthroughSteps.length}
              </p>
            </div>

            {/* Step progress bar */}
            <div className="mt-3 flex gap-1">
              {walkthroughSteps.map((_, idx) => (
                <div
                  key={`step-bar-${idx}`}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-all duration-500",
                    idx < effectiveRevealedSteps ? "bg-brand-2" : "bg-brand-2/15"
                  )}
                />
              ))}
            </div>

            {/* Revealed steps */}
            <div className="mt-4 space-y-3">
              {visibleSteps.map((step, idx) => (
                <div
                  key={`${question.id}-step-${idx}`}
                  className="flex gap-3 rounded-lg border border-brand-2/20 bg-brand-2/[0.04] p-3"
                >
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-2/20 text-[11px] font-bold text-brand-2">
                    {idx + 1}
                  </span>
                  <div className="flex-1 text-sm text-text">
                    <Markdown content={step} promoteMathInInlineCode />
                  </div>
                </div>
              ))}
            </div>

            {/* Reveal / hide step controls */}
            {!studyMode ? (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRevealedSteps((prev) => Math.min(walkthroughSteps.length, prev + 1))}
                  disabled={revealedSteps >= walkthroughSteps.length}
                  className="flex items-center justify-center gap-2 rounded-lg border border-brand-2/30 bg-brand-2/10 px-3 py-2.5 text-sm font-semibold text-brand-2 transition-all duration-200 ease-out-expo hover:bg-brand-2/15 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <ChevronDown className="h-4 w-4" />
                  {revealedSteps >= walkthroughSteps.length
                    ? "All steps revealed"
                    : `Reveal step ${revealedSteps + 1} of ${walkthroughSteps.length}`}
                </button>
                <Button
                  variant="ghost"
                  disabled={revealedSteps <= 0}
                  onClick={() => setRevealedSteps((prev) => Math.max(0, prev - 1))}
                >
                  Hide last step
                </Button>
                <Button
                  variant="ghost"
                  disabled={revealedSteps <= 0}
                  onClick={() => setRevealedSteps(0)}
                >
                  Hide all
                </Button>
              </div>
            ) : (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-3 py-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <p className="text-xs font-semibold text-success">All steps revealed — make sure you understand each one.</p>
              </div>
            )}
          </div>
        ) : null}
      </CardBody>
    </Card>
  );
}
