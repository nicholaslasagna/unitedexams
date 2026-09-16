/**
 * One question shape for the whole Exam 1 experience.
 *
 * Drills, the labs, the study-guide set and the exam simulator all render and
 * grade through this model, so a question written once works everywhere and
 * mastery accrues the same way regardless of where it was answered.
 *
 * Grading returns *why* an answer was wrong, not just that it was. Every
 * distractor can name the misconception it reveals, which is what lets the
 * feedback panel say something better than "Incorrect" and what feeds the
 * adaptive scheduler.
 */

import { courseDatabase } from "@/data/seed/db-exam1/relations";
import { evaluate } from "@/lib/relational-algebra/ast";
import { gradeExpressionText, structuralDiff } from "@/lib/relational-algebra/equivalence";
import { parseExpression } from "@/lib/relational-algebra/parser";
import { tupleKey, type RAValue, type Relation } from "@/lib/relational-algebra/relation";
import type { MistakeTag } from "./mistakes";
import type { TopicId } from "./topics";

/**
 * Where a question came from. The distinction is shown in the UI: material
 * taken from the professor is labelled as such, and generated variants are
 * never passed off as course-issued.
 */
export type QuestionSource = "professor" | "study-guide" | "generated";

export type Difficulty = "intro" | "core" | "stretch";

export interface QuestionContext {
  /** Relation instances to print above the question. */
  relations?: Relation[];
  /** Schema card to show, by `CourseSchema.id`. */
  schemaId?: string;
  /** An expression the question is about, in course notation. */
  expression?: string;
  /** Constraints or framing that are not part of the prompt sentence. */
  note?: string;
}

/** One step of the "how do I even start?" reasoning process. */
export interface WalkthroughStep {
  /** The question to ask yourself. */
  ask: string;
  /** The answer for this particular problem. */
  answer: string;
  /** Why that is the answer — the transferable part. */
  why?: string;
}

interface QuestionBase {
  id: string;
  topic: TopicId;
  source: QuestionSource;
  /** Citation, e.g. "Homework #1, Question 1(c)". */
  sourceNote?: string;
  difficulty: Difficulty;
  prompt: string;
  context?: QuestionContext;
  /** Shown after answering, right or wrong. */
  explanation: string;
  /** Progressive hints, revealed one at a time on request. */
  hints?: string[];
  walkthrough?: WalkthroughStep[];
}

export interface Choice {
  text: string;
  correct: boolean;
  /** The misconception picking this reveals. */
  mistake?: MistakeTag;
  /** Option-specific feedback, shown when this option is chosen. */
  note?: string;
}

export interface RowCandidate {
  values: RAValue[];
  inResult: boolean;
  /** Why wrongly including or excluding this row happens. */
  mistake?: MistakeTag;
  note?: string;
}

export type LabQuestion =
  | (QuestionBase & {
      kind: "choice";
      options: Choice[];
      /** True when more than one option is correct. */
      multiple?: boolean;
    })
  | (QuestionBase & {
      kind: "shape";
      degree: number;
      cardinality: number;
      /** What the learner is measuring, e.g. "R ⋈ S". */
      subject: string;
    })
  | (QuestionBase & {
      kind: "rows";
      attributes: string[];
      candidates: RowCandidate[];
    })
  | (QuestionBase & {
      kind: "expression";
      /** Reference answer in course notation. */
      referenceText: string;
      /** Relation names the answer may use. */
      available: string[];
    });

export type QuestionKind = LabQuestion["kind"];

// ── Answers ───────────────────────────────────────────────────────────────

export type LabAnswer =
  | { kind: "choice"; selected: number[] }
  | { kind: "shape"; degree: number | null; cardinality: number | null }
  | { kind: "rows"; selected: number[] }
  | { kind: "expression"; text: string };

export function emptyAnswer(question: LabQuestion): LabAnswer {
  switch (question.kind) {
    case "choice":
      return { kind: "choice", selected: [] };
    case "shape":
      return { kind: "shape", degree: null, cardinality: null };
    case "rows":
      return { kind: "rows", selected: [] };
    case "expression":
      return { kind: "expression", text: "" };
  }
}

export function isAnswered(answer: LabAnswer, question?: LabQuestion): boolean {
  switch (answer.kind) {
    case "choice":
      if (question?.kind === "choice" && question.multiple) return true;
      return answer.selected.length > 0;
    case "shape":
      return answer.degree !== null && answer.cardinality !== null;
    case "rows":
      // An empty selection is a real answer: "none of these tuples belong".
      return true;
    case "expression":
      return answer.text.trim().length > 0;
  }
}

