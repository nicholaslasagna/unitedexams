import { describe, expect, it } from "vitest";
import { databaseExam1QuizSets } from "@/data/seed/db-exam1/practice-exam";
import { quizSets } from "@/data/seed/quiz-sets";
import { BUILDER_PALETTE } from "@/lib/relational-algebra/notation";
import { caretAfterInsert, needsAlgebraSymbols } from "./symbol-palette";

/**
 * σ, Π, ⋈, ⟕, ▷ and ÷ are not on a keyboard, so a written-answer question
 * about relational algebra is unanswerable without the palette. These guard
 * both halves: that it appears where it is needed, and that it does not
 * appear where it would just be noise.
 */

const [exam] = databaseExam1QuizSets;

describe("where the symbol palette appears", () => {
  it("covers every written answer on the Exam 1 paper", () => {
    const written = exam.questions.filter((q) => q.type === "free" || q.type === "fill");
    expect(written.length).toBeGreaterThan(0);
    written.forEach((q) => {
      expect(needsAlgebraSymbols(q.tags), `${q.id} has no palette`).toBe(true);
    });
  });

  it("covers the free-response algebra questions specifically", () => {
    // These four ask for an expression and cannot be answered without it.
    ["db-exam1-sim-q19", "db-exam1-sim-q20", "db-exam1-sim-q21", "db-exam1-sim-q22"].forEach(
      (id) => {
        const q = exam.questions.find((entry) => entry.id === id);
        expect(q, id).toBeDefined();
        expect(needsAlgebraSymbols(q!.tags), id).toBe(true);
      }
    );
  });

  it("stays out of the way on other courses' written answers", () => {
    const foreignWritten = quizSets
      .filter((set) => set.courseId !== "database-systems")
      .flatMap((set) => set.questions)
      .filter((q) => q.type === "free" || q.type === "fill");

    expect(foreignWritten.length).toBeGreaterThan(0);
    const leaking = foreignWritten.filter((q) => needsAlgebraSymbols(q.tags));
    expect(
      leaking.map((q) => q.id),
      "a non-database question was offered relational algebra symbols"
    ).toEqual([]);
  });

  it("ignores questions with no tags at all", () => {
    expect(needsAlgebraSymbols([])).toBe(false);
  });
});

describe("the palette itself", () => {
  it("offers every operator the exam's answers need", () => {
    const glyphs = BUILDER_PALETTE.map((entry) => entry.glyph);
    ["σ", "Π", "X", "⋈", "⟕", "⟖", "⟗", "▷", "÷", "∧", "∨"].forEach((glyph) => {
      expect(glyphs, `${glyph} is missing`).toContain(glyph);
    });
  });

  it("gives every button an accessible label", () => {
    BUILDER_PALETTE.forEach((entry) => {
      expect(entry.label.trim().length, entry.glyph).toBeGreaterThan(1);
    });
  });

  it("puts the caret inside the braces where a subscript follows", () => {
    // σ and Π take a subscript, so their snippets carry braces to land in.
    const needsSubscript = BUILDER_PALETTE.filter((entry) =>
      ["σ", "Π", "⋈", "⟕", "⟖", "⟗", "▷"].includes(entry.glyph)
    );
    needsSubscript.forEach((entry) => {
      expect(entry.insert, `${entry.glyph} has no braces to type into`).toContain("{");
    });
  });
});

describe("where the caret lands after an insert", () => {
  it("lands inside the braces so the subscript is what gets typed next", () => {
    // Π_{} at the start of an empty field: the caret belongs at index 3.
    const project = BUILDER_PALETTE.find((entry) => entry.glyph === "Π")!;
    expect(caretAfterInsert(project.insert, 0)).toBe(3);
    expect(project.insert.slice(0, caretAfterInsert(project.insert, 0))).toBe("Π_{");
  });

  it("lands after the glyph when there is no subscript to fill", () => {
    const union = BUILDER_PALETTE.find((entry) => entry.glyph === "∪")!;
    expect(caretAfterInsert(union.insert, 0)).toBe(union.insert.length);
  });

  it("is relative to the caret, not the start of the field", () => {
    // Inserting mid-expression must not send the caret back to the top.
    const join = BUILDER_PALETTE.find((entry) => entry.glyph === "⋈")!;
    expect(caretAfterInsert(join.insert, 13)).toBe(13 + caretAfterInsert(join.insert, 0));
  });

  it("puts the caret inside the braces for every subscripted operator", () => {
    BUILDER_PALETTE.filter((entry) => entry.insert.includes("{")).forEach((entry) => {
      const caret = caretAfterInsert(entry.insert, 0);
      expect(entry.insert[caret - 1], entry.glyph).toBe("{");
      expect(entry.insert[caret], entry.glyph).toBe("}");
    });
  });
});
