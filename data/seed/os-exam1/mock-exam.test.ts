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

  it("runs for the real exam's 50 minutes", () => {
    expect(mock.timerDefaultMinutes).toBe(50);
    expect(mock.estMinutes).toBe(50);
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

  it("puts the emphasised topics where the course said the exam leans", () => {
    // Long answers: the state graph, semaphore pseudocode and Amdahl's Law.
    const longTags = new Set(written.flatMap((entry) => entry.tags));
    ["process-concept", "semaphores", "amdahls-law"].forEach((tag) => expect(longTags.has(tag), tag).toBe(true));
    // Multithreading models were emphasised too: more than one question.
    expect(choices.filter((entry) => entry.tags.includes("multithreading-models")).length).toBeGreaterThanOrEqual(2);
  });

  it("models every question on a slide or assignment item, and says which", () => {
    mock.questions.forEach((entry) => {
      const cited = (entry.references ?? []).join(" ");
      expect(cited, entry.id).toMatch(/slide|Assignment/);
    });
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
    const graph = q("os-mock-lq1");
    expect(graph.imageUrl).toBeUndefined();
    ["admitted", "dispatch", "interrupt", "completion"].forEach((word) =>
      expect(graph.prompt.toLowerCase()).not.toContain(word)
    );
  });

  it("points the state-graph model answer at a diagram that exists", () => {
    const src = /!\[[^\]]*\]\(([^)]+)\)/.exec(q("os-mock-lq1").sampleAnswer!)?.[1];
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
 * `ifChild` is `pid = fork(); if (pid == 0) { body }` — parents skip the
 * body, and a process forked inside the body inherits pid == 0. `thread`
 * is thread_create(), counted once per process that runs it.
 */
type Stmt = { fork: true } | { thread: true } | { repeat: number; body: Stmt[] } | { ifChild: Stmt[] };
type Count = { processes: number; threads: number };
function run(program: Stmt[], start: Count = { processes: 1, threads: 0 }): Count {
  return program.reduce<Count>((state, stmt) => {
    if ("fork" in stmt) return { ...state, processes: state.processes * 2 };
    if ("thread" in stmt) return { ...state, threads: state.threads + state.processes };
    if ("repeat" in stmt) {
      let current = state;
      for (let i = 0; i < stmt.repeat; i++) current = run(stmt.body, current);
      return current;
    }
    // Every process forks; only the new children run the body.
    const children: Count = run(stmt.ifChild, { processes: state.processes, threads: 0 });
    return { processes: state.processes + children.processes, threads: state.threads + children.threads };
  }, start);
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
  it("trusts the fork interpreter because it reproduces Assignment 2, Q12", () => {
    // A four-iteration loop around fork() makes 16 processes.
    expect(run([{ repeat: 4, body: [{ fork: true }] }]).processes).toBe(16);
  });

  it("counts the slide's fork and thread_create code", () => {
    // pid = fork(); if (pid == 0) { fork(); thread_create(); } fork();
    const { processes, threads } = run([{ ifChild: [{ fork: true }, { thread: true }] }, { fork: true }]);
    expect([processes, threads]).toEqual([6, 2]);
    expect(optionValue(q("os-mock-mc6"))).toBe(`${processes} processes; ${threads} threads`);
  });

  it("schedules the Round Robin question, and its distractors are SJF and FCFS", () => {
    const bursts = [6, 2, 8, 3, 4];
    const arrival = [0, 1, 2, 3, 4];
    const rr = averageWaiting(bursts, arrival, 2);
    const fcfs = averageWaiting(bursts, arrival);
    const sjf = averageWaiting(bursts, [...arrival].sort((a, b) => bursts[a] - bursts[b]));
    const entry = q("os-mock-mc9");
    expect(optionValue(entry)).toBe(`${rr.toFixed(1)} ms`);
    expect(entry.options).toContain(`${fcfs.toFixed(1)} ms`);
    expect(entry.options).toContain(`${sjf.toFixed(1)} ms`);
  });

  it("applies Amdahl's Law with the serial fraction", () => {
    const serial = 1 - 0.8;
    const speedup = (cores: number) => 1 / (serial + (1 - serial) / cores);
    const entry = q("os-mock-lq3");
    const answer = entry.sampleAnswer!;
    const marks = entry.rubric!.map((item) => item.criterion).join("\n");
    for (const value of [speedup(2), speedup(4), 1 / serial]) {
      const shown = `**${Number(value.toFixed(2))}**`;
      expect(answer).toContain(shown);
      expect(marks).toContain(shown);
    }
    // The classic slip, the parallel fraction used as S, gives a different number.
    expect((1 / (0.8 + 0.2 / 2)).toFixed(2)).not.toBe(speedup(2).toFixed(2));
  });
});
