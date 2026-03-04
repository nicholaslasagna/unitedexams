import type { QuizSet, StudySetMode } from "@/lib/types";

function hasTag(set: QuizSet, value: string) {
  const needle = value.toLowerCase();
  return set.tags.some((tag) => tag.toLowerCase().includes(needle));
}

export function resolveQuizSetMode(set: QuizSet): StudySetMode {
  if (set.mode === "quiz" || set.mode === "exam" || set.mode === "homework") {
    return set.mode;
  }

  const id = set.id.toLowerCase();
  if (id.includes("hw") || hasTag(set, "homework") || hasTag(set, "step-by-step")) {
    return "homework";
  }
  if (
    id.includes("exam") ||
    hasTag(set, "exam") ||
    hasTag(set, "test-review") ||
    hasTag(set, "midterm") ||
    set.isExamSimulation
  ) {
    return "exam";
  }
  return "quiz";
}

export function resolveQuestionCountTarget(set: QuizSet): number | null {
  if (typeof set.questionCountTarget === "number" && set.questionCountTarget > 0) {
    return set.questionCountTarget;
  }
  if (resolveQuizSetMode(set) === "exam") {
    return 42;
  }
  return null;
}

export function modeLabel(mode: StudySetMode) {
  if (mode === "exam") return "Exam";
  if (mode === "homework") return "Homework";
  return "Quiz";
}
