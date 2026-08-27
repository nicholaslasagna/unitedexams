import { describe, expect, it } from "vitest";
import { companyInterviews, interviewQuestions } from "../../data/seed/interviews";

/**
 * Guards the interview content itself. These catch the failures that would
 * silently break the product: an unsolvable test fixture, a starter template
 * whose function name doesn't match what the runner calls, or an id that
 * stops attempts from persisting.
 */

const allQuestions = companyInterviews.flatMap((i) => interviewQuestions(i));
const codingQuestions = allQuestions.filter((q) => q.coding);

/** Same structural equality the sandboxed worker uses. */
const equal = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/** Reference solutions — one per shipped coding question. */
const solutions: Record<string, (...args: never[]) => unknown> = {
  usersOverRateLimit: (...args: never[]) => {
    const [logs, limit = 20, windowSeconds = 60] = args as unknown as [
      [string, number][],
      number,
      number
    ];
    const byUser = new Map<string, number[]>();
    for (const [u, t] of logs) {
      if (!byUser.has(u)) byUser.set(u, []);
      byUser.get(u)!.push(t);
    }
    const out: string[] = [];
    for (const [u, ts] of byUser) {
      ts.sort((a, b) => a - b);
      let l = 0;
      for (let r = 0; r < ts.length; r += 1) {
        while (ts[r] - ts[l] >= windowSeconds) l += 1;
        if (r - l + 1 > limit) {
          out.push(u);
          break;
        }
      }
    }
    return out.sort();
  },
  minMeetingRooms: (...args: never[]) => {
    const [intervals] = args as unknown as [[number, number][]];
    const starts = intervals.map((i) => i[0]).sort((a, b) => a - b);
    const ends = intervals.map((i) => i[1]).sort((a, b) => a - b);
    let rooms = 0;
    let best = 0;
    let j = 0;
    for (let i = 0; i < starts.length; i += 1) {
      while (j < ends.length && ends[j] <= starts[i]) {
        rooms -= 1;
        j += 1;
      }
      rooms += 1;
      best = Math.max(best, rooms);
    }
    return best;
  },
  runLru: (...args: never[]) => {
    const [capacity, ops] = args as unknown as [number, [string, number, number?][]];
    const map = new Map<number, number>();
    const out: number[] = [];
    for (const [kind, key, value] of ops) {
      if (kind === "put") {
        if (map.has(key)) map.delete(key);
        map.set(key, value as number);
        if (map.size > capacity) map.delete(map.keys().next().value as number);
      } else if (!map.has(key)) {
        out.push(-1);
      } else {
        const held = map.get(key)!;
        map.delete(key);
        map.set(key, held);
        out.push(held);
      }
    }
    return out;
  },
  nextRetryDelayMs: (...args: never[]) => {
    const [attempt, opts] = args as unknown as [
      number,
      { baseMs: number; maxMs: number; status?: number; retryAfterSeconds?: number }
    ];
    if (opts.status && opts.status < 500 && opts.status !== 429) return -1;
    if (typeof opts.retryAfterSeconds === "number") return opts.retryAfterSeconds * 1000;
    return Math.min(opts.maxMs, opts.baseMs * 2 ** attempt);
  },
  fitToBudget: (...args: never[]) => {
    const [turns, budget] = args as unknown as [
      { id: string; role: string; text: string }[],
      number
    ];
    const count = (t: string) => (t.trim() === "" ? 0 : t.trim().split(/\s+/).length);
    const locked = new Set<number>();
    turns.forEach((t, i) => {
      if (t.role === "system") locked.add(i);
    });
    for (let i = turns.length - 1; i >= 0; i -= 1) {
      if (turns[i].role === "user") {
        locked.add(i);
        break;
      }
    }
    const keep = turns.map((_, i) => i);
    let total = turns.reduce((sum, t) => sum + count(t.text), 0);
    const dropped: string[] = [];
    for (let i = 0; i < turns.length && total > budget; i += 1) {
      if (locked.has(i)) continue;
      const pos = keep.indexOf(i);
      if (pos >= 0) {
        keep.splice(pos, 1);
        total -= count(turns[i].text);
        dropped.push(turns[i].id);
      }
    }
    return { kept: keep.map((i) => turns[i].id), dropped };
  }
};

