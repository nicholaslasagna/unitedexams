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
  order,
  timeSpentSeconds
}: {
  quiz: QuizSet;
  selectedByQuestion: Record<string, number[]>;
  freeResponseByQuestion?: Record<string, string>;
  selfMarkedByQuestion?: Record<string, boolean | undefined>;
  order: string[];
  timeSpentSeconds: number;
}): Attempt {
  const questionsMap = new Map(quiz.questions.map((question) => [question.id, question]));

  const perQuestionResults: PerQuestionResult[] = order
    .map((id) => questionsMap.get(id))
    .filter((q): q is Question => Boolean(q))
    .map((question) => {
      if (question.type === "free") {
        const selfMarked = Boolean(selfMarkedByQuestion?.[question.id]);
        return {
          questionId: question.id,
          questionType: question.type,
          isCorrect: selfMarked,
          selected: [],
          correct: [],
          responseText: freeResponseByQuestion?.[question.id]?.trim() ?? "",
          selfMarked,
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
        tags: question.tags
      };
    });

  const correctCount = perQuestionResults.filter((result) => result.isCorrect).length;
  const totalCount = perQuestionResults.length;
  const score = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

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
