import { describe, expect, it } from "vitest";
import { tupleKey } from "@/lib/relational-algebra/relation";
import { gradeQuestion } from "../question-model";
import {
  JOIN_SPECS,
  evaluateVariant,
  generateDivisionQuestion,
  generateJoinPair,
  generateJoinResultQuestion,
  generateShapeQuestion,
  type JoinVariant
} from "./joins";

/**
 * A generated question that disagrees with the evaluator would teach a wrong
 * answer with complete confidence, so these tests check agreement across a
 * spread of seeds rather than one lucky example.
 */

const SEEDS = Array.from({ length: 40 }, (_, i) => i * 7919 + 13);
const VARIANTS: JoinVariant[] = [
  "equijoin",
  "natural",
  "left-outer",
  "right-outer",
  "semijoin",
  "full-outer"
];

describe("generated join pairs match the homework's requirements", () => {
  it.each(Object.keys(JOIN_SPECS) as (keyof typeof JOIN_SPECS)[])(
    "%s difficulty has matching, left-only and right-only j values",
    (difficulty) => {
      const spec = JOIN_SPECS[difficulty];
      for (const seed of SEEDS) {
        const pair = generateJoinPair(seed, spec);
        const leftJ = new Set(pair.left.tuples.map((t) => String(t[1])));
        const rightJ = new Set(pair.right.tuples.map((t) => String(t[1])));

        // Homework #1 Q1: at least two matching, at least one of each only.
        const matching = [...leftJ].filter((j) => rightJ.has(j));
        expect(matching.sort()).toEqual([...pair.matchingValues].sort());
        expect(matching.length).toBeGreaterThanOrEqual(2);
        expect([...leftJ].filter((j) => !rightJ.has(j)).length).toBeGreaterThanOrEqual(1);
        expect([...rightJ].filter((j) => !leftJ.has(j)).length).toBeGreaterThanOrEqual(1);

        // 5–8 tuples per relation, as the assignment asks.
        expect(pair.left.tuples.length).toBeGreaterThanOrEqual(3);
        expect(pair.left.tuples.length).toBeLessThanOrEqual(8);
        expect(pair.right.tuples.length).toBeLessThanOrEqual(8);

        // Ids must be unique, or the relation is not a set.
        const ids = pair.left.tuples.map((t) => t[0]);
        expect(new Set(ids).size).toBe(ids.length);
      }
    }
  );

  it("is deterministic — the same seed rebuilds the same tables", () => {
    const a = generateJoinPair(4242, JOIN_SPECS.core);
    const b = generateJoinPair(4242, JOIN_SPECS.core);
    expect(a.left.tuples).toEqual(b.left.tuples);
    expect(a.right.tuples).toEqual(b.right.tuples);
  });

  it("produces different tables for different seeds", () => {
    const a = generateJoinPair(1, JOIN_SPECS.core);
    const b = generateJoinPair(2, JOIN_SPECS.core);
    expect(JSON.stringify(a.left.tuples)).not.toBe(JSON.stringify(b.left.tuples));
  });
});

describe("generated result questions agree with the evaluator", () => {
  it.each(VARIANTS)("%s: correct candidates are exactly the result relation", (variant) => {
    for (const seed of SEEDS) {
      const question = generateJoinResultQuestion(seed, variant);
      if (question.kind !== "rows") throw new Error("expected a rows question");

      const pair = generateJoinPair(seed, JOIN_SPECS.core);
      const expected = evaluateVariant(pair, variant);

      const marked = question.candidates
        .filter((candidate) => candidate.inResult)
        .map((candidate) => tupleKey(candidate.values))
        .sort();
      const actual = expected.tuples.map(tupleKey).sort();

      expect(marked).toEqual(actual);
      expect(question.attributes).toEqual(expected.attributes);
    }
  });

  it.each(VARIANTS)("%s: no distractor is secretly a correct row", (variant) => {
    for (const seed of SEEDS) {
      const question = generateJoinResultQuestion(seed, variant);
      if (question.kind !== "rows") throw new Error("expected a rows question");

      const pair = generateJoinPair(seed, JOIN_SPECS.core);
      const correctKeys = new Set(evaluateVariant(pair, variant).tuples.map(tupleKey));

      question.candidates
        .filter((candidate) => !candidate.inResult)
        .forEach((candidate) => {
          expect(
            correctKeys.has(tupleKey(candidate.values)),
            `distractor ${JSON.stringify(candidate.values)} is in the ${variant} result`
          ).toBe(false);
        });
    }
  });

  it.each(VARIANTS)("%s: every candidate row has the result's width", (variant) => {
    for (const seed of SEEDS.slice(0, 12)) {
      const question = generateJoinResultQuestion(seed, variant);
      if (question.kind !== "rows") throw new Error("expected a rows question");
      question.candidates.forEach((candidate) => {
        expect(candidate.values).toHaveLength(question.attributes.length);
      });
    }
  });

  it("marks a fully correct selection correct and a partial one wrong", () => {
    const question = generateJoinResultQuestion(99, "left-outer");
    if (question.kind !== "rows") throw new Error("expected a rows question");

    const allCorrect = question.candidates
      .map((candidate, index) => (candidate.inResult ? index : -1))
      .filter((index) => index >= 0);

    expect(gradeQuestion(question, { kind: "rows", selected: allCorrect }).correct).toBe(true);
    expect(
      gradeQuestion(question, { kind: "rows", selected: allCorrect.slice(1) }).correct
    ).toBe(false);
  });

  it("names the misconception when a NULL-padded row is picked in an equijoin", () => {
    // Find a seed whose equijoin question offers the padded distractor.
    const question = SEEDS.map((seed) => generateJoinResultQuestion(seed, "equijoin"))
      .filter((q) => q.kind === "rows")
      .find((q) =>
        q.kind === "rows" &&
        q.candidates.some((c) => !c.inResult && c.mistake === "inner-join-pads-unmatched")
      );
    expect(question).toBeDefined();
    if (!question || question.kind !== "rows") return;

    const paddedIndex = question.candidates.findIndex(
      (candidate) => candidate.mistake === "inner-join-pads-unmatched"
    );
    const correct = question.candidates
      .map((candidate, index) => (candidate.inResult ? index : -1))
      .filter((index) => index >= 0);

    const result = gradeQuestion(question, {
      kind: "rows",
      selected: [...correct, paddedIndex]
    });
    expect(result.correct).toBe(false);
    expect(result.mistakes).toContain("inner-join-pads-unmatched");
  });

  it("semijoin questions never mark an S tuple as correct", () => {
    for (const seed of SEEDS.slice(0, 20)) {
      const question = generateJoinResultQuestion(seed, "semijoin");
      if (question.kind !== "rows") throw new Error("expected a rows question");
      expect(question.attributes).toEqual(["r_id", "j", "r2", "r3"]);
      question.candidates
        .filter((candidate) => candidate.inResult)
        .forEach((candidate) => {
          expect(String(candidate.values[0]).startsWith("R")).toBe(true);
        });
    }
  });
});

