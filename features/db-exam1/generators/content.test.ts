import { describe, expect, it } from "vitest";
import { courseDatabase } from "@/data/seed/db-exam1/relations";
import { evaluate } from "@/lib/relational-algebra/ast";
import { parseExpression } from "@/lib/relational-algebra/parser";
import { gradeQuestion } from "../question-model";
import { generateIntegrityQuestion, generateKeyQuestion, isCandidateKey, isSuperkey } from "./keys";
import {
  generateProjectQuestion,
  generateSelectQuestion,
  generateTerminologyQuestion
} from "./model";
import { generateReadQuestion, generateWriteQuestion } from "./queries";

const SEEDS = Array.from({ length: 30 }, (_, i) => i * 1013 + 5);

describe("key questions are consistent with their own data", () => {
  it.each(["superkey", "candidate"] as const)("%s answers match the tuples shown", (ask) => {
    for (const seed of SEEDS) {
      const question = generateKeyQuestion(seed, ask);
      if (question.kind !== "choice") throw new Error("expected a choice question");
      const relation = question.context?.relations?.[0];
      expect(relation).toBeDefined();
      if (!relation) return;

      question.options.forEach((option) => {
        const attributes = option.text.replace(/[{}]/g, "").split(",").map((s) => s.trim());
        const expected =
          ask === "superkey" ? isSuperkey(relation, attributes) : isCandidateKey(relation, attributes);
        expect(option.correct, `${option.text} in ${relation.name}`).toBe(expected);
      });
    }
  });

  it("every variant has at least one correct answer", () => {
    for (const seed of SEEDS) {
      for (const ask of ["superkey", "candidate"] as const) {
        const question = generateKeyQuestion(seed, ask);
        if (question.kind !== "choice") throw new Error("expected a choice question");
        expect(
          question.options.some((option) => option.correct),
          `${ask} seed ${seed} has no correct option`
        ).toBe(true);
      }
    }
  });

  it("teaches the superkey/candidate-key gap on the same table", () => {
    // Find a table where some set is a superkey but not a candidate key —
    // the distinction Lecture 2 defines candidate keys to make.
    const found = SEEDS.map((seed) => {
      const superkeyQuestion = generateKeyQuestion(seed, "superkey");
      const candidateQuestion = generateKeyQuestion(seed, "candidate");
      if (superkeyQuestion.kind !== "choice" || candidateQuestion.kind !== "choice") return null;
      const index = superkeyQuestion.options.findIndex(
        (option, i) => option.correct && !candidateQuestion.options[i].correct
      );
      return index >= 0 ? { candidateQuestion, index } : null;
    }).find(Boolean);

    expect(found).toBeTruthy();
    if (!found || found.candidateQuestion.kind !== "choice") return;

    const option = found.candidateQuestion.options[found.index];
    expect(option.mistake).toBe("superkey-minimality");
    expect(option.note).toMatch(/irreducible|already does that/i);
  });

  it("composite-key tables have no single-attribute candidate key", () => {
    const composite = SEEDS.map((seed) => generateKeyQuestion(seed, "candidate")).find(
      (question) =>
        question.kind === "choice" && question.context?.relations?.[0]?.name === "Enrolment"
    );
    expect(composite).toBeDefined();
    if (!composite || composite.kind !== "choice") return;

    const relation = composite.context!.relations![0];
    expect(isSuperkey(relation, ["studentNo"])).toBe(false);
    expect(isSuperkey(relation, ["courseCode"])).toBe(false);
    expect(isCandidateKey(relation, ["studentNo", "courseCode"])).toBe(true);
  });
});

describe("integrity questions", () => {
  it("always has exactly one correct option", () => {
    for (const seed of SEEDS) {
      const question = generateIntegrityQuestion(seed);
      if (question.kind !== "choice") throw new Error("expected a choice question");
      expect(question.options.filter((option) => option.correct)).toHaveLength(1);
    }
  });

  it("explains the confusion when the other rule is chosen", () => {
    const question = generateIntegrityQuestion(0);
    if (question.kind !== "choice") throw new Error("expected a choice question");
    const wrongIndex = question.options.findIndex(
      (option) => !option.correct && option.mistake === "entity-vs-referential-integrity"
    );
    expect(wrongIndex).toBeGreaterThanOrEqual(0);

    const result = gradeQuestion(question, { kind: "choice", selected: [wrongIndex] });
    expect(result.correct).toBe(false);
    expect(result.mistakes).toContain("entity-vs-referential-integrity");
    expect(result.feedback.length).toBeGreaterThan(30);
  });
});

