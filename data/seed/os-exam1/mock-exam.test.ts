import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { getCourseQuizSets } from "@/data/seed";
import { gradeQuestion, summarizeAttempt } from "@/features/quiz/engine";
import type { Question } from "@/lib/types";
import { operatingSystemsExam1Mock as mock, TOPIC_LIST } from "./mock-exam";

/**
 * The Exam 1 mock: its format, its weighting, its coverage, and answers
 * recomputed here rather than trusted from the content file.
 */

const q = (id: string): Question => {
  const found = mock.questions.find((entry) => entry.id === id);
  if (!found) throw new Error(`missing ${id}`);
  return found;
};
const choices = mock.questions.filter((entry) => entry.type !== "free");
const written = mock.questions.filter((entry) => entry.type === "free");

describe("the paper's format", () => {
  it("is ten multiple-choice questions followed by three long answers", () => {
    expect(mock.questions).toHaveLength(13);
    expect(mock.questions.slice(0, 10).every((entry) => entry.type === "single")).toBe(true);
    expect(mock.questions.slice(10).every((entry) => entry.type === "free")).toBe(true);
  });

  it("keeps that order, and sits every question", () => {
    expect(mock.fixedOrder).toBe(true);
    expect(mock.questionCountTarget).toBe(13);
  });

  it("hides answers during the sitting", () => {
    expect(mock.mode).toBe("exam");
    expect(mock.isExamSimulation).toBe(false);
  });

  it("is registered on the course", () => {
    expect(getCourseQuizSets("operating-systems").some((set) => set.id === mock.id)).toBe(true);
  });
});

describe("weighting", () => {
  const total = (list: Question[]) => list.reduce((sum, entry) => sum + (entry.points ?? 1), 0);

  it("splits the paper 50% multiple choice, 50% long answer", () => {
    expect(total(choices)).toBeCloseTo(50);
    expect(total(written)).toBeCloseTo(50);
  });

  it("scores perfect multiple choice with blank long answers at exactly half", () => {
    const attempt = summarizeAttempt({
      quiz: mock,
      selectedByQuestion: Object.fromEntries(choices.map((entry) => [entry.id, entry.correct as number[]])),
      order: mock.questions.map((entry) => entry.id),
      timeSpentSeconds: 0
    });
    expect(attempt.score).toBe(50);
  });

  it("scores a full marking scheme on every long answer as full marks", () => {
    const attempt = summarizeAttempt({
      quiz: mock,
      selectedByQuestion: Object.fromEntries(choices.map((entry) => [entry.id, entry.correct as number[]])),
      rubricByQuestion: Object.fromEntries(written.map((entry) => [entry.id, entry.rubric!.map((_, i) => i)])),
      order: mock.questions.map((entry) => entry.id),
      timeSpentSeconds: 0
    });
    expect(attempt.score).toBe(100);
  });
});

