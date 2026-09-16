/**
 * Choosing the one set a class page puts in front of you.
 *
 * The rule used to be "lowest best score wins". An unattempted set scores 0,
 * so that rule could not tell "never tried" from "did badly" — and the moment
 * a class gained an exam simulation, the headline advice became "sit this
 * 50-minute timed exam", captioned "this is your lowest score so far", about
 * a set the student had never opened.
 *
 * Pulled out of the page component so the branches can be tested. Each one
 * carries the reason it fired, because the caption has to match the reason or
 * it is just a confident guess at what the learner did.
 */

import { bestScoreForQuiz } from "@/features/progress/metrics";
import { resolveQuizSetMode } from "@/lib/study/set-mode";
import type { Attempt, QuizSet } from "@/lib/types";

export type RecommendationReason =
  /** Nothing attempted in this class yet. */
  | "new"
  /** Attempted something, and this is the weakest of those. */
  | "improve"
  /** Everything attempted is at full marks; this one is untried. */
  | "untried"
  /** Full marks everywhere and nothing untried is left. */
  | "revisit";

export interface Recommendation {
  set: QuizSet;
  reason: RecommendationReason;
}

/**
 * An exam is what you sit when you are ready, not the way into a class, so
 * it is never offered as the entry point. It still appears in the Exams tab.
 */
function isPractice(set: QuizSet): boolean {
  return resolveQuizSetMode(set) !== "exam";
}

export function chooseRecommendedSet(
  sets: QuizSet[],
  courseAttempts: Attempt[],
  allAttempts: Attempt[] = courseAttempts
): Recommendation | null {
  if (sets.length === 0) return null;

  const attemptedIds = new Set(courseAttempts.map((attempt) => attempt.quizId));

  const weakestAttempted = sets
    .filter((set) => attemptedIds.has(set.id))
    .sort((a, b) => bestScoreForQuiz(allAttempts, a.id) - bestScoreForQuiz(allAttempts, b.id))[0];

  // Anything short of full marks still has room to improve, and for those the
  // "lowest score so far" caption is actually true.
  if (weakestAttempted && bestScoreForQuiz(allAttempts, weakestAttempted.id) < 100) {
    return { set: weakestAttempted, reason: "improve" };
  }

  const untriedPractice = sets
    .filter((set) => isPractice(set) && !attemptedIds.has(set.id))
    .sort((a, b) => a.estMinutes - b.estMinutes)[0];

  if (untriedPractice) {
    return {
      set: untriedPractice,
      reason: courseAttempts.length === 0 ? "new" : "untried"
    };
  }

  return weakestAttempted
    ? { set: weakestAttempted, reason: "revisit" }
    : { set: sets[0], reason: "new" };
}

/** The caption shown under the recommended set's title. */
export function recommendationCaption(reason: RecommendationReason): string {
  switch (reason) {
    case "new":
      return "New here? This is the easiest way into this class.";
    case "untried":
      return "You have not tried this one yet.";
    case "revisit":
      return "You have full marks everywhere — a re-run keeps it fresh.";
    case "improve":
      return "This is your lowest score so far — the best place to improve.";
  }
}
