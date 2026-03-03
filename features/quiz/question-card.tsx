"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Lightbulb, BookCheck } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Markdown } from "@/components/ui/markdown";
import { cn } from "@/lib/utils";
import type { Question } from "@/lib/types";

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  selected: number[];
  onToggleOption: (index: number) => void;
  onSubmitQuestion: () => void;
  submitted: boolean;
  isCorrect: boolean | null;
  lockInteraction?: boolean;
  showExplanation: boolean;
  onToggleExplanation: () => void;
}

const optionKeys = ["A", "B", "C", "D", "E", "F"];

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selected,
  onToggleOption,
  onSubmitQuestion,
  submitted,
  isCorrect,
  lockInteraction = false,
  showExplanation,
  onToggleExplanation
}: QuestionCardProps) {
  const [showWalkthrough, setShowWalkthrough] = useState(false);

  const optionRole = question.type === "single" ? "radiogroup" : "group";
  const promptId = `prompt-${question.id}`;
  const canSubmit = selected.length > 0;

  const correctSet = useMemo(() => new Set(question.correct), [question.correct]);

  return (
    <Card className="overflow-hidden">
      <CardBody className="space-y-6 p-6 md:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            Question {questionNumber} of {totalQuestions}
          </p>
          <div className="flex flex-wrap gap-2">
            {question.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} tone="brand">
                {tag.replace(/-/g, " ")}
              </Badge>
            ))}
          </div>
        </div>

        <div id={promptId} className="space-y-4">
          <Markdown content={question.prompt} />
          {question.imageUrl ? (
            <img src={question.imageUrl} alt="Question visual" className="max-h-72 w-full rounded-xl border border-borderc object-cover" />
          ) : null}
        </div>

        <div role={optionRole} aria-labelledby={promptId} className="space-y-2.5">
          {question.options.map((option, index) => {
            const key = optionKeys[index] ?? `${index + 1}`;
            const checked = selected.includes(index);
            const isCorrectOption = correctSet.has(index);
            const optionState = submitted
              ? checked && isCorrectOption
                ? "ok"
                : checked && !isCorrectOption
                  ? "bad"
                  : !checked && isCorrectOption
                    ? "missed"
                    : "default"
              : checked
                ? "selected"
                : "default";

            return (
              <button
                key={`${question.id}-${index}`}
                type="button"
                role={question.type === "single" ? "radio" : "checkbox"}
                aria-checked={checked}
                disabled={lockInteraction}
                onClick={() => onToggleOption(index)}
                className={cn(
                  "group flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition",
                  optionState === "selected" && "border-brand-2/55 bg-brand-2/10",
                  optionState === "ok" && "border-success/45 bg-success/15",
                  optionState === "bad" && "border-danger/45 bg-danger/15",
                  optionState === "missed" && "border-warn/45 bg-warn/15",
                  optionState === "default" && "border-borderc bg-soft hover:border-brand-2/40 hover:bg-white/5",
                  lockInteraction && "cursor-not-allowed opacity-90"
                )}
              >
                <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-borderc bg-surface text-xs font-bold text-muted group-hover:text-text">
                  {key}
                </span>
                <span className="pt-0.5 text-sm leading-relaxed text-text">{option}</span>
              </button>
            );
          })}
        </div>

        {!submitted ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-borderc bg-soft p-3">
            <p className="text-xs text-muted">Keyboard: A/B/C/D choose options • Enter submit • Arrow keys navigate</p>
            <Button onClick={onSubmitQuestion} disabled={!canSubmit}>
              Submit Answer
            </Button>
          </div>
        ) : (
          <div className={cn("rounded-xl border p-4", isCorrect ? "border-success/40 bg-success/10" : "border-danger/40 bg-danger/10")}>
            <p className="text-sm font-semibold text-text">
              {isCorrect ? "Correct. Strong work." : "Not quite yet. Review the reasoning below."}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="secondary" onClick={onToggleExplanation}>
                <BookCheck className="h-4 w-4" />
                {showExplanation ? "Hide explanation" : "Show explanation"}
              </Button>
              {question.walkthroughSteps && question.walkthroughSteps.length > 0 ? (
                <Button variant="ghost" onClick={() => setShowWalkthrough((prev) => !prev)}>
                  <Lightbulb className="h-4 w-4" />
                  {showWalkthrough ? "Hide walkthrough" : "Open walkthrough"}
                </Button>
              ) : null}
            </div>
          </div>
        )}

        {submitted && showExplanation ? (
          <div className="rounded-xl border border-borderc bg-soft p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">Explanation</p>
            <Markdown content={question.explanation} />
            {question.references && question.references.length > 0 ? (
              <div className="mt-3 space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">References</p>
                {question.references.map((ref) => (
                  <p key={ref} className="text-sm text-muted">
                    • {ref}
                  </p>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {submitted && showWalkthrough && question.walkthroughSteps ? (
          <div className="rounded-xl border border-brand-2/35 bg-brand-2/10 p-4">
            <button
              type="button"
              className="mb-3 flex items-center gap-2 text-left text-xs font-semibold uppercase tracking-[0.15em] text-brand-2"
              onClick={() => setShowWalkthrough((prev) => !prev)}
            >
              <ChevronDown className="h-4 w-4" />
              Walkthrough steps
            </button>
            <ol className="space-y-2 pl-4">
              {question.walkthroughSteps.map((step, idx) => (
                <li key={`${question.id}-step-${idx}`} className="text-sm text-text">
                  <Markdown content={step} />
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </CardBody>
    </Card>
  );
}
