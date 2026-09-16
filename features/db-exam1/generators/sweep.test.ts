import { describe, expect, it } from "vitest";
import { courseDatabase } from "@/data/seed/db-exam1/relations";
import { evaluate } from "@/lib/relational-algebra/ast";
import { parseExpression } from "@/lib/relational-algebra/parser";
import { buildMockExam, buildPracticeSet } from "../practice";
import {
  emptyAnswer,
  gradeQuestion,
  type LabAnswer,
  type LabQuestion
} from "../question-model";
import { TOPICS } from "../topics";

/**
 * A breadth sweep over generated content.
 *
 * The narrower generator tests check that each kind produces the right
 * answer. This one checks the thing a learner notices first: that no
 * question is malformed — a blank prompt, a table with a ragged row, a
 * multiple-choice with nothing correct, an expression whose own answer does
 * not parse. Those are cheap to produce by accident and expensive to meet
 * while revising, so they are checked across every topic and many seeds
 * rather than on one example each.
 */

const SEEDS = Array.from({ length: 25 }, (_, i) => i * 4441 + 17);

/** Everything that must hold for any question, whatever its kind. */
function assertWellFormed(question: LabQuestion, where: string) {
  expect(question.id, `${where}: missing id`).toBeTruthy();
  expect(question.prompt.trim().length, `${where}: thin prompt`).toBeGreaterThan(10);
  expect(question.explanation.trim().length, `${where}: thin explanation`).toBeGreaterThan(30);
  expect(["intro", "core", "stretch"], `${where}: bad difficulty`).toContain(question.difficulty);

  // Grading an untouched question must never throw, whatever the kind.
  expect(() => gradeQuestion(question, emptyAnswer(question)), `${where}: grading threw`).not.toThrow();

  switch (question.kind) {
    case "choice": {
      expect(question.options.length, `${where}: too few options`).toBeGreaterThanOrEqual(2);
      expect(
        question.options.some((option) => option.correct),
        `${where}: no correct option`
      ).toBe(true);
      question.options.forEach((option) => {
        expect(option.text.trim().length, `${where}: empty option`).toBeGreaterThan(0);
      });
      // A single-answer question must not have two right answers.
      if (!question.multiple) {
        expect(
          question.options.filter((option) => option.correct).length,
          `${where}: single-answer question has multiple correct options`
        ).toBe(1);
      }
      break;
    }
    case "rows": {
      expect(question.attributes.length, `${where}: no columns`).toBeGreaterThan(0);
      expect(question.candidates.length, `${where}: no candidates`).toBeGreaterThan(0);
      question.candidates.forEach((candidate, index) => {
        expect(
          candidate.values.length,
          `${where}: candidate ${index} has ${candidate.values.length} cells for ${question.attributes.length} columns`
        ).toBe(question.attributes.length);
      });
      break;
    }
    case "shape": {
      expect(question.degree, `${where}: degree`).toBeGreaterThanOrEqual(0);
      expect(question.cardinality, `${where}: cardinality`).toBeGreaterThanOrEqual(0);
      expect(question.subject.trim().length, `${where}: no subject`).toBeGreaterThan(0);
      break;
    }
    case "expression": {
      // The reference must parse, evaluate, return tuples, and be accepted.
      const expr = parseExpression(question.referenceText);
      const result = evaluate(expr, courseDatabase).relation;
      expect(result.tuples.length, `${where}: reference returns nothing`).toBeGreaterThan(0);
      const verdict = gradeQuestion(question, {
        kind: "expression",
        text: question.referenceText
      });
      expect(verdict.correct, `${where}: rejects its own answer — ${verdict.feedback}`).toBe(true);
      question.available.forEach((name) => {
        expect(courseDatabase[name], `${where}: offers unknown relation ${name}`).toBeDefined();
      });
      break;
    }
  }
}

describe("every topic produces well-formed questions across many seeds", () => {
  it.each(TOPICS.map((topic) => [topic.id, topic.label] as const))(
    "%s",
    (topicId) => {
      for (const seed of SEEDS) {
        const set = buildPracticeSet({
          attempts: [],
          topic: topicId,
          count: 4,
          seed,
          difficulty: "core"
        });
        expect(set.length, `${topicId} seed ${seed} produced ${set.length}`).toBe(4);
        set.forEach((question, index) =>
          assertWellFormed(question, `${topicId} seed ${seed} #${index}`)
        );
      }
    }
  );

  it.each(["intro", "core", "stretch"] as const)(
    "%s difficulty is well formed for every topic",
    (difficulty) => {
      TOPICS.forEach((topic) => {
        const set = buildPracticeSet({
          attempts: [],
          topic: topic.id,
          count: 3,
          seed: 909,
          difficulty
        });
        set.forEach((question, index) =>
          assertWellFormed(question, `${topic.id}/${difficulty} #${index}`)
        );
      });
    }
  );
});

describe("mock exams are well formed across sittings", () => {
  it.each(SEEDS.slice(0, 10))("seed %i", (seed) => {
    const exam = buildMockExam(seed);
    expect(new Set(exam.map((question) => question.id)).size, "duplicate question").toBe(
      exam.length
    );
    exam.forEach((question, index) => assertWellFormed(question, `exam ${seed} #${index}`));
  });

  it("can be answered end to end without throwing", () => {
    const exam = buildMockExam(3);
    exam.forEach((question) => {
      // Answer everything the way a learner in a hurry would: first option,
      // first row, a plausible expression.
      const answer: LabAnswer =
        question.kind === "choice"
          ? { kind: "choice", selected: [0] }
          : question.kind === "rows"
            ? { kind: "rows", selected: [0] }
            : question.kind === "shape"
              ? { kind: "shape", degree: 4, cardinality: 6 }
              : { kind: "expression", text: "Staff" };
      const graded = gradeQuestion(question, answer);
      expect(typeof graded.correct).toBe("boolean");
      expect(graded.feedback.length, `${question.id} gave no feedback`).toBeGreaterThan(0);
    });
  });
});
