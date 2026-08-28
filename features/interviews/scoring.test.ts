import { describe, expect, it } from "vitest";
import { companyInterviews } from "../../data/seed/interviews";
import { scoreInterview } from "../../lib/interviews/scoring";

const interview = companyInterviews[0];
const allSignals = () =>
  Object.fromEntries(
    interview.rounds.flatMap((r) => r.questions).map((q) => [q.id, q.signals.map((s) => s.id)])
  );

describe("scoreInterview", () => {
  it("scores an empty attempt as 0 / no-hire and lists improvements", () => {
    const result = scoreInterview(interview, {});
    expect(result.percent).toBe(0);
    expect(result.band).toBe("no-hire");
    expect(result.improvements.length).toBeGreaterThan(0);
    // worst-weighted improvement comes first
    expect(result.improvements[0].weight).toBeGreaterThanOrEqual(
      result.improvements[result.improvements.length - 1].weight
    );
  });

  it("marking every rubric line still can't reach 100 while coding tests are unrun", () => {
    const result = scoreInterview(interview, allSignals());
    expect(result.percent).toBeGreaterThan(80);
    expect(result.percent).toBeLessThan(100);
    // The non-coding rounds are fully earned.
    const behavioural = result.perRound.find((r) => r.round.includes("Googleyness"));
    expect(behavioural?.percent).toBe(100);
  });

  it("weights signals rather than counting them", () => {
    const q = interview.rounds[0].questions[0];
    const heaviest = [...q.signals].sort((a, b) => b.weight - a.weight)[0];
    const lightest = [...q.signals].sort((a, b) => a.weight - b.weight)[0];
    const heavy = scoreInterview(interview, { [q.id]: [heaviest.id] });
    const light = scoreInterview(interview, { [q.id]: [lightest.id] });
    expect(heavy.earned).toBeGreaterThan(light.earned);
  });
});

describe("coding rounds are graded objectively", () => {
  const coding = interview.rounds
    .flatMap((r) => r.questions)
    .find((q) => q.coding)!;

  it("awards partial credit proportional to tests passed", () => {
    const none = scoreInterview(interview, {}, { [coding.id]: { passed: 0, total: 6 } });
    const half = scoreInterview(interview, {}, { [coding.id]: { passed: 3, total: 6 } });
    const all = scoreInterview(interview, {}, { [coding.id]: { passed: 6, total: 6 } });
    expect(half.earned).toBeGreaterThan(none.earned);
    expect(all.earned).toBeGreaterThan(half.earned);
  });

  it("cannot reach 100% on rubric self-marks alone when tests fail", () => {
    const result = scoreInterview(interview, allSignals(), { [coding.id]: { passed: 0, total: 6 } });
    expect(result.percent).toBeLessThan(100);
    expect(result.improvements.some((i) => i.label.includes(coding.coding!.functionName))).toBe(true);
  });

  it("reaches 100% only when rubric and tests are both complete", () => {
    const outcomes = Object.fromEntries(
      interview.rounds
        .flatMap((r) => r.questions)
        .filter((q) => q.coding)
        .map((q) => [q.id, { passed: q.coding!.tests.length, total: q.coding!.tests.length }])
    );
    const result = scoreInterview(interview, allSignals(), outcomes);
    expect(result.percent).toBe(100);
    expect(result.improvements).toHaveLength(0);
  });
});

describe("candidates are scored only on what they sat", () => {
  const freeRounds = interview.rounds.filter((r) => !r.premium);
  const freeQuestionIds = freeRounds.flatMap((r) => r.questions.map((q) => q.id));

  it("ignores premium rounds when scoped to the free round's questions", () => {
    const scoped = scoreInterview(interview, {}, {}, freeQuestionIds);
    expect(scoped.perRound).toHaveLength(freeRounds.length);
    expect(scoped.perQuestion.every((q) => freeQuestionIds.includes(q.questionId))).toBe(true);
  });

  it("lets a free candidate reach 100% on the free round alone", () => {
    const freeQuestions = freeRounds.flatMap((r) => r.questions);
    const checked = Object.fromEntries(
      freeQuestions.map((q) => [q.id, q.signals.map((s) => s.id)])
    );
    const outcomes = Object.fromEntries(
      freeQuestions
        .filter((q) => q.coding)
        .map((q) => [q.id, { passed: q.coding!.tests.length, total: q.coding!.tests.length }])
    );
    const scoped = scoreInterview(interview, checked, outcomes, freeQuestionIds);
    expect(scoped.percent).toBe(100);
    expect(scoped.band).toBe("strong-hire");
  });

  it("scores a rotating slice, not the whole bank", () => {
    // The heart of the retake fix: a sitting serves part of a round's bank,
    // so a candidate must never be marked down for the questions the
    // rotation did not hand them.
    const round = interview.rounds[0];
    const [first] = round.questions;
    const scoped = scoreInterview(interview, {}, {}, [first.id]);
    expect(scoped.perQuestion).toHaveLength(1);
    expect(scoped.perQuestion[0].questionId).toBe(first.id);

    const perfect = scoreInterview(
      interview,
      { [first.id]: first.signals.map((s) => s.id) },
      first.coding
        ? { [first.id]: { passed: first.coding.tests.length, total: first.coding.tests.length } }
        : {},
      [first.id]
    );
    expect(perfect.percent).toBe(100);
  });
});
