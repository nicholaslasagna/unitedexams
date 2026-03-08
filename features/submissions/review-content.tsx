"use client";

import { Markdown } from "@/components/ui/markdown";
import { Badge } from "@/components/ui/badge";
import type { SubmissionReview } from "@/features/submissions/api";

function formatQuestionType(type: string) {
  switch (type) {
    case "single":
      return "Multiple choice";
    case "multi":
      return "Multiple answer";
    case "fill":
      return "Short response";
    case "free":
      return "Free response";
    default:
      return type;
  }
}

function coerceNumberArray(values: Array<number | string>) {
  return values
    .map((value) => (typeof value === "number" ? value : Number.parseInt(String(value), 10)))
    .filter((value) => Number.isFinite(value));
}

function optionLabelsFromIndexes(options: string[], values: Array<number | string>) {
  return coerceNumberArray(values)
    .map((index) => options[index])
    .filter((label): label is string => Boolean(label));
}

function textAnswers(values: Array<number | string>) {
  return values
    .map((value) => String(value).trim())
    .filter((value) => value.length > 0);
}

function formatHistoryLabel(review: SubmissionReview, id: string) {
  const item = review.history.find((entry) => entry.id === id);
  if (!item) return "Submission";
  if (review.kind === "exam") {
    return item.submittedAt
      ? new Date(item.submittedAt).toLocaleString()
      : item.createdAt
        ? new Date(item.createdAt).toLocaleString()
        : "Attempt";
  }
  return item.gradedAt
    ? new Date(item.gradedAt).toLocaleString()
    : item.createdAt
      ? new Date(item.createdAt).toLocaleString()
      : "Submission";
}

