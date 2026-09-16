import { describe, expect, it } from "vitest";
import { STUDY_GUIDE_QUESTIONS } from "@/data/seed/db-exam1/study-guide-questions";
import { gradeQuestion } from "./question-model";

/**
 * What a wrong answer is told it did wrong.
 *
 * The diagnosis used to fall back to "missing-condition" whenever the
 * structural comparison found nothing it recognised. On a pure projection
 * that produced a confident lie: a student who joined the wrong relation was
 * told they had dropped a condition, and handed a correction about putting
 * two conditions inside one σ, on a question containing no conditions at all.
 *
 * An honest "something else" is worth more than a specific wrong answer.
 */

const byId = (id: string) => {
  const q = STUDY_GUIDE_QUESTIONS.find((entry) => entry.id === id);
  if (!q) throw new Error(`no question ${id}`);
  return q;
};

describe("diagnosing a wrong expression", () => {
  it("does not claim a dropped condition on a question that has no conditions", () => {
    const question = byId("sg-cpa-3c");
    expect(question.kind).toBe("expression");
    // The real answer a student gave: reach for a city by joining Hotel.
    const result = gradeQuestion(question, {
      kind: "expression",
      text: "Π_{guestName}(Guest) ⋈ Π_{city}(Hotel)"
    });

    expect(result.correct).toBe(false);
    expect(result.mistakes).not.toContain("missing-condition");
  });

  it("says so plainly when it cannot classify the mistake", () => {
    const result = gradeQuestion(byId("sg-cpa-3c"), {
      kind: "expression",
      text: "Π_{guestName}(Guest) ⋈ Π_{city}(Hotel)"
    });
    expect(result.mistakes.length).toBeGreaterThan(0);
    expect(result.correct).toBe(false);
  });

  it("still names the mistake when the structure does reveal one", () => {
    // Dropping the join on a question that needs one is recognisable, and
    // must keep being reported as missing-join rather than as "something else".
    const question = byId("sg-cpa-3d");
    const result = gradeQuestion(question, {
      kind: "expression",
      text: "Π_{price, type}(Room)"
    });
    expect(result.correct).toBe(false);
    expect(result.mistakes).toContain("missing-join");
  });

  it("accepts the reference answer for every study-guide expression question", () => {
    // Guards the whole set: a question whose own stated answer is graded
    // wrong is worse than no question.
    const expressionQuestions = STUDY_GUIDE_QUESTIONS.filter((q) => q.kind === "expression");
    expect(expressionQuestions.length).toBeGreaterThan(0);
    expressionQuestions.forEach((q) => {
      if (q.kind !== "expression") return;
      const result = gradeQuestion(q, { kind: "expression", text: q.referenceText });
      expect(result.correct, `${q.id} rejects its own reference answer`).toBe(true);
    });
  });
});