// ── Grading ───────────────────────────────────────────────────────────────

export interface GradeResult {
  correct: boolean;
  /** Misconceptions this answer revealed, most specific first. */
  mistakes: MistakeTag[];
  /** Question-aware feedback, written for this particular answer. */
  feedback: string;
  /** For expression questions: the relation the submission produced. */
  producedRelation?: Relation;
  expectedRelation?: Relation;
}

function sameSet(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  const set = new Set(a);
  return b.every((value) => set.has(value));
}

function gradeChoice(
  question: Extract<LabQuestion, { kind: "choice" }>,
  selected: number[]
): GradeResult {
  const correctIndexes = question.options
    .map((option, index) => (option.correct ? index : -1))
    .filter((index) => index >= 0);

  const correct = sameSet(correctIndexes, selected);
  if (correct) {
    return { correct: true, mistakes: [], feedback: question.explanation };
  }

  const wronglyPicked = selected.filter((index) => !question.options[index]?.correct);
  const missed = correctIndexes.filter((index) => !selected.includes(index));

  const mistakes = [
    ...new Set(
      wronglyPicked
        .map((index) => question.options[index]?.mistake)
        .filter((tag): tag is MistakeTag => Boolean(tag))
    )
  ];

  // Prefer the option-specific note: it speaks to the exact thing they chose.
  const note = wronglyPicked.map((index) => question.options[index]?.note).find(Boolean);
  if (note) return { correct: false, mistakes, feedback: note };

  if (wronglyPicked.length === 0 && missed.length > 0) {
    return {
      correct: false,
      mistakes: mistakes.length > 0 ? mistakes : ["unclassified"],
      feedback: `That is right as far as it goes, but incomplete — ${
        missed.length === 1 ? "one more option belongs" : `${missed.length} more options belong`
      } in the answer.`
    };
  }

  return {
    correct: false,
    mistakes: mistakes.length > 0 ? mistakes : ["unclassified"],
    feedback: question.explanation
  };
}

function gradeShape(
  question: Extract<LabQuestion, { kind: "shape" }>,
  degree: number | null,
  cardinality: number | null
): GradeResult {
  if (degree === question.degree && cardinality === question.cardinality) {
    return { correct: true, mistakes: [], feedback: question.explanation };
  }

  // The signature error: the two numbers are right but the other way round.
  if (degree === question.cardinality && cardinality === question.degree) {
    return {
      correct: false,
      mistakes: ["degree-cardinality-swapped"],
      feedback:
        `Both numbers are right but they are the wrong way round. ${question.subject} has ` +
        `degree ${question.degree} (attributes — the columns) and cardinality ` +
        `${question.cardinality} (tuples — the rows).`
    };
  }

  const wrong: string[] = [];
  if (degree !== question.degree) wrong.push(`degree is ${question.degree}, not ${degree ?? "—"}`);
  if (cardinality !== question.cardinality) {
    wrong.push(`cardinality is ${question.cardinality}, not ${cardinality ?? "—"}`);
  }

  return {
    correct: false,
    mistakes: [question.topic === "cartesian-product" ? "cartesian-arithmetic" : "unclassified"],
    feedback: `For ${question.subject}, ${wrong.join(" and ")}. ${question.explanation}`
  };
}

function gradeRows(
  question: Extract<LabQuestion, { kind: "rows" }>,
  selected: number[]
): GradeResult {
  const correctIndexes = question.candidates
    .map((candidate, index) => (candidate.inResult ? index : -1))
    .filter((index) => index >= 0);

  if (sameSet(correctIndexes, selected)) {
    return { correct: true, mistakes: [], feedback: question.explanation };
  }

  const wronglyIncluded = selected.filter((index) => !question.candidates[index]?.inResult);
  const wronglyExcluded = correctIndexes.filter((index) => !selected.includes(index));

  const mistakes = [
    ...new Set(
      [...wronglyIncluded, ...wronglyExcluded]
        .map((index) => question.candidates[index]?.mistake)
        .filter((tag): tag is MistakeTag => Boolean(tag))
    )
  ];

  const note =
    wronglyExcluded.map((index) => question.candidates[index]?.note).find(Boolean) ??
    wronglyIncluded.map((index) => question.candidates[index]?.note).find(Boolean);

  const counts: string[] = [];
  if (wronglyExcluded.length > 0) {
    counts.push(
      `${wronglyExcluded.length} ${
        wronglyExcluded.length === 1 ? "tuple belongs" : "tuples belong"
      } in the result that you left out`
    );
  }
  if (wronglyIncluded.length > 0) {
    counts.push(
      `${wronglyIncluded.length} ${
        wronglyIncluded.length === 1 ? "tuple does" : "tuples do"
      } not belong`
    );
  }

  return {
    correct: false,
    mistakes: mistakes.length > 0 ? mistakes : ["unclassified"],
    feedback: note ? `${counts.join(", and ")}. ${note}` : `${counts.join(", and ")}.`
  };
}

