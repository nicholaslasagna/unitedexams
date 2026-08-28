import { describe, expect, it } from "vitest";
import {
  distinctAttemptsBeforeRepeat,
  questionsPerAttempt,
  selectAllQuestions,
  selectQuestionsForAttempt,
  selectRoundQuestions
} from "@/lib/interviews/select-questions";
import type { InterviewQuestion, InterviewRound } from "@/data/seed/interviews";

function question(id: string): InterviewQuestion {
  return {
    id,
    kind: "behavioral",
    prompt: `prompt ${id}`,
    minutes: 10,
    signals: [{ id: `${id}-s`, label: "s", weight: 1, hint: "h" }],
    strongAnswer: "a"
  };
}

function round(id: string, bank: number, perAttempt?: number): InterviewRound {
  return {
    id,
    name: `round ${id}`,
    format: "f",
    minutes: 45,
    questionsPerAttempt: perAttempt,
    questions: Array.from({ length: bank }, (_, i) => question(`${id}-q${i}`))
  };
}

describe("selectRoundQuestions", () => {
  it("serves a different slice on each consecutive attempt", () => {
    const r = round("a", 6, 2);
    const first = selectRoundQuestions(r, 0).map((q) => q.id);
    const second = selectRoundQuestions(r, 1).map((q) => q.id);
    const third = selectRoundQuestions(r, 2).map((q) => q.id);
    expect(first).toEqual(["a-q0", "a-q1"]);
    expect(second).toEqual(["a-q2", "a-q3"]);
    expect(third).toEqual(["a-q4", "a-q5"]);
    // No overlap between back-to-back sittings — the actual complaint.
    expect(first.filter((id) => second.includes(id))).toEqual([]);
  });

  it("reaches every question in the bank before repeating any", () => {
    const r = round("a", 6, 2);
    const seen = new Set<string>();
    for (let attempt = 0; attempt < 3; attempt += 1) {
      for (const q of selectRoundQuestions(r, attempt)) seen.add(q.id);
    }
    expect(seen.size).toBe(6);
  });

  it("wraps back to the start once the bank is exhausted", () => {
    const r = round("a", 6, 2);
    expect(selectRoundQuestions(r, 3).map((q) => q.id)).toEqual(
      selectRoundQuestions(r, 0).map((q) => q.id)
    );
  });

  it("is stable for a given attempt, so resuming a draft is not a reshuffle", () => {
    const r = round("a", 5, 2);
    expect(selectRoundQuestions(r, 7)).toEqual(selectRoundQuestions(r, 7));
  });

  it("serves the whole bank when it is not larger than the per-attempt count", () => {
    expect(selectRoundQuestions(round("a", 2, 3), 5).map((q) => q.id)).toEqual(["a-q0", "a-q1"]);
    expect(selectRoundQuestions(round("a", 3), 2)).toHaveLength(3);
  });

  it("handles banks that do not divide evenly, still covering everything", () => {
    const r = round("a", 5, 2);
    const seen = new Set<string>();
    for (let attempt = 0; attempt < 5; attempt += 1) {
      for (const q of selectRoundQuestions(r, attempt)) seen.add(q.id);
    }
    expect(seen.size).toBe(5);
  });

  it("survives a nonsense attempt index instead of returning nothing", () => {
    const r = round("a", 4, 2);
    for (const bad of [-3, NaN, 1.7, Infinity]) {
      expect(selectRoundQuestions(r, bad as number)).toHaveLength(2);
    }
  });

  it("returns nothing for an empty bank rather than throwing", () => {
    expect(selectRoundQuestions(round("a", 0, 2), 0)).toEqual([]);
  });
});

describe("questionsPerAttempt", () => {
  it("never exceeds the bank and never drops to zero", () => {
    expect(questionsPerAttempt(round("a", 3, 99))).toBe(3);
    expect(questionsPerAttempt(round("a", 3, 0))).toBe(1);
    expect(questionsPerAttempt(round("a", 3))).toBe(3);
  });
});

describe("selectQuestionsForAttempt", () => {
  it("carries the round alongside each question", () => {
    const rounds = [round("a", 4, 1), round("b", 4, 2)];
    const served = selectQuestionsForAttempt(rounds, 1);
    expect(served.map((s) => s.question.id)).toEqual(["a-q1", "b-q2", "b-q3"]);
    expect(served[0].round.id).toBe("a");
    expect(served[1].round.id).toBe("b");
  });
});

describe("selectAllQuestions", () => {
  it("is the practice drill: everything, nothing withheld", () => {
    const rounds = [round("a", 4, 1), round("b", 3, 1)];
    expect(selectAllQuestions(rounds)).toHaveLength(7);
  });
});

describe("distinctAttemptsBeforeRepeat", () => {
  it("reports the shortest round cycle, which is when repeats begin", () => {
    const interview = {
      rounds: [round("a", 6, 2), round("b", 4, 2)]
    } as never as Parameters<typeof distinctAttemptsBeforeRepeat>[0];
    expect(distinctAttemptsBeforeRepeat(interview)).toBe(2);
  });
});
