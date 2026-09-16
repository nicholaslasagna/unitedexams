import { describe, expect, it } from "vitest";
import { gradeQuestion } from "@/features/quiz/engine";
import { TOPIC_IDS } from "@/features/db-exam1/topics";
import { EXAM1_QUIZ_IDS } from "@/features/db-exam1/mastery";
import { evaluate } from "@/lib/relational-algebra/ast";
import { parseExpression } from "@/lib/relational-algebra/parser";
import { quizSets } from "@/data/seed/quiz-sets";
import { courseDatabase } from "./relations";
import { databaseExam1QuizSets } from "./practice-exam";

/**
 * The exam paper is fixed content, so the risk is a wrong stated answer —
 * the one failure a practice exam must not have. Every numeric answer is
 * re-derived from the evaluator here rather than trusted.
 */

const [exam] = databaseExam1QuizSets;

const question = (id: string) => {
  const found = exam.questions.find((q) => q.id === id);
  if (!found) throw new Error(`missing ${id}`);
  return found;
};

/** Evaluate an expression against the course relations. */
const shape = (text: string) => {
  const relation = evaluate(parseExpression(text), courseDatabase).relation;
  return { degree: relation.attributes.length, cardinality: relation.tuples.length };
};

describe("the exam is registered where students look for exams", () => {
  it("appears in the course's quiz sets", () => {
    const registered = quizSets.find((set) => set.id === "db-exam1-simulation");
    expect(registered).toBeDefined();
    expect(registered?.courseId).toBe("database-systems");
  });

  it("is an exam, not a quiz, so it lands in the Exams tab", () => {
    expect(exam.mode).toBe("exam");
    expect(exam.isExamSimulation).toBe(true);
    expect(exam.timerDefaultMinutes).toBe(50);
  });

  it("counts toward Exam 1 readiness", () => {
    // Otherwise a learner could sit the paper and watch readiness not move.
    expect(EXAM1_QUIZ_IDS.has(exam.id)).toBe(true);
  });

  it("has unique question ids and a matching target count", () => {
    const ids = exam.questions.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(exam.questions.length).toBeGreaterThanOrEqual(exam.questionCountTarget ?? 0);
  });
});

describe("every question is answerable and explained", () => {
  it.each(databaseExam1QuizSets[0].questions.map((q) => [q.id, q] as const))(
    "%s",
    (_id, q) => {
      expect(q.prompt.trim().length).toBeGreaterThan(20);
      expect(q.explanation.trim().length).toBeGreaterThan(40);
      // Every question must carry a topic tag so it feeds mastery.
      expect(q.tags.some((tag) => TOPIC_IDS.includes(tag as never)), "no topic tag").toBe(true);

      if (q.type === "single" || q.type === "multi") {
        expect(q.options?.length ?? 0).toBeGreaterThanOrEqual(3);
        const correct = (q.correct ?? []).filter((c): c is number => typeof c === "number");
        expect(correct.length).toBeGreaterThan(0);
        correct.forEach((index) => {
          expect(index).toBeGreaterThanOrEqual(0);
          expect(index).toBeLessThan(q.options!.length);
        });
        if (q.type === "single") expect(correct).toHaveLength(1);
        // The stated answer must actually grade as correct.
        expect(gradeQuestion(q, correct)).toBe(true);
      }

      if (q.type === "fill") {
        const accepted = (q.correct ?? []).filter((c): c is string => typeof c === "string");
        expect(accepted.length).toBeGreaterThan(0);
        accepted.forEach((value) => {
          expect(gradeQuestion(q, [], value), `"${value}" rejected`).toBe(true);
        });
        // A wrong answer must not slip through.
        expect(gradeQuestion(q, [], "definitely not the answer")).toBe(false);
      }

      if (q.type === "free") {
        expect(q.sampleAnswer, "free response needs a model answer").toBeTruthy();
        expect((q.walkthroughSteps ?? []).length).toBeGreaterThanOrEqual(3);
      }
    }
  );
});

