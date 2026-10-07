import { describe, expect, it } from "vitest";
import type { Question, QuizSet } from "@/lib/types";
import { scoreByPart, summarizeAttempt, weightedScore, writtenFraction } from "./engine";

/**
 * Weighted scoring and rubric partial credit.
 *
 * The first test is the one that protects every existing set: with no
 * points anywhere, the score must still be correct over total.
 */

const choice = (id: string, points?: number): Question => ({
  id,
  type: "single",
  prompt: id,
  options: ["right", "wrong"],
  correct: [0],
  explanation: "",
  tags: [],
  ...(points === undefined ? {} : { points })
});

const written = (id: string, points?: number, withRubric = true): Question => ({
  id,
  type: "free",
  prompt: id,
  explanation: "",
  tags: [],
  ...(points === undefined ? {} : { points }),
  ...(withRubric
    ? {
        rubric: [
          { criterion: "a", marks: 4 },
          { criterion: "b", marks: 3 },
          { criterion: "c", marks: 3 }
        ]
      }
    : {})
});

const quizOf = (questions: Question[]): QuizSet => ({
  id: "q",
  courseId: "c",
  title: "q",
  description: "",
  difficulty: "Intermediate",
  estMinutes: 1,
  tags: [],
  timerDefaultMinutes: 1,
  questions
});

const run = (
  questions: Question[],
  answers: {
    right?: string[];
    selfMarked?: Record<string, boolean>;
    rubric?: Record<string, number[]>;
  }
) =>
  summarizeAttempt({
    quiz: quizOf(questions),
    selectedByQuestion: Object.fromEntries(
      questions
        .filter((q) => q.type !== "free")
        .map((q) => [q.id, (answers.right ?? []).includes(q.id) ? [0] : [1]])
    ),
    selfMarkedByQuestion: answers.selfMarked,
    rubricByQuestion: answers.rubric,
    order: questions.map((q) => q.id),
    timeSpentSeconds: 0
  });

describe("unweighted sets score exactly as before", () => {
  it("is correct over total when no question sets points", () => {
    const qs = [choice("a"), choice("b"), choice("c"), choice("d")];
    const result = run(qs, { right: ["a", "b", "c"] });
    expect(result.score).toBe(75);
    expect(result.correctCount).toBe(3);
  });

  it("keeps a written answer without a rubric all-or-nothing", () => {
    const qs = [choice("a"), written("w", undefined, false)];
    expect(run(qs, { right: ["a"], selfMarked: { w: true } }).score).toBe(100);
    expect(run(qs, { right: ["a"], selfMarked: { w: false } }).score).toBe(50);
  });
});

describe("a paper weighted half multiple choice, half written", () => {
  // Ten choice questions at 5 points; three written answers sharing 50.
  const mc = Array.from({ length: 10 }, (_, i) => choice(`mc${i}`, 5));
  const frq = [written("w1", 50 / 3), written("w2", 50 / 3), written("w3", 50 / 3)];
  const paper = [...mc, ...frq];
  const allMc = mc.map((q) => q.id);

  it("scores perfect multiple choice and blank written answers at 50%, not 77%", () => {
    expect(run(paper, { right: allMc }).score).toBe(50);
  });

  it("scores full written marks and no multiple choice at 50%", () => {
    const full = { w1: [0, 1, 2], w2: [0, 1, 2], w3: [0, 1, 2] };
    expect(run(paper, { rubric: full }).score).toBe(50);
  });

  it("gives partial credit from ticked rubric criteria", () => {
    // 7 of 10 marks on one written answer = 0.7 × 50/3 points.
    const result = run(paper, { right: allMc, rubric: { w1: [0, 1] } });
    const expected = Math.round(((50 + 0.7 * (50 / 3)) / 100) * 100);
    expect(result.score).toBe(expected);
    const w1 = result.perQuestionResults.find((r) => r.questionId === "w1")!;
    expect(w1.pointsEarned).toBeCloseTo(0.7 * (50 / 3));
    // Partial credit is still offered for review.
    expect(w1.isCorrect).toBe(false);
  });

  it("splits the score by part", () => {
    const result = run(paper, { right: allMc.slice(0, 8), rubric: { w1: [0, 1, 2] } });
    const parts = scoreByPart(result)!;
    expect(parts.objective).toEqual({ earned: 40, possible: 50 });
    expect(parts.written.earned).toBeCloseTo(50 / 3);
    expect(parts.written.possible).toBeCloseTo(50);
  });

  it("has no part split when a paper has only one kind of question", () => {
    expect(scoreByPart(run(mc, { right: allMc }))).toBeNull();
  });
});

describe("rubric arithmetic", () => {
  const q = written("w", 10);

  it("ignores duplicate and out-of-range ticks", () => {
    expect(writtenFraction(q, undefined, [0, 0, 7, -1])).toBeCloseTo(0.4);
  });

  it("earns nothing for nothing ticked", () => {
    expect(writtenFraction(q, true, [])).toBe(0);
  });

  it("reduces to correct over total at equal weights", () => {
    expect(weightedScore([{ points: 1, fraction: 1 }, { points: 1, fraction: 0 }])).toBe(50);
  });
});