describe("coverage", () => {
  it("touches all twelve topics on the topic list", () => {
    const covered = new Set(mock.questions.flatMap((entry) => entry.tags).map((tag) => TOPIC_LIST[tag]));
    expect([...covered].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it("tags every question only with topics from the list", () => {
    mock.questions.forEach((entry) => {
      entry.tags.forEach((tag) => expect(TOPIC_LIST[tag], `${entry.id}: ${tag}`).toBeDefined());
    });
  });

  it("puts the emphasised topics in the long answers", () => {
    const longTags = new Set(written.flatMap((entry) => entry.tags));
    ["process-concept", "semaphores", "multithreading-models", "amdahls-law"].forEach((tag) =>
      expect(longTags.has(tag), tag).toBe(true)
    );
  });
});

describe("every question is answerable and markable", () => {
  it("has one correct option per multiple-choice question, and only that option scores", () => {
    choices.forEach((entry) => {
      expect(entry.options, entry.id).toHaveLength(4);
      expect(entry.correct, entry.id).toHaveLength(1);
      entry.options!.forEach((_, index) => {
        expect(gradeQuestion(entry, [index]), `${entry.id} option ${index}`).toBe(entry.correct![0] === index);
      });
      expect(entry.explanation.trim().length, entry.id).toBeGreaterThan(40);
      expect(entry.walkthroughSteps?.length, entry.id).toBeGreaterThanOrEqual(3);
    });
  });

  it("gives every long answer a ten-mark scheme, a model answer, hints and a walkthrough", () => {
    written.forEach((entry) => {
      expect(entry.rubric?.reduce((sum, item) => sum + item.marks, 0), entry.id).toBe(10);
      expect(new Set(entry.rubric!.map((item) => item.criterion)).size, entry.id).toBe(entry.rubric!.length);
      expect(entry.sampleAnswer!.length, entry.id).toBeGreaterThan(300);
      expect(entry.hintSteps?.length, entry.id).toBeGreaterThan(0);
      expect(entry.walkthroughSteps?.length, entry.id).toBeGreaterThanOrEqual(4);
    });
  });

  it("does not give the state graph away in the question", () => {
    const graph = q("os-mock-b1");
    expect(graph.imageUrl).toBeUndefined();
    ["admitted", "dispatch", "interrupt", "completion"].forEach((word) =>
      expect(graph.prompt.toLowerCase()).not.toContain(word)
    );
  });

  it("points the state-graph model answer at a diagram that exists", () => {
    const src = /!\[[^\]]*\]\(([^)]+)\)/.exec(q("os-mock-b1").sampleAnswer!)?.[1];
    expect(src).toBeDefined();
    expect(existsSync(join(process.cwd(), "public", src!))).toBe(true);
  });

  it("carries no names, school or student details", () => {
    expect(JSON.stringify(mock)).not.toMatch(/texas tech|\bttu\b|jingjing|\byao\b|lasagna|R\d{8}/i);
  });
});

// ── Answers recomputed independently ───────────────────────────────────────

/**
 * A tiny fork interpreter: every process runs the same statements.
 * `ifChild` is `if (fork() == 0) { body }` — parents skip the body.
 */
type Stmt = { fork: true } | { repeat: number; body: Stmt[] } | { ifChild: Stmt[] };
function processes(program: Stmt[]) {
  const run = (statements: Stmt[], count: number): number =>
    statements.reduce((n, stmt) => {
      if ("fork" in stmt) return n * 2;
      if ("repeat" in stmt) {
        let current = n;
        for (let i = 0; i < stmt.repeat; i++) current = run(stmt.body, current);
        return current;
      }
      return n + run(stmt.ifChild, n);
    }, count);
  return run(program, 1);
}

/** Round Robin with every arrival at time 0; Infinity gives FCFS. */
function averageWaiting(bursts: number[], order: number[], quantum = Infinity) {
  const remaining = [...bursts];
  const done = bursts.map(() => 0);
  const queue = [...order];
  let clock = 0;
  while (queue.length > 0) {
    const p = queue.shift()!;
    const slice = Math.min(quantum, remaining[p]);
    clock += slice;
    remaining[p] -= slice;
    if (remaining[p] > 0) queue.push(p);
    else done[p] = clock;
  }
  return done.reduce((sum, end, i) => sum + end - bursts[i], 0) / bursts.length;
}

const optionValue = (entry: Question) => entry.options![entry.correct![0] as number];

describe("recomputed answers", () => {
  it("trusts the fork interpreter because it reproduces the course's own answers", () => {
    // Assignment 2, Q12: a four-iteration loop around fork() makes 16.
    expect(processes([{ repeat: 4, body: [{ fork: true }] }])).toBe(16);
    // Chapter 4's closing exercise: pid = fork(); if child, fork; then fork — 6.
    expect(processes([{ ifChild: [{ fork: true }] }, { fork: true }])).toBe(6);
  });

  it("counts the fork question's processes", () => {
    const answer = processes([{ repeat: 2, body: [{ fork: true }] }, { ifChild: [{ fork: true }] }]);
    expect(optionValue(q("os-mock-a7"))).toBe(String(answer));
  });

  it("schedules the Round Robin question, and its distractors are SJF and FCFS", () => {
    const bursts = [5, 3, 1, 4];
    const arrival = [0, 1, 2, 3];
    const rr = averageWaiting(bursts, arrival, 2);
    const fcfs = averageWaiting(bursts, arrival);
    const sjf = averageWaiting(bursts, [...arrival].sort((a, b) => bursts[a] - bursts[b]));
    const entry = q("os-mock-a9");
    expect(optionValue(entry)).toBe(`${rr.toFixed(2)} ms`);
    expect(entry.options).toContain(`${fcfs.toFixed(2)} ms`);
    expect(entry.options).toContain(`${sjf.toFixed(2)} ms`);
  });

  it("lets the process that did not write turn last into Peterson's critical section", () => {
    const flag = [true, true];
    let turn = 1; // P0: turn = j
    turn = 0; // P1: turn = j, written last
    const p0Waits = flag[1] && turn === 1;
    const p1Waits = flag[0] && turn === 0;
    expect([p0Waits, p1Waits]).toEqual([false, true]);
    expect(optionValue(q("os-mock-a10"))).toMatch(/^P0/);
  });

  it("applies Amdahl's Law with the serial fraction", () => {
    const serial = 1 - 0.7;
    const speedup = (cores: number) => 1 / (serial + (1 - serial) / cores);
    const entry = q("os-mock-b3");
    const answer = entry.sampleAnswer!;
    const marks = entry.rubric!.map((item) => item.criterion).join("\n");
    for (const value of [speedup(4), speedup(8), 1 / serial]) {
      expect(answer).toContain(`**${value.toFixed(2)}**`);
      expect(marks).toContain(`**${value.toFixed(2)}**`);
    }
    // The classic slip, the parallel fraction used as S, gives a different number.
    expect((1 / (0.7 + 0.3 / 4)).toFixed(2)).not.toBe(speedup(4).toFixed(2));
  });
});