export function SubmissionReviewContent({
  review,
  loading = false,
  emptyMessage = "No submitted work was found.",
  selectedHistoryId,
  selectingHistoryId,
  onSelectHistory
}: {
  review: SubmissionReview | null;
  loading?: boolean;
  emptyMessage?: string;
  selectedHistoryId?: string | null;
  selectingHistoryId?: string | null;
  onSelectHistory?: (historyId: string) => void;
}) {
  if (loading) {
    return <p className="text-sm text-muted">Loading submitted work…</p>;
  }

  if (!review) {
    return <p className="text-sm text-muted">{emptyMessage}</p>;
  }

  const reviewStatus = review.submission?.status ?? review.attempt?.status ?? "submitted";
  const reviewScore = review.submission?.score ?? review.attempt?.score ?? null;
  const completedAt = review.attempt?.completedAt ?? review.attempt?.submittedAt ?? review.submission?.createdAt ?? null;
  const timeSpentSeconds = review.attempt?.timeSpentSeconds ?? null;
  const feedback = review.submission?.feedback ?? null;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={review.kind === "exam" ? "warn" : "brand"}>
            {review.kind === "exam" ? "Exam" : "Assignment"}
          </Badge>
          <Badge>{review.source.sectionName}</Badge>
          <Badge tone="info">{review.studentName}</Badge>
        </div>
        <div>
          <p className="text-lg font-semibold text-text">{review.source.title}</p>
          <p className="text-sm text-text-secondary">{review.source.courseId}</p>
        </div>
      </div>

      {review.history.length > 1 ? (
        <div className="space-y-2 rounded-xl border border-borderc bg-soft p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Submission history</p>
          <div className="flex flex-wrap gap-2">
            {review.history.map((item) => {
              const active = (selectedHistoryId ?? review.submission?.id ?? review.attempt?.id ?? "") === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectHistory?.(item.id)}
                  disabled={!onSelectHistory || selectingHistoryId === item.id}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    active
                      ? "border-accent/50 bg-accent-subtle text-text"
                      : "border-borderc bg-surface text-text-secondary hover:text-text"
                  }`}
                >
                  {selectingHistoryId === item.id ? "Loading…" : formatHistoryLabel(review, item.id)}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.14em] text-muted">
        <span>Status: {reviewStatus}</span>
        {reviewScore !== null ? <span>Score: {reviewScore}%</span> : null}
        {completedAt ? <span>Submitted: {new Date(completedAt).toLocaleString()}</span> : null}
        {timeSpentSeconds ? <span>Time spent: {Math.max(1, Math.round(timeSpentSeconds / 60))} min</span> : null}
        {typeof review.attempt?.suspicionScore === "number" ? <span>Integrity score: {review.attempt.suspicionScore}</span> : null}
      </div>

      {feedback ? (
        <div className="rounded-lg border border-borderc bg-soft px-3 py-2 text-sm text-text-secondary">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted">Instructor feedback</p>
          <p className="whitespace-pre-wrap">{feedback}</p>
        </div>
      ) : null}

      {review.questions.length ? (
        <div className="space-y-3">
          {review.questions.map((question, index) => {
            const selectedLabels = optionLabelsFromIndexes(question.options, question.selected);
            const correctOptionLabels = optionLabelsFromIndexes(question.options, question.correct);
            const acceptedText = textAnswers(question.correct);
            const textResponses = question.responseText
              ? question.responseText
              : ["fill", "free"].includes(question.questionType)
                ? textAnswers(question.selected).join("\n")
                : "";

            return (
              <div
                key={`${review.kind}:${review.source.id}:${question.questionId}:${index}`}
                className="rounded-lg border border-borderc bg-soft px-3 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-text">
                    Question {index + 1} · {formatQuestionType(question.questionType)}
                  </p>
                  <span className="text-xs text-muted">
                    {question.isCorrect ? "Marked correct" : "Needs review"}
                    {question.selfMarked !== null
                      ? ` · Self-check: ${question.selfMarked ? "I got this" : "Need review"}`
                      : ""}
                  </span>
                </div>

                <div className="mt-2 text-sm text-text">
                  <Markdown content={question.prompt} promoteMathInInlineCode />
                </div>

                {textResponses ? (
                  <div className="mt-3 rounded-lg border border-borderc bg-surface px-3 py-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                      Submitted response
                    </p>
                    <p className="mt-2 whitespace-pre-wrap font-mono text-sm text-text">
                      {textResponses}
                    </p>
                  </div>
                ) : null}

                {selectedLabels.length > 0 ? (
                  <div className="mt-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                      Selected options
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-text-secondary">
                      {selectedLabels.map((label) => (
                        <li key={`${question.questionId}:${label}`}>• {label}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {review.solutionsVisible ? (
                  <>
                    {correctOptionLabels.length > 0 || acceptedText.length > 0 ? (
                      <details className="mt-3 rounded-lg border border-borderc bg-surface px-3 py-2">
                        <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                          Expected answer
                        </summary>
                        <div className="mt-2 space-y-2 text-sm text-text-secondary">
                          {correctOptionLabels.length > 0 ? (
                            <ul className="space-y-1">
                              {correctOptionLabels.map((label) => (
                                <li key={`${question.questionId}:correct:${label}`}>• {label}</li>
                              ))}
                            </ul>
                          ) : null}
                          {acceptedText.length > 0 ? (
                            <ul className="space-y-1">
                              {acceptedText.map((value) => (
                                <li key={`${question.questionId}:accepted:${value}`}>• {value}</li>
                              ))}
                            </ul>
                          ) : null}
                        </div>
                      </details>
                    ) : null}

                    {question.solutionMd || question.explanation ? (
                      <details className="mt-3 rounded-lg border border-borderc bg-surface px-3 py-2">
                        <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                          Solution / explanation
                        </summary>
                        <div className="mt-2 space-y-3 text-sm text-text">
                          {question.solutionMd ? (
                            <Markdown content={question.solutionMd} promoteMathInInlineCode />
                          ) : null}
                          {question.explanation ? (
                            <Markdown content={question.explanation} promoteMathInInlineCode />
                          ) : null}
                        </div>
                      </details>
                    ) : null}
                  </>
                ) : (
                  <div className="mt-3 rounded-lg border border-dashed border-borderc bg-surface px-3 py-2 text-sm text-muted">
                    Solutions are not released for this submission yet.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted">No saved question-level responses were found for this item.</p>
      )}
    </div>
  );
}