describe("the numeric answers match the evaluator", () => {
  const expectFill = (id: string, value: string) => {
    const q = question(id);
    expect(q.type).toBe("fill");
    expect((q.correct ?? []).map(String)).toContain(value);
  };

  it("Branch degree and Staff cardinality", () => {
    expectFill("db-exam1-sim-q2", String(shape("Branch").degree));
    expectFill("db-exam1-sim-q3", String(shape("Staff").cardinality));
  });

  it("selection keeps four staff over 10,000", () => {
    expectFill("db-exam1-sim-q8", String(shape("σ_{salary > 10000}(Staff)").cardinality));
  });

  it("projection eliminates the duplicate city", () => {
    const projected = shape("Π_{city}(Branch)");
    const base = shape("Branch");
    // The question is only worth asking because these differ.
    expect(projected.cardinality).toBeLessThan(base.cardinality);
    expectFill("db-exam1-sim-q9", String(projected.cardinality));
  });

  it("Cartesian product adds degree and multiplies cardinality", () => {
    const product = shape("Staff X Branch");
    expect(product.degree).toBe(shape("Staff").degree + shape("Branch").degree);
    expect(product.cardinality).toBe(shape("Staff").cardinality * shape("Branch").cardinality);
    expectFill("db-exam1-sim-q10", String(product.degree));
    expectFill("db-exam1-sim-q11", String(product.cardinality));
  });

  it("the Album join figures", () => {
    const on = "Album.labelCode = RecordLabel.labelCode";
    expectFill("db-exam1-sim-q12", String(shape(`Album ⋈_{${on}} RecordLabel`).cardinality));
    expectFill("db-exam1-sim-q13", String(shape("Album ⋈ RecordLabel").degree));
    expectFill("db-exam1-sim-q14", String(shape(`Album ⟕_{${on}} RecordLabel`).cardinality));
    expectFill("db-exam1-sim-q15", String(shape(`Album ⟖_{${on}} RecordLabel`).cardinality));
  });

  it("the left and right outer joins genuinely differ", () => {
    const on = "Album.labelCode = RecordLabel.labelCode";
    // If these were equal the question could not test which side is preserved.
    expect(shape(`Album ⟕_{${on}} RecordLabel`).cardinality).not.toBe(
      shape(`Album ⟖_{${on}} RecordLabel`).cardinality
    );
  });

  it("the theta join returns exactly Sunrise and Horizon", () => {
    const result = evaluate(
      parseExpression(
        "Π_{title}(Album ⋈_{Album.labelCode = RecordLabel.labelCode ∧ sales ≥ minSalesTarget} RecordLabel)"
      ),
      courseDatabase
    ).relation;
    expect(result.tuples.map((t) => String(t[0])).sort()).toEqual(["Horizon", "Sunrise"]);
    // The stated option must be the one naming those two.
    const q = question("db-exam1-sim-q16");
    const chosen = q.options?.[(q.correct ?? [])[0] as number] ?? "";
    expect(chosen).toMatch(/Sunrise and Horizon/);
  });

  it("the semijoin returns Album's schema with three tuples", () => {
    const semi = shape("Album ▷_{Album.labelCode = RecordLabel.labelCode} RecordLabel");
    expect(semi).toEqual({ degree: 4, cardinality: 3 });
    const q = question("db-exam1-sim-q17");
    const chosen = q.options?.[(q.correct ?? [])[0] as number] ?? "";
    expect(chosen).toMatch(/Album's four attributes only; 3 tuples/);
  });
});

describe("coverage", () => {
  it("spans every part of the syllabus the exam tests", () => {
    const covered = new Set(exam.questions.flatMap((q) => q.tags));
    [
      "relational-terminology",
      "degree-cardinality",
      "keys",
      "integrity",
      "selection",
      "projection",
      "cartesian-product",
      "equijoin",
      "natural-join",
      "outer-join-left",
      "outer-join-right",
      "semijoin",
      "division",
      "reading-expressions",
      "writing-expressions"
    ].forEach((topic) => {
      expect(covered, `${topic} is not on the paper`).toContain(topic);
    });
  });

  it("mixes recall with working, not just multiple choice", () => {
    const byType = exam.questions.reduce<Record<string, number>>((acc, q) => {
      acc[q.type] = (acc[q.type] ?? 0) + 1;
      return acc;
    }, {});
    expect(byType.fill ?? 0).toBeGreaterThanOrEqual(6);
    expect(byType.free ?? 0).toBeGreaterThanOrEqual(3);
    expect(byType.single ?? 0).toBeGreaterThanOrEqual(5);
  });

  it("sits the whole paper rather than sampling it", () => {
    // The description promises a fixed set of questions, so a smaller target
    // would quietly drop some of them at random between sittings.
    expect(exam.questionCountTarget).toBe(exam.questions.length);
  });

  it("keeps every question self-contained", () => {
    // The runner shuffles by default, so a section header or a reference to
    // "questions 12-16" lands in the wrong place — and a learner skipping
    // around has no order to rely on either.
    exam.questions.forEach((q) => {
      expect(q.prompt, `${q.id} has a section header`).not.toMatch(/Section [A-Z] —/);
      expect(q.prompt, `${q.id} references other questions by number`).not.toMatch(
        /questions?\s+\d+\s*[–-]\s*\d+|the same two relations|for questions/i
      );
    });
  });

  it("gives each join question the data it needs", () => {
    // These cannot be answered without knowing the labelCode distribution.
    ["db-exam1-sim-q12", "db-exam1-sim-q13", "db-exam1-sim-q14", "db-exam1-sim-q15", "db-exam1-sim-q17"]
      .forEach((id) => {
        expect(question(id).prompt, `${id} lacks its relations`).toMatch(/labelCode/);
      });
  });

  it("leaves enough time per question to be sittable", () => {
    const minutesEach = (exam.timerDefaultMinutes ?? 0) / exam.questions.length;
    expect(minutesEach).toBeGreaterThan(1.5);
    expect(minutesEach).toBeLessThan(6);
  });
});
