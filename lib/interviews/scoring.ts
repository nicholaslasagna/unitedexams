import type { CompanyInterview, InterviewQuestion } from "@/data/seed/interviews";

/** Signal ids the candidate marked as "I covered this". */
export type CheckedSignals = Record<string, string[]>;

/** Objective test outcomes per question id, from the in-browser runner. */
export type TestOutcomes = Record<string, { passed: number; total: number }>;

export interface QuestionScore {
  questionId: string;
  round: string;
  kind: InterviewQuestion["kind"];
  earned: number;
  possible: number;
  percent: number;
  /** Rubric lines missed, worst-weighted first. */
  missed: { label: string; hint: string; weight: number }[];
  hit: string[];
  /** Present only on coding questions: objective test outcome. */
  tests?: { passed: number; total: number };
}

export interface InterviewScore {
  percent: number;
  earned: number;
  possible: number;
  /** Hire-bar band, mirroring how loops actually get summarized. */
  band: "strong-hire" | "hire" | "borderline" | "no-hire";
  perQuestion: QuestionScore[];
  perRound: { round: string; percent: number }[];
  strengths: string[];
  /** Top improvements across the whole loop, worst-weighted first. */
  improvements: { label: string; hint: string; weight: number }[];
}

function band(percent: number): InterviewScore["band"] {
  if (percent >= 85) return "strong-hire";
  if (percent >= 70) return "hire";
  if (percent >= 50) return "borderline";
  return "no-hire";
}

export function scoreInterview(
  interview: CompanyInterview,
  checked: CheckedSignals,
  testOutcomes: TestOutcomes = {},
  /**
   * Round ids the candidate actually had access to. Free users only sit the
   * unlocked rounds, so scoring the whole loop would score them against
   * questions they were never shown. Omit to score everything.
   */
  includeRoundIds?: string[]
): InterviewScore {
  const perQuestion: QuestionScore[] = [];
  const scoped = includeRoundIds
    ? interview.rounds.filter((round) => includeRoundIds.includes(round.id))
    : interview.rounds;

  for (const round of scoped) {
    for (const question of round.questions) {
      const marked = new Set(checked[question.id] ?? []);
      let possible = question.signals.reduce((sum, s) => sum + s.weight, 0);
      let earned = question.signals
        .filter((s) => marked.has(s.id))
        .reduce((sum, s) => sum + s.weight, 0);

      // Coding rounds are graded objectively by the test runner, not by
      // self-report — partial credit, proportional to tests passed.
      const outcome = question.coding ? testOutcomes[question.id] : undefined;
      if (question.coding) {
        possible += question.coding.weight;
        if (outcome && outcome.total > 0) {
          earned += question.coding.weight * (outcome.passed / outcome.total);
        }
      }

      perQuestion.push({
        questionId: question.id,
        round: round.name,
        kind: question.kind,
        earned,
        possible,
        percent: possible === 0 ? 0 : Math.round((earned / possible) * 100),
        tests: outcome,
        missed: question.signals
          .filter((s) => !marked.has(s.id))
          .sort((a, b) => b.weight - a.weight)
          .map((s) => ({ label: s.label, hint: s.hint, weight: s.weight }))
          .concat(
            question.coding && (!outcome || outcome.passed < outcome.total)
              ? [
                  {
                    label: `Get all ${question.coding.tests.length} tests passing for ${question.coding.functionName}()`,
                    hint: outcome
                      ? `You passed ${outcome.passed} of ${outcome.total}. In a real loop, code that fails a case you were shown is the single fastest way to lose the round — re-read the failing case and dry-run it by hand.`
                      : "You never ran the tests. Interviewers expect you to verify your own code before saying you're done.",
                    weight: question.coding.weight
                  }
                ]
              : []
          )
          .sort((a, b) => b.weight - a.weight),
        hit: question.signals.filter((s) => marked.has(s.id)).map((s) => s.label)
      });
    }
  }

  const earned = Math.round(perQuestion.reduce((sum, q) => sum + q.earned, 0));
  const possible = perQuestion.reduce((sum, q) => sum + q.possible, 0);
  const percent = possible === 0 ? 0 : Math.round((earned / possible) * 100);

  const perRound = scoped.map((round) => {
    const rows = perQuestion.filter((q) => q.round === round.name);
    const e = rows.reduce((sum, q) => sum + q.earned, 0);
    const p = rows.reduce((sum, q) => sum + q.possible, 0);
    return { round: round.name, percent: p === 0 ? 0 : Math.round((e / p) * 100) };
  });

  return {
    percent,
    earned,
    possible,
    band: band(percent),
    perQuestion,
    perRound,
    strengths: perQuestion.flatMap((q) => q.hit).slice(0, 6),
    improvements: perQuestion
      .flatMap((q) => q.missed)
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 6)
  };
}
