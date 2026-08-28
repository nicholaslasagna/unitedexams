import { describe, expect, it } from "vitest";
import { companyInterviews, interviewQuestions } from "../../data/seed/interviews";
import {
  distinctAttemptsBeforeRepeat,
  questionsPerAttempt,
  selectAllQuestions,
  selectRoundQuestions
} from "../../lib/interviews/select-questions";

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
  },
  topPathsByBytes: (...args: never[]) => {
    const [records, k] = args as unknown as [[string, number][], number];
    const totals = new Map<string, number>();
    for (const [path, bytes] of records) totals.set(path, (totals.get(path) ?? 0) + bytes);
    return [...totals.entries()]
      .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
      .slice(0, Math.max(0, k))
      .map(([path]) => path);
  },
  longestUniqueRun: (...args: never[]) => {
    const [ids] = args as unknown as [string[]];
    const lastSeen = new Map<string, number>();
    let left = 0;
    let best = 0;
    for (let right = 0; right < ids.length; right += 1) {
      const id = ids[right];
      if (lastSeen.has(id)) left = Math.max(left, lastSeen.get(id)! + 1);
      lastSeen.set(id, right);
      best = Math.max(best, right - left + 1);
    }
    return best;
  },
  repairParens: (...args: never[]) => {
    const [text] = args as unknown as [string];
    const drop = new Set<number>();
    const open: number[] = [];
    for (let i = 0; i < text.length; i += 1) {
      const c = text[i];
      if (c === "(") open.push(i);
      else if (c === ")") {
        if (open.length) open.pop();
        else drop.add(i);
      }
    }
    for (const i of open) drop.add(i);
    return [...text].filter((_, i) => !drop.has(i)).join("");
  },
  kClosestPoints: (...args: never[]) => {
    const [points, k] = args as unknown as [[number, number][], number];
    const n = Math.max(0, Math.min(k, points.length));
    return [...points]
      .sort(
        (a, b) =>
          a[0] * a[0] + a[1] * a[1] - (b[0] * b[0] + b[1] * b[1]) || a[0] - b[0] || a[1] - b[1]
      )
      .slice(0, n);
  },
  mergeBookings: (...args: never[]) => {
    const [ranges] = args as unknown as [[number, number][]];
    if (ranges.length === 0) return [];
    const sorted = [...ranges].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const out: [number, number][] = [[sorted[0][0], sorted[0][1]]];
    for (let i = 1; i < sorted.length; i += 1) {
      const cur = out[out.length - 1];
      const next = sorted[i];
      if (next[0] <= cur[1]) cur[1] = Math.max(cur[1], next[1]);
      else out.push([next[0], next[1]]);
    }
    return out;
  },
  compareVersions: (...args: never[]) => {
    const [a, b] = args as unknown as [string, string];
    const pa = a.split(".");
    const pb = b.split(".");
    for (let i = 0; i < Math.max(pa.length, pb.length); i += 1) {
      const x = Number(pa[i] ?? 0);
      const y = Number(pb[i] ?? 0);
      if (x < y) return -1;
      if (x > y) return 1;
    }
    return 0;
  },
  ringBufferContents: (...args: never[]) => {
    const [capacity, pushes] = args as unknown as [number, unknown[]];
    if (capacity <= 0) return [];
    const buf = new Array<unknown>(capacity);
    let write = 0;
    let count = 0;
    for (const v of pushes) {
      buf[write % capacity] = v;
      write += 1;
      count = Math.min(count + 1, capacity);
    }
    const start = count < capacity ? 0 : write % capacity;
    return Array.from({ length: count }, (_, i) => buf[(start + i) % capacity]);
  },
  packIntoBatches: (...args: never[]) => {
    const [segments, budget] = args as unknown as [[string, number][], number];
    const out: string[][] = [];
    let cur: string[] = [];
    let total = 0;
    for (const [text, tokens] of segments) {
      if (cur.length > 0 && total + tokens > budget) {
        out.push(cur);
        cur = [];
        total = 0;
      }
      cur.push(text);
      total += tokens;
    }
    if (cur.length) out.push(cur);
    return out;
  },
  assembleStream: (...args: never[]) => {
    const [chunks] = args as unknown as [[number, string][]];
    const byIndex = new Map<number, string>();
    for (const [i, text] of chunks) if (!byIndex.has(i)) byIndex.set(i, text);
    return [...byIndex.keys()]
      .sort((x, y) => x - y)
      .map((i) => byIndex.get(i))
      .join("");
  },
  collapseRepeatedCalls: (...args: never[]) => {
    const [calls] = args as unknown as [[string, string][]];
    const out: [string, string][] = [];
    for (const c of calls) {
      const last = out[out.length - 1];
      if (last && last[0] === c[0] && last[1] === c[1]) continue;
      out.push([c[0], c[1]]);
    }
    return out;
  },
  chooseWithinBudget: (...args: never[]) => {
    const [docs, budget] = args as unknown as [[string, number, number][], number];
    const sorted = [...docs].sort(
      (a, b) => b[2] - a[2] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0)
    );
    const chosen: string[] = [];
    let used = 0;
    for (const [id, tokens] of sorted) {
      if (used + tokens <= budget) {
        chosen.push(id);
        used += tokens;
      }
    }
    return chosen;
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

