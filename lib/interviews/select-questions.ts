import type { CompanyInterview, InterviewQuestion, InterviewRound } from "@/data/seed/interviews";

export interface ServedQuestion {
  round: InterviewRound;
  question: InterviewQuestion;
}

/**
 * How many questions a round serves in one sitting.
 *
 * A round's `questions` array is a BANK, not a script. Real loops draw from
 * a pool - two candidates interviewing for the same role on the same day get
 * different problems, and an interviewer will not reuse a question on a
 * candidate who is re-interviewing. Serving the whole bank every time turned
 * a retake into a memory test of the exact same prompts, which measures
 * recall of this site rather than readiness for the interview.
 */
export function questionsPerAttempt(round: InterviewRound) {
  const wanted = round.questionsPerAttempt ?? round.questions.length;
  return Math.max(1, Math.min(wanted, round.questions.length));
}

/**
 * The questions a given attempt sits, per round.
 *
 * Rotation, not randomness, and deliberately so:
 *
 *   - every question in the bank is reached before any is repeated, so the
 *     practice value of the whole bank is actually delivered;
 *   - a random pick can hand you the same problem twice in a row, which is
 *     the exact complaint this fixes;
 *   - it is a pure function of (bank, attemptIndex), so resuming a saved
 *     draft restores the same questions rather than silently swapping them
 *     out underneath a half-finished answer.
 */
export function selectRoundQuestions(
  round: InterviewRound,
  attemptIndex: number
): InterviewQuestion[] {
  const bank = round.questions;
  const perAttempt = questionsPerAttempt(round);
  if (bank.length === 0) return [];
  if (perAttempt >= bank.length) return [...bank];

  const safeIndex = Number.isFinite(attemptIndex) ? Math.max(0, Math.floor(attemptIndex)) : 0;
  const offset = (safeIndex * perAttempt) % bank.length;
  return Array.from({ length: perAttempt }, (_, i) => bank[(offset + i) % bank.length]);
}

/** The rotating selection across every round this account can sit. */
export function selectQuestionsForAttempt(
  rounds: InterviewRound[],
  attemptIndex: number
): ServedQuestion[] {
  return rounds.flatMap((round) =>
    selectRoundQuestions(round, attemptIndex).map((question) => ({ round, question }))
  );
}

/**
 * Every question in every open round - the "practice everything" drill.
 *
 * The timed loop is the realistic simulation and deliberately shows only a
 * slice; this is the other half of that bargain, so nothing in the bank is
 * ever unreachable.
 */
export function selectAllQuestions(rounds: InterviewRound[]): ServedQuestion[] {
  return rounds.flatMap((round) => round.questions.map((question) => ({ round, question })));
}

/** Distinct sittings before the rotation starts repeating a round's bank. */
export function distinctAttemptsBeforeRepeat(interview: CompanyInterview) {
  const cycles = interview.rounds
    .filter((round) => round.questions.length > 0)
    .map((round) => Math.ceil(round.questions.length / questionsPerAttempt(round)));
  return cycles.length === 0 ? 0 : Math.min(...cycles);
}