describe("interview content integrity", () => {
  it("ships at least one interview per named company", () => {
    expect(companyInterviews.map((i) => i.company).sort()).toEqual([
      "Anthropic",
      "Apple",
      "Google",
      "Meta",
      "OpenAI"
    ]);
  });

  it("uses UUID-shaped ids so attempts persist and reach the leaderboard", () => {
    // lib/storage/supabase-repository.ts only writes to Postgres when
    // isUuidLike(quizId) passes. A slug id here would silently downgrade
    // every interview score to localStorage-only.
    const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    for (const interview of companyInterviews) {
      expect(interview.id, `${interview.company} id`).toMatch(uuid);
    }
    expect(new Set(companyInterviews.map((i) => i.id)).size).toBe(companyInterviews.length);
  });

  it("has unique question and signal ids", () => {
    const qIds = allQuestions.map((q) => q.id);
    expect(new Set(qIds).size).toBe(qIds.length);
    const sIds = allQuestions.flatMap((q) => q.signals.map((s) => s.id));
    expect(new Set(sIds).size).toBe(sIds.length);
  });

  it("gives every question a usable rubric", () => {
    for (const q of allQuestions) {
      expect(q.signals.length, q.id).toBeGreaterThanOrEqual(3);
      for (const s of q.signals) {
        expect(s.weight, `${s.id} weight`).toBeGreaterThan(0);
        // The hint is the "how to improve" the product promises.
        expect(s.hint.length, `${s.id} hint`).toBeGreaterThan(40);
      }
      expect(q.strongAnswer.length, `${q.id} model answer`).toBeGreaterThan(120);
    }
  });

  it("names the tested function in every starter template", () => {
    for (const q of codingQuestions) {
      const workspace = q.coding!;
      expect(workspace.starterCode, q.id).toContain(workspace.functionName);
      expect(workspace.tests.length, q.id).toBeGreaterThanOrEqual(3);
      expect(workspace.weight).toBeGreaterThan(0);
    }
  });

  it("every shipped coding question is solvable and its fixtures are correct", () => {
    expect(codingQuestions.length).toBeGreaterThanOrEqual(5);
    for (const q of codingQuestions) {
      const workspace = q.coding!;
      const solve = solutions[workspace.functionName];
      expect(solve, `no reference solution for ${workspace.functionName}`).toBeTypeOf("function");
      for (const test of workspace.tests) {
        const actual = solve(...(JSON.parse(JSON.stringify(test.args)) as never[]));
        expect(
          equal(actual, test.expected),
          `${workspace.functionName} / ${test.name}: got ${JSON.stringify(actual)}, expected ${JSON.stringify(test.expected)}`
        ).toBe(true);
      }
    }
  });
});

describe("free vs premium split", () => {
  it("gives every company at least one fully-free round", () => {
    for (const interview of companyInterviews) {
      const free = interview.rounds.filter((r) => !r.premium);
      expect(free.length, `${interview.company} free rounds`).toBeGreaterThanOrEqual(1);
      // The free round must be a real interview, not a preview: questions,
      // rubric, follow-ups and a model answer all present.
      for (const round of free) {
        expect(round.questions.length, `${interview.company} free questions`).toBeGreaterThanOrEqual(1);
        for (const q of round.questions) {
          expect(q.signals.length).toBeGreaterThanOrEqual(3);
          expect(q.strongAnswer.length).toBeGreaterThan(120);
        }
      }
    }
  });

  it("keeps the runnable coding round free for every company that has one", () => {
    for (const interview of companyInterviews) {
      const codingRounds = interview.rounds.filter((r) => r.questions.some((q) => q.coding));
      for (const round of codingRounds) {
        expect(round.premium, `${interview.company} coding round must be free`).toBeFalsy();
      }
    }
  });

  it("reserves the rest of the loop, and the loop stages, for premium", () => {
    for (const interview of companyInterviews) {
      expect(
        interview.rounds.some((r) => r.premium),
        `${interview.company} should have premium rounds`
      ).toBe(true);
      expect(interview.loopStages.length, `${interview.company} loop stages`).toBeGreaterThanOrEqual(3);
      for (const stage of interview.loopStages) {
        expect(stage.whatHappens.length).toBeGreaterThan(80);
        expect(stage.howToPrepare.length).toBeGreaterThanOrEqual(3);
      }
    }
  });
});

describe("free tier promise", () => {
  it("gives every company a runnable coding round for free", () => {
    for (const interview of companyInterviews) {
      const freeCoding = interview.rounds
        .filter((r) => !r.premium)
        .flatMap((r) => r.questions)
        .filter((q) => q.coding);
      expect(freeCoding.length, `${interview.company} needs free runnable code`).toBeGreaterThanOrEqual(1);
    }
  });
});
