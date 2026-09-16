import { describe, expect, it } from "vitest";
import { evaluate } from "@/lib/relational-algebra/ast";
import { parseExpression } from "@/lib/relational-algebra/parser";
import { gradeQuestion } from "@/features/db-exam1/question-model";
import { TOPIC_IDS } from "@/features/db-exam1/topics";
import { courseDatabase } from "./relations";
import { SOURCE_QUESTIONS } from "./source-questions";

/**
 * Hand-authored content is where wrong answers get in. Everything here is
 * checked against the evaluator, and the Homework #1 answers are checked
 * against the counts computed by hand for the assignment.
 */

describe("source question bank", () => {
  it("has unique ids", () => {
    const ids = SOURCE_QUESTIONS.map((question) => question.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("tags every question with a real topic", () => {
    SOURCE_QUESTIONS.forEach((question) => {
      expect(TOPIC_IDS, `${question.id}`).toContain(question.topic);
    });
  });

  it("explains every question", () => {
    SOURCE_QUESTIONS.forEach((question) => {
      expect(question.explanation.length, `${question.id} has a thin explanation`).toBeGreaterThan(40);
    });
  });

  it("never claims course provenance for a question that was written here", () => {
    /*
     * The badge a learner sees is driven by `source`. Labelling an authored
     * question as course material would tell them the professor set it, so
     * anything claiming professor or study-guide provenance has to cite a
     * real lecture, assignment or sheet — and must not describe itself as
     * merely being in that style.
     */
    SOURCE_QUESTIONS.filter(
      (question) => question.source === "professor" || question.source === "study-guide"
    ).forEach((question) => {
      expect(question.sourceNote, `${question.id} claims course provenance with no citation`).toBeTruthy();
      expect(
        question.sourceNote,
        `${question.id} is labelled course material but describes itself as a style imitation`
      ).not.toMatch(/style|modelled on|generated|variant/i);
    });
  });

  it("says where every question came from", () => {
    // The bank is overwhelmingly course material, but it may hold an authored
    // question too — what matters is that each one says which it is.
    SOURCE_QUESTIONS.forEach((question) => {
      expect(question.sourceNote, `${question.id} has no citation`).toBeTruthy();
    });
    const courseMaterial = SOURCE_QUESTIONS.filter(
      (question) => question.source === "professor" || question.source === "study-guide"
    );
    expect(courseMaterial.length / SOURCE_QUESTIONS.length).toBeGreaterThan(0.9);
  });

  it("gives every choice question at least one correct option", () => {
    SOURCE_QUESTIONS.filter((question) => question.kind === "choice").forEach((question) => {
      if (question.kind !== "choice") return;
      expect(
        question.options.some((option) => option.correct),
        `${question.id} has no correct option`
      ).toBe(true);
    });
  });

  it("explains every wrong option", () => {
    SOURCE_QUESTIONS.filter((question) => question.kind === "choice").forEach((question) => {
      if (question.kind !== "choice") return;
      question.options
        .filter((option) => !option.correct)
        .forEach((option) => {
          expect(
            option.note ?? option.mistake,
            `${question.id}: "${option.text}" has no explanation or mistake tag`
          ).toBeTruthy();
        });
    });
  });
});

describe("expression questions accept their own answers", () => {
  const expressionQuestions = SOURCE_QUESTIONS.filter(
    (question) => question.kind === "expression"
  );

  it("has some", () => {
    expect(expressionQuestions.length).toBeGreaterThanOrEqual(5);
  });

  it.each(expressionQuestions.map((question) => [question.id, question] as const))(
    "%s",
    (_id, question) => {
      if (question.kind !== "expression") return;
      // The reference must parse, return tuples, and be graded correct.
      const result = evaluate(parseExpression(question.referenceText), courseDatabase).relation;
      expect(result.tuples.length, "reference returns no tuples").toBeGreaterThan(0);

      const verdict = gradeQuestion(question, {
        kind: "expression",
        text: question.referenceText
      });
      expect(verdict.correct, verdict.feedback).toBe(true);
    }
  );

  it("ends every walkthrough at the reference answer", () => {
    expressionQuestions.forEach((question) => {
      if (question.kind !== "expression") return;
      const steps = question.walkthrough;
      expect(steps, `${question.id} has no walkthrough`).toBeTruthy();
      if (!steps) return;
      const last = steps[steps.length - 1];
      const normalise = (text: string) => text.replace(/\s+/g, "");
      expect(normalise(last.answer), `${question.id} walkthrough ends elsewhere`).toBe(
        normalise(question.referenceText)
      );
    });
  });

  it("accepts a semijoin for Question 3(c), which returns only Branch attributes", () => {
    const question = SOURCE_QUESTIONS.find((q) => q.id === "hw1-q3c");
    expect(question).toBeDefined();
    if (!question || question.kind !== "expression") return;

    const verdict = gradeQuestion(question, {
      kind: "expression",
      text: "Branch ▷_{Branch.branchNo = Staff.branchNo} (σ_{position = 'Manager'}(Staff))"
    });
    expect(verdict.correct, verdict.feedback).toBe(true);
  });
});

describe("Homework #1 Question 1 matches the hand-computed answers", () => {
  const counts: Record<string, number> = {
    "hw1-q1a": 8, // equijoin
    "hw1-q1b": 8, // natural join — same rows, one fewer column
    "hw1-q1c": 9, // left outer: + R105
    "hw1-q1d": 9, // right outer: + S204
    "hw1-q1e": 10, // full outer: + both
    "hw1-q1f": 5 // semijoin: five of R's six tuples qualify
  };

  it.each(Object.entries(counts))("%s has %i tuples in the result", (id, expected) => {
    const question = SOURCE_QUESTIONS.find((q) => q.id === id);
    expect(question).toBeDefined();
    if (!question || question.kind !== "rows") return;
    expect(question.candidates.filter((candidate) => candidate.inResult)).toHaveLength(expected);
  });

  it("gives the equijoin degree 8 and the natural join degree 7", () => {
    const equi = SOURCE_QUESTIONS.find((q) => q.id === "hw1-q1a");
    const natural = SOURCE_QUESTIONS.find((q) => q.id === "hw1-q1b");
    if (equi?.kind !== "rows" || natural?.kind !== "rows") throw new Error("missing question");
    expect(equi.attributes).toHaveLength(8);
    expect(natural.attributes).toHaveLength(7);
    // The collapsed column is j, and only j.
    expect(equi.attributes).toContain("R.j");
    expect(equi.attributes).toContain("S.j");
    expect(natural.attributes).toContain("j");
    expect(natural.attributes).not.toContain("R.j");
  });

  it("returns only R's attributes from the semijoin", () => {
    const semi = SOURCE_QUESTIONS.find((q) => q.id === "hw1-q1f");
    if (semi?.kind !== "rows") throw new Error("missing question");
    expect(semi.attributes).toEqual(["r_id", "j", "r2", "r3"]);
  });

  it("answers the division question with A alone", () => {
    const division = SOURCE_QUESTIONS.find((q) => q.id === "hw1-q1g");
    if (division?.kind !== "choice") throw new Error("missing question");
    const correct = division.options.filter((option) => option.correct).map((o) => o.text);
    expect(correct).toEqual(["A"]);
  });

  it("marks a fully correct row selection correct", () => {
    SOURCE_QUESTIONS.filter((question) => question.kind === "rows").forEach((question) => {
      if (question.kind !== "rows") return;
      const selected = question.candidates
        .map((candidate, index) => (candidate.inResult ? index : -1))
        .filter((index) => index >= 0);
      expect(gradeQuestion(question, { kind: "rows", selected }).correct, question.id).toBe(true);
    });
  });

  it("every distractor row has the same width as the result", () => {
    SOURCE_QUESTIONS.filter((question) => question.kind === "rows").forEach((question) => {
      if (question.kind !== "rows") return;
      question.candidates.forEach((candidate) => {
        expect(candidate.values.length, `${question.id} ragged row`).toBe(
          question.attributes.length
        );
      });
    });
  });
});
