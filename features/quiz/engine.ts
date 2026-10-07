import { uid } from "@/lib/utils";
import type { Attempt, PerQuestionResult, Question, QuizSet } from "@/lib/types";

function normalizeText(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function isOpenResponseQuestion(question: Question) {
  return question.type === "free" || question.type === "fill";
}

export function requiresSelfMark(question: Question) {
  return question.type === "free";
}

/** A question's weight in the score. Unweighted sets count every question as 1. */
export function questionPoints(question: Question) {
  return question.points ?? 1;
}

/**
 * The share of a written answer's points earned, from 0 to 1.
 *
 * With a rubric, ticked criteria earn their marks. Without one, the
 * self-mark is all-or-nothing, which is how every written answer scored
 * before rubrics existed.
 */
export function writtenFraction(question: Question, selfMarked: boolean | undefined, ticked: number[] = []) {
  const rubric = question.rubric ?? [];
  if (rubric.length === 0) return selfMarked ? 1 : 0;
  const available = rubric.reduce((sum, item) => sum + item.marks, 0);
  if (available <= 0) return 0;
  const earned = [...new Set(ticked)]
    .filter((index) => index >= 0 && index < rubric.length)
    .reduce((sum, index) => sum + rubric[index].marks, 0);
  return earned / available;
}

/** Percentage from weighted fractions; equal to correct/total when every weight is 1. */
export function weightedScore(entries: Array<{ points: number; fraction: number }>) {
  const possible = entries.reduce((sum, entry) => sum + entry.points, 0);
  if (possible <= 0) return 0;
  const earned = entries.reduce((sum, entry) => sum + entry.points * entry.fraction, 0);
  return Math.round((earned / possible) * 100);
}

export function gradeQuestion(question: Question, selected: number[], responseText = "") {
  if (question.type === "free") return false;
  if (question.type === "fill") {
    const normalizedResponse = normalizeText(responseText);
    if (!normalizedResponse) return false;
    const acceptable = (question.correct ?? [])
      .filter((value): value is string => typeof value === "string")
      .map((value) => normalizeText(value));
    return acceptable.includes(normalizedResponse);
  }

  const correct = (question.correct ?? []).filter((value): value is number => typeof value === "number");
  if (correct.length !== selected.length) return false;
  return correct.every((idx) => selected.includes(idx));
}

export function summarizeAttempt({
  quiz,
  selectedByQuestion,
  freeResponseByQuestion,
  selfMarkedByQuestion,
  rubricByQuestion,
  order,
  timeSpentSeconds
}: {
  quiz: QuizSet;
  selectedByQuestion: Record<string, number[]>;
  freeResponseByQuestion?: Record<string, string>;
  selfMarkedByQuestion?: Record<string, boolean | undefined>;
  /** Ticked rubric criteria per written question. */
  rubricByQuestion?: Record<string, number[]>;
  order: string[];
  timeSpentSeconds: number;
}): Attempt {
  const questionsMap = new Map(quiz.questions.map((question) => [question.id, question]));

  const perQuestionResults: PerQuestionResult[] = order
    .map((id) => questionsMap.get(id))
    .filter((q): q is Question => Boolean(q))
    .map((question) => {
      const pointsPossible = questionPoints(question);

      if (question.type === "free") {
        const fraction = writtenFraction(
          question,
          selfMarkedByQuestion?.[question.id],
          rubricByQuestion?.[question.id]
        );
        // Full credit only. Partial credit still counts as missed, so it is
        // offered for review rather than hidden behind a passing grade.
        const isCorrect = fraction === 1;
        return {
          questionId: question.id,
          questionType: question.type,
          isCorrect,
          selected: [],
          correct: [],
          responseText: freeResponseByQuestion?.[question.id]?.trim() ?? "",
          selfMarked: isCorrect,
          pointsEarned: pointsPossible * fraction,
          pointsPossible,
          tags: question.tags
        };
      }

      if (question.type === "fill") {
        const responseText = freeResponseByQuestion?.[question.id]?.trim() ?? "";
        const isCorrect = gradeQuestion(question, [], responseText);
        return {
          questionId: question.id,
          questionType: question.type,
          isCorrect,
          selected: [],
          correct: question.correct ?? [],
          responseText,
          pointsEarned: isCorrect ? pointsPossible : 0,
          pointsPossible,
          tags: question.tags
        };
      }

      const selected = selectedByQuestion[question.id] ?? [];
      const isCorrect = gradeQuestion(question, selected);
      return {
        questionId: question.id,
        questionType: question.type,
        isCorrect,
        selected,
        correct: question.correct ?? [],
        pointsEarned: isCorrect ? pointsPossible : 0,
        pointsPossible,
        tags: question.tags
      };
    });

  const correctCount = perQuestionResults.filter((result) => result.isCorrect).length;
  const totalCount = perQuestionResults.length;
  const score = weightedScore(
    perQuestionResults.map((result) => ({
      points: result.pointsPossible ?? 1,
      fraction: (result.pointsPossible ?? 1) > 0 ? (result.pointsEarned ?? 0) / (result.pointsPossible ?? 1) : 0
    }))
  );

  const topicBreakdown: Attempt["topicBreakdown"] = {};
  perQuestionResults.forEach((result) => {
    result.tags.forEach((tag) => {
      if (!topicBreakdown[tag]) topicBreakdown[tag] = { correct: 0, total: 0 };
      topicBreakdown[tag].total += 1;
      if (result.isCorrect) topicBreakdown[tag].correct += 1;
    });
  });

  return {
    id: uid("attempt"),
    quizId: quiz.id,
    courseId: quiz.courseId,
    mode: quiz.mode ?? "quiz",
    date: new Date().toISOString(),
    score,
    correctCount,
    totalCount,
    timeSpent: timeSpentSeconds,
    perQuestionResults,
    topicBreakdown,
    status: "completed"
  };
}

export function rankScoreTone(score: number) {
  if (score >= 85) return "success" as const;
  if (score >= 60) return "warn" as const;
  return "danger" as const;
}

export function countMissed(result: Attempt) {
  return result.perQuestionResults.filter((entry) => !entry.isCorrect).length;
}

/**
 * Points by part, for a paper that mixes objective questions with written
 * ones. Null when the attempt has only one kind, where a split says nothing.
 */
export function scoreByPart(result: Attempt) {
  const parts = {
    objective: { earned: 0, possible: 0 },
    written: { earned: 0, possible: 0 }
  };
  result.perQuestionResults.forEach((entry) => {
    const part = entry.questionType === "free" ? parts.written : parts.objective;
    const possible = entry.pointsPossible ?? 1;
    part.possible += possible;
    part.earned += entry.pointsEarned ?? (entry.isCorrect ? possible : 0);
  });
  if (parts.objective.possible === 0 || parts.written.possible === 0) return null;
  return parts;
}
