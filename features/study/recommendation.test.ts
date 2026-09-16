import { describe, expect, it } from "vitest";
import type { Attempt, QuizSet } from "@/lib/types";
import { chooseRecommendedSet, recommendationCaption } from "./recommendation";

/**
 * The regression this guards: an unattempted set scores 0, so ranking by
 * "lowest best score" recommended whatever the student had never opened —
 * and once a class had an exam simulation, that was a 50-minute timed exam
 * offered as the way into the subject.
 */

const set = (
  id: string,
  overrides: Partial<QuizSet> = {}
): QuizSet => ({
  id,
  courseId: "database-systems",
  title: id,
  description: "",
  difficulty: "Intermediate",
  estMinutes: 20,
  tags: [],
  timerDefaultMinutes: 20,
  questions: [],
  ...overrides
});

const attempt = (quizId: string, score: number): Attempt => ({
  id: `a-${quizId}-${score}`,
  quizId,
  courseId: "database-systems",
  date: new Date().toISOString(),
  score,
  correctCount: score,
  totalCount: 100,
  timeSpent: 60,
  perQuestionResults: [],
  topicBreakdown: {}
});

const quizA = set("quiz-a", { estMinutes: 28 });
const quizB = set("quiz-b", { estMinutes: 30 });
const exam = set("exam-sim", {
  estMinutes: 50,
  mode: "exam",
  isExamSimulation: true
});
const sets = [quizA, quizB, exam];

describe("choosing the recommended set", () => {
  it("returns nothing when the class has no sets", () => {
    expect(chooseRecommendedSet([], [])).toBeNull();
  });

  it("starts a new learner on the shortest quiz", () => {
    const result = chooseRecommendedSet(sets, []);
    expect(result).toEqual({ set: quizA, reason: "new" });
  });

  it("never offers a timed exam as the way into a class", () => {
    // Every practice set attempted at full marks leaves only the exam untried.
    const attempts = [attempt("quiz-a", 100), attempt("quiz-b", 100)];
    const result = chooseRecommendedSet(sets, attempts);
    expect(result?.set.id).not.toBe("exam-sim");
    expect(result?.reason).toBe("revisit");
  });

  it("does not treat an unattempted set as a zero score", () => {
    // quiz-b scored 80 and the exam has never been opened. Ranking by best
    // score alone would put the exam first at 0.
    const attempts = [attempt("quiz-a", 90), attempt("quiz-b", 80)];
    const result = chooseRecommendedSet(sets, attempts);
    expect(result).toEqual({ set: quizB, reason: "improve" });
  });

  it("picks the weakest set actually attempted", () => {
    const attempts = [attempt("quiz-a", 40), attempt("quiz-b", 80)];
    expect(chooseRecommendedSet(sets, attempts)?.set.id).toBe("quiz-a");
  });

  it("uses the best score, not the latest, so a bad retry does not mislead", () => {
    const attempts = [attempt("quiz-a", 95), attempt("quiz-a", 20), attempt("quiz-b", 60)];
    // quiz-a's best is 95, so quiz-b at 60 is the weaker of the two.
    expect(chooseRecommendedSet(sets, attempts)?.set.id).toBe("quiz-b");
  });

  it("moves on to an untried quiz once the attempted ones are perfect", () => {
    const attempts = [attempt("quiz-a", 100)];
    const result = chooseRecommendedSet(sets, attempts);
    expect(result).toEqual({ set: quizB, reason: "untried" });
  });

  it("falls back to the first set when a class has only an exam", () => {
    const result = chooseRecommendedSet([exam], []);
    expect(result).toEqual({ set: exam, reason: "new" });
  });
});

describe("the caption matches the reason", () => {
  it("only claims a low score when one was actually recorded", () => {
    expect(recommendationCaption("improve")).toMatch(/lowest score so far/i);
    // The other three must not, because there is no score to speak of.
    (["new", "untried", "revisit"] as const).forEach((reason) => {
      expect(recommendationCaption(reason), reason).not.toMatch(/lowest score/i);
    });
  });

  it("says something for every reason", () => {
    (["new", "improve", "untried", "revisit"] as const).forEach((reason) => {
      expect(recommendationCaption(reason).length).toBeGreaterThan(15);
    });
  });
});