describe("shape questions", () => {
  it("gets the Cartesian product arithmetic right", () => {
    for (const seed of SEEDS.slice(0, 20)) {
      const question = generateShapeQuestion(seed, "product");
      if (question.kind !== "shape") throw new Error("expected a shape question");
      const pair = generateJoinPair(seed, JOIN_SPECS.core);

      expect(question.degree).toBe(pair.left.attributes.length + pair.right.attributes.length);
      expect(question.cardinality).toBe(pair.left.tuples.length * pair.right.tuples.length);
    }
  });

  it.each(VARIANTS)("%s shape matches the evaluated relation", (variant) => {
    for (const seed of SEEDS.slice(0, 20)) {
      const question = generateShapeQuestion(seed, variant);
      if (question.kind !== "shape") throw new Error("expected a shape question");
      const expected = evaluateVariant(generateJoinPair(seed, JOIN_SPECS.core), variant);
      expect(question.degree).toBe(expected.attributes.length);
      expect(question.cardinality).toBe(expected.tuples.length);
    }
  });

  it("detects the swap specifically", () => {
    const question = generateShapeQuestion(7, "product");
    if (question.kind !== "shape") throw new Error("expected a shape question");
    const result = gradeQuestion(question, {
      kind: "shape",
      degree: question.cardinality,
      cardinality: question.degree
    });
    expect(result.correct).toBe(false);
    expect(result.mistakes).toContain("degree-cardinality-swapped");
    expect(result.feedback).toMatch(/wrong way round/i);
  });
});

describe("division questions", () => {
  it("only marks values covering every divisor tuple", () => {
    for (const seed of SEEDS.slice(0, 25)) {
      const question = generateDivisionQuestion(seed);
      if (question.kind !== "choice") throw new Error("expected a choice question");

      const dividend = question.context?.relations?.[0];
      const divisor = question.context?.relations?.[1];
      expect(dividend).toBeDefined();
      expect(divisor).toBeDefined();
      if (!dividend || !divisor) return;

      const required = new Set(divisor.tuples.map((tuple) => String(tuple[0])));

      question.options.forEach((option) => {
        if (option.text === "None of these values qualify") {
          expect(option.correct).toBe(true);
          const anyoneCovers = question.options
            .filter((entry) => entry.text !== option.text)
            .some((entry) => {
              const paired = new Set(
                dividend.tuples
                  .filter((tuple) => String(tuple[0]) === entry.text)
                  .map((tuple) => String(tuple[1]))
              );
              return [...required].every((value) => paired.has(value));
            });
          expect(anyoneCovers).toBe(false);
          return;
        }
        const paired = new Set(
          dividend.tuples
            .filter((tuple) => String(tuple[0]) === option.text)
            .map((tuple) => String(tuple[1]))
        );
        const coversAll = [...required].every((value) => paired.has(value));
        expect(option.correct, `${option.text} coverage`).toBe(coversAll);
      });
    }
  });

  it("tags a partial-coverage pick as treating division as ANY", () => {
    const question = SEEDS.map((seed) => generateDivisionQuestion(seed))
      .filter((q) => q.kind === "choice")
      .find((q) => q.kind === "choice" && q.options.some((option) => !option.correct));
    expect(question).toBeDefined();
    if (!question || question.kind !== "choice") return;

    const wrongIndex = question.options.findIndex((option) => !option.correct);
    const correctIndexes = question.options
      .map((option, index) => (option.correct ? index : -1))
      .filter((index) => index >= 0);

    const result = gradeQuestion(question, {
      kind: "choice",
      selected: [...correctIndexes, wrongIndex]
    });
    expect(result.correct).toBe(false);
    expect(result.mistakes).toContain("division-any-not-all");
  });

  it("is deterministic", () => {
    const a = generateDivisionQuestion(31);
    const b = generateDivisionQuestion(31);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
});