describe("a retake is a different interview, and nothing is unreachable", () => {
  /*
   * The three properties this section exists to hold:
   *   1. every round has a bank deep enough to rotate;
   *   2. consecutive sittings do not repeat questions;
   *   3. practice mode can reach every question in the bank.
   *
   * Before this, each round held exactly one question, so a retake replayed
   * the identical prompts and the whole exercise degraded into memorising
   * this site rather than preparing for the interview.
   */
  it("gives every round a bank bigger than one sitting", () => {
    for (const interview of companyInterviews) {
      for (const round of interview.rounds) {
        expect(
          round.questions.length,
          `${interview.company} / ${round.name} has only ${round.questions.length} question(s)`
        ).toBeGreaterThan(questionsPerAttempt(round));
      }
    }
  });

  it("serves different questions on consecutive sittings, in every round", () => {
    for (const interview of companyInterviews) {
      for (const round of interview.rounds) {
        const first = selectRoundQuestions(round, 0).map((q) => q.id);
        const second = selectRoundQuestions(round, 1).map((q) => q.id);
        expect(first.length).toBe(questionsPerAttempt(round));
        expect(
          first.filter((id) => second.includes(id)),
          `${interview.company} / ${round.name} repeats a question on the very next attempt`
        ).toEqual([]);
      }
    }
  });

  it("lets every company be sat at least twice before anything repeats", () => {
    for (const interview of companyInterviews) {
      expect(
        distinctAttemptsBeforeRepeat(interview),
        `${interview.company} repeats questions on the second sitting`
      ).toBeGreaterThanOrEqual(2);
    }
  });

  it("reaches every question in a round by rotating through the sittings", () => {
    for (const interview of companyInterviews) {
      for (const round of interview.rounds) {
        const seen = new Set<string>();
        const sittings = Math.ceil(round.questions.length / questionsPerAttempt(round));
        for (let attempt = 0; attempt < sittings; attempt += 1) {
          for (const q of selectRoundQuestions(round, attempt)) seen.add(q.id);
        }
        expect(
          seen.size,
          `${interview.company} / ${round.name}: rotation reaches ${seen.size} of ${round.questions.length}`
        ).toBe(round.questions.length);
      }
    }
  });

  it("practice mode reaches every question in every open round", () => {
    for (const interview of companyInterviews) {
      const served = selectAllQuestions(interview.rounds).map((s) => s.question.id);
      const everything = interviewQuestions(interview).map((q) => q.id);
      expect(served.sort()).toEqual(everything.sort());
    }
  });

  it("keeps a free candidate's bank rotating too, not just the premium rounds", () => {
    for (const interview of companyInterviews) {
      const freeRounds = interview.rounds.filter((r) => !r.premium);
      expect(freeRounds.length).toBeGreaterThan(0);
      for (const round of freeRounds) {
        const first = selectRoundQuestions(round, 0).map((q) => q.id);
        const second = selectRoundQuestions(round, 1).map((q) => q.id);
        expect(
          first.filter((id) => second.includes(id)),
          `${interview.company}: the free round repeats on a retake`
        ).toEqual([]);
      }
    }
  });

  it("holds every bank question to the same rubric standard as the originals", () => {
    // A shallow bank entry would make a retake technically different but
    // materially worse, which defeats the point.
    for (const question of allQuestions) {
      expect(question.signals.length, `${question.id} has too few signals`).toBeGreaterThanOrEqual(4);
      expect(question.strongAnswer.length, `${question.id} strongAnswer too thin`).toBeGreaterThan(300);
      expect(question.prompt.length, `${question.id} prompt too thin`).toBeGreaterThan(60);
      for (const signal of question.signals) {
        expect(signal.hint.length, `${question.id}/${signal.id} hint too thin`).toBeGreaterThan(40);
        expect(signal.weight).toBeGreaterThan(0);
      }
    }
  });
});