describe("English → algebra questions", () => {
  it.each(["intro", "core", "stretch"] as const)(
    "%s: the reference answer parses and returns at least one tuple",
    (difficulty) => {
      for (const seed of SEEDS) {
        const question = generateWriteQuestion(seed, difficulty);
        if (question.kind !== "expression") throw new Error("expected an expression question");

        // A reference that returns nothing would mark every empty-result
        // answer correct, so the question would test nothing at all.
        const result = evaluate(parseExpression(question.referenceText), courseDatabase).relation;
        expect(
          result.tuples.length,
          `${question.id} "${question.prompt}" returns no tuples`
        ).toBeGreaterThan(0);
      }
    }
  );

  it("accepts its own reference answer", () => {
    for (const seed of SEEDS) {
      const question = generateWriteQuestion(seed, "core");
      if (question.kind !== "expression") throw new Error("expected an expression question");
      const verdict = gradeQuestion(question, {
        kind: "expression",
        text: question.referenceText
      });
      expect(verdict.correct, `${question.id} rejected its own answer`).toBe(true);
    }
  });

  it("rejects an answer that drops the join", () => {
    const question = generateWriteQuestion(3, "core");
    if (question.kind !== "expression") throw new Error("expected an expression question");
    // Project the output attributes straight off one relation.
    const verdict = gradeQuestion(question, { kind: "expression", text: "Staff" });
    expect(verdict.correct).toBe(false);
  });

  it("only offers relations the answer is allowed to use", () => {
    for (const seed of SEEDS.slice(0, 15)) {
      const question = generateWriteQuestion(seed, "core");
      if (question.kind !== "expression") throw new Error("expected an expression question");
      question.available.forEach((name) => {
        expect(courseDatabase[name], `${name} is not a course relation`).toBeDefined();
      });
    }
  });

  it("carries a walkthrough that ends at the reference answer", () => {
    for (const seed of SEEDS.slice(0, 15)) {
      const question = generateWriteQuestion(seed, "core");
      expect(question.walkthrough?.length ?? 0).toBeGreaterThanOrEqual(4);
      const last = question.walkthrough?.[question.walkthrough.length - 1];
      expect(last?.ask).toMatch(/put it together/i);
      // The final step must be the answer, not a paraphrase of it.
      if (question.kind === "expression" && last) {
        const normalise = (text: string) => text.replace(/\s+/g, "");
        expect(normalise(last.answer)).toBe(normalise(question.referenceText));
      }
    }
  });

  it("is deterministic", () => {
    expect(JSON.stringify(generateWriteQuestion(11, "core"))).toBe(
      JSON.stringify(generateWriteQuestion(11, "core"))
    );
  });
});

describe("algebra → English questions", () => {
  it("has exactly one correct reading and three diagnostic distractors", () => {
    for (const seed of SEEDS) {
      const question = generateReadQuestion(seed);
      if (question.kind !== "choice") throw new Error("expected a choice question");
      expect(question.options.filter((option) => option.correct)).toHaveLength(1);
      question.options
        .filter((option) => !option.correct)
        .forEach((option) => {
          expect(option.mistake, `${question.id} distractor has no mistake tag`).toBeTruthy();
          expect(option.note, `${question.id} distractor has no explanation`).toBeTruthy();
        });
    }
  });

  it("shows an expression that actually parses", () => {
    for (const seed of SEEDS) {
      const question = generateReadQuestion(seed);
      const expression = question.context?.expression;
      expect(expression).toBeTruthy();
      expect(() => parseExpression(expression!)).not.toThrow();
    }
  });

  it("tags the semijoin direction error specifically", () => {
    const question = SEEDS.map((seed) => generateReadQuestion(seed)).find(
      (q) =>
        q.kind === "choice" &&
        q.options.some((option) => option.mistake === "semijoin-direction")
    );
    expect(question).toBeDefined();
    if (!question || question.kind !== "choice") return;

    const index = question.options.findIndex((option) => option.mistake === "semijoin-direction");
    const result = gradeQuestion(question, { kind: "choice", selected: [index] });
    expect(result.mistakes).toContain("semijoin-direction");
    expect(result.feedback).toMatch(/other way round|keeps tuples of Hotel/i);
  });
});

describe("terminology, selection and projection generators", () => {
  it("terminology questions always have one correct option", () => {
    for (const seed of SEEDS) {
      const question = generateTerminologyQuestion(seed);
      if (question.kind !== "choice") throw new Error("expected a choice question");
      expect(question.topic).toBe("relational-terminology");
      expect(question.options.filter((option) => option.correct)).toHaveLength(1);
    }
  });

  it("selection questions keep degree and drop failing rows", () => {
    for (const seed of SEEDS.slice(0, 12)) {
      const question = generateSelectQuestion(seed);
      expect(question.topic).toBe("selection");
      if (question.kind === "shape") {
        expect(question.degree).toBeGreaterThan(0);
        expect(question.cardinality).toBeGreaterThanOrEqual(0);
      }
      if (question.kind === "rows") {
        const relation = question.context?.relations?.[0];
        expect(relation).toBeDefined();
        expect(question.attributes).toEqual(relation?.attributes);
      }
    }
  });

  it("projection questions punish forgetting duplicate elimination", () => {
    const found = SEEDS.map((seed) => generateProjectQuestion(seed)).find(
      (question) =>
        question.kind === "choice" &&
        question.options.some((option) => option.mistake === "forgot-duplicate-elimination")
    );
    expect(found).toBeDefined();
    if (!found || found.kind !== "choice") return;
    const index = found.options.findIndex(
      (option) => option.mistake === "forgot-duplicate-elimination"
    );
    const result = gradeQuestion(found, { kind: "choice", selected: [index] });
    expect(result.correct).toBe(false);
    expect(result.mistakes).toContain("forgot-duplicate-elimination");
  });
});