/**
 * Grade a written expression.
 *
 * Correctness is decided by evaluating both expressions, so any equivalent
 * form is accepted. When it is wrong, the structural comparison suggests the
 * misconception — a missing relation points at a missing join, a filter where
 * a join condition belongs points at the condition confusion.
 */
function gradeExpression(
  question: Extract<LabQuestion, { kind: "expression" }>,
  text: string
): GradeResult {
  const reference = parseExpression(question.referenceText);
  const verdict = gradeExpressionText(text, reference, courseDatabase);

  if (verdict.status === "equivalent") {
    return { correct: true, mistakes: [], feedback: question.explanation };
  }

  if (verdict.status === "error") {
    // An unknown attribute is a real, classifiable mistake, not a typo.
    const unknownAttribute = /no attribute named (\w+)/i.exec(verdict.reason);
    if (unknownAttribute) {
      return {
        correct: false,
        mistakes: ["wrong-relation-for-attribute"],
        feedback: verdict.reason
      };
    }
    return { correct: false, mistakes: [], feedback: verdict.reason };
  }

  const mistakes: MistakeTag[] = [];
  try {
    const submitted = parseExpression(text);
    const diff = structuralDiff(submitted, reference);
    if (diff.missingJoin || diff.missingRelations.length > 0) mistakes.push("missing-join");
    if (diff.projectionMismatch) {
      mistakes.push(
        diff.referenceOperators.has("project") ? "selection-for-projection" : "projection-for-selection"
      );
    }
    if (
      diff.referenceOperators.has("join") &&
      diff.submittedOperators.has("naturalJoin") &&
      !diff.submittedOperators.has("join")
    ) {
      mistakes.push("equijoin-vs-natural-join");
    }
  } catch {
    // Unparseable submissions were already handled above.
  }

  if (mistakes.length === 0) mistakes.push("missing-condition");

  return {
    correct: false,
    mistakes,
    feedback: verdict.reason,
    producedRelation: verdict.actual,
    expectedRelation: verdict.expected
  };
}

export function gradeQuestion(question: LabQuestion, answer: LabAnswer): GradeResult {
  switch (question.kind) {
    case "choice":
      return answer.kind === "choice"
        ? gradeChoice(question, answer.selected)
        : { correct: false, mistakes: [], feedback: "No answer recorded." };
    case "shape":
      return answer.kind === "shape"
        ? gradeShape(question, answer.degree, answer.cardinality)
        : { correct: false, mistakes: [], feedback: "No answer recorded." };
    case "rows":
      return answer.kind === "rows"
        ? gradeRows(question, answer.selected)
        : { correct: false, mistakes: [], feedback: "No answer recorded." };
    case "expression":
      return answer.kind === "expression"
        ? gradeExpression(question, answer.text)
        : { correct: false, mistakes: [], feedback: "No answer recorded." };
  }
}

// ── Authoring helpers ─────────────────────────────────────────────────────

/**
 * Build a `rows` question from a relation the evaluator computed, mixed with
 * plausible wrong rows.
 *
 * Deriving the correct rows from the evaluator rather than typing them out
 * means a generated question cannot disagree with the engine — which is the
 * failure mode that makes a practice tool worse than useless.
 */
export function rowsFromRelation(
  result: Relation,
  distractors: RowCandidate[]
): { attributes: string[]; candidates: RowCandidate[] } {
  const correct: RowCandidate[] = result.tuples.map((values) => ({ values, inResult: true }));
  const seen = new Set(correct.map((candidate) => tupleKey(candidate.values)));
  const extras = distractors.filter((candidate) => !seen.has(tupleKey(candidate.values)));
  return { attributes: result.attributes, candidates: [...correct, ...extras] };
}

/** Evaluate an expression written in course notation against the course data. */
export function evaluateCourseExpression(text: string): Relation {
  return evaluate(parseExpression(text), courseDatabase).relation;
}
