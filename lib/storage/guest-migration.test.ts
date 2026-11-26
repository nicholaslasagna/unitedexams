import type { SupabaseClient, User } from "@supabase/supabase-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { migrateGuestAttemptsToAccount } from "@/lib/storage/guest-migration";
import { getLocalRepository } from "@/lib/storage/local-repository";
import { SupabaseRepository } from "@/lib/storage/supabase-repository";
import type { Attempt } from "@/lib/types";

const userId = "f4ae4354-6a28-40cf-b5f0-a47297a46ab2";
const quizId = "e36bbab1-e8f3-4ef2-8bea-69fb07323665";

function attempt(id: string, quiz = quizId): Attempt {
  return {
    id,
    quizId: quiz,
    courseId: "course",
    date: "2026-10-30T10:00:00Z",
    score: 100,
    correctCount: 2,
    totalCount: 2,
    timeSpent: 12,
    perQuestionResults: [
      { questionId: "same-question", questionType: "single", selected: [0], correct: [0], isCorrect: true, tags: [] },
      { questionId: "same-question", questionType: "single", selected: [1], correct: [1], isCorrect: true, tags: [] }
    ],
    topicBreakdown: {}
  };
}

type Row = { id: string; user_id?: string; quiz_set_id?: string; attempt_id?: string };

function fakeCloud() {
  const attempts = new Map<string, Row>();
  const answers = new Map<string, Row>();
  const faults = { rejectAttempt: false, loseAttemptResponse: false, loseAnswerResponse: false };
  const client = {
    from(table: string) {
      const filters = new Map<string, string>();
      const query = {
        select: () => query,
        eq: (key: string, value: string) => { filters.set(key, value); return query; },
        not: () => query,
        order: () => query,
        gte: () => query,
        lt: () => query,
        limit: async () => ({ data: [], error: null }),
        maybeSingle: async () => ({ data: { id: userId }, error: null }),
        single: async () => {
          const row = attempts.get(filters.get("id") ?? "");
          return { data: row?.user_id === filters.get("user_id") ? row : null, error: null };
        },
        upsert: async (payload: Row | Row[], options: { onConflict: string; ignoreDuplicates: boolean }) => {
          expect(options).toEqual({ onConflict: "id", ignoreDuplicates: true });
          const isAttempt = table === "attempts";
          if (isAttempt && faults.rejectAttempt) return { error: { message: "denied" } };
          const target = isAttempt ? attempts : answers;
          for (const row of Array.isArray(payload) ? payload : [payload]) {
            if (!target.has(row.id)) target.set(row.id, row);
          }
          if (isAttempt && faults.loseAttemptResponse) {
            faults.loseAttemptResponse = false;
            return { error: { message: "lost attempt response" } };
          }
          if (!isAttempt && faults.loseAnswerResponse) {
            faults.loseAnswerResponse = false;
            return { error: { message: "lost answer response" } };
          }
          return { error: null };
        }
      };
      return query;
    }
  };
  return {
    attempts,
    answers,
    faults,
    repo: (id = userId) => new SupabaseRepository(client as unknown as SupabaseClient, { id } as User)
  };
}

describe("guest attempt migration", () => {
  const guestRepository = getLocalRepository();

  beforeEach(() => {
    const local = new Map<string, string>();
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (k: string) => local.get(k) ?? null,
        setItem: (k: string, v: string) => local.set(k, v),
        removeItem: (k: string) => local.delete(k)
      }
    });
  });
  afterEach(() => vi.unstubAllGlobals());

  it("keeps unsupported local-only attempts and removes only confirmed cloud copies", async () => {
    const local = attempt("local", "static-quiz");
    await guestRepository.saveAttempt(local);
    await guestRepository.saveAttempt(attempt("supported"));
    const cloud = fakeCloud();
    expect(await migrateGuestAttemptsToAccount({ guestRepository, accountRepository: cloud.repo() }))
      .toEqual({ migratedCount: 1, failed: false });
    expect(await guestRepository.getAttempts()).toEqual([local]);
    expect(cloud.attempts.size).toBe(1);
    expect(cloud.answers.size).toBe(2);
  });

  it("keeps attempts after a rejected write and retries in the same session", async () => {
    const original = attempt("rejected");
    await guestRepository.saveAttempt(original);
    const cloud = fakeCloud();
    const accountRepository = cloud.repo();
    cloud.faults.rejectAttempt = true;
    expect(await migrateGuestAttemptsToAccount({ guestRepository, accountRepository }))
      .toEqual({ migratedCount: 0, failed: true });
    expect(await guestRepository.getAttempts()).toEqual([original]);
    expect(cloud.attempts.size).toBe(0);
    cloud.faults.rejectAttempt = false;
    expect(await migrateGuestAttemptsToAccount({ guestRepository, accountRepository }))
      .toEqual({ migratedCount: 1, failed: false });
    expect(await guestRepository.getAttempts()).toEqual([]);
  });

  it.each(["loseAttemptResponse", "loseAnswerResponse"] as const)(
    "retries without duplicate attempts or answers after %s",
    async (fault) => {
      const original = attempt("unstable");
      await guestRepository.saveAttempt(original);
      const cloud = fakeCloud();
      cloud.faults[fault] = true;
      expect(await migrateGuestAttemptsToAccount({ guestRepository, accountRepository: cloud.repo() }))
        .toEqual({ migratedCount: 0, failed: true });
      expect(cloud.attempts.size).toBe(1);
      expect(await guestRepository.getAttempts()).toEqual([original]);
      expect(await migrateGuestAttemptsToAccount({ guestRepository, accountRepository: cloud.repo() }))
        .toEqual({ migratedCount: 1, failed: false });
      expect(await guestRepository.getAttempts()).toEqual([]);
      expect(cloud.attempts.size).toBe(1);
      expect(cloud.answers.size).toBe(2);
    }
  );

  it("preserves a concurrent new attempt and failed records after a partial batch succeeds", async () => {
    const retained = attempt("failed");
    const newAttempt = attempt("new");
    await guestRepository.saveAttempt(attempt("saved"));
    await guestRepository.saveAttempt(retained);
    const accountRepository = {
      async saveGuestAttempt(entry: Attempt) {
        if (entry.id === retained.id) throw new Error("synthetic failure");
        await guestRepository.saveAttempt(newAttempt);
        return "saved" as const;
      }
    };
    expect(await migrateGuestAttemptsToAccount({ guestRepository, accountRepository }))
      .toEqual({ migratedCount: 1, failed: true });
    expect(await guestRepository.getAttempts()).toEqual([newAttempt, retained]);
  });

  it("scopes stable retry IDs to the signed-in account", async () => {
    const cloud = fakeCloud();
    const sameLocalId = attempt("same");
    await cloud.repo().saveGuestAttempt(sameLocalId);
    await cloud.repo("294b2238-2ab7-4edb-acc0-b714f9d3f919").saveGuestAttempt(sameLocalId);
    expect(cloud.attempts.size).toBe(2);
    expect(cloud.answers.size).toBe(4);
  });
});
