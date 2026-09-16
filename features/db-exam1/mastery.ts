/**
 * Exam 1 readiness, derived from attempts the learner actually made.
 *
 * Nothing here is invented. Every number traces back to a recorded answer, so
 * a readiness figure of 0% means no practice has happened — not that the
 * learner is unprepared in some modelled sense. Topics never attempted count
 * as zero toward readiness, which is honest: you are not ready for a topic you
 * have not touched.
 *
 * Two integration decisions matter:
 *
 *   - Lab attempts use their own `quizId` namespace. `courseProgress()`
 *     averages best scores across the course's registered quiz sets, so
 *     registering fourteen lab sets would have silently diluted the existing
 *     Databases progress figure. This way the lab adds signal without moving
 *     a number that already means something.
 *   - Mastery is read from `perQuestionResults`, not from `topicBreakdown`,
 *     so recency can be applied per question rather than per session.
 */

import type { Attempt, PerQuestionResult } from "@/lib/types";
import type { MistakeTag } from "./mistakes";
import { TOPICS, TOPIC_IDS, type TopicId } from "./topics";

export const DB_EXAM1_COURSE_ID = "database-systems";

/** Exam 1 — Thursday 17 September 2026, Texas Tech (America/Chicago). */
export const EXAM_DATE = "2026-09-17";

/** Lubbock civil calendar — the exam's timezone, not the server's. */
const EXAM_TIMEZONE = "America/Chicago";

function ymdInZone(date: Date, timeZone: string): { y: number; m: number; d: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric"
  }).formatToParts(date);
  const num = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);
  return { y: num("year"), m: num("month"), d: num("day") };
}

/** Whole calendar days from `today` until Exam 1, in America/Chicago. */
export function daysUntilExam(today = new Date()): number {
  const [year, month, day] = EXAM_DATE.split("-").map(Number);
  const examDay = Date.UTC(year, month - 1, day);
  const chicago = ymdInZone(today, EXAM_TIMEZONE);
  const todayDay = Date.UTC(chicago.y, chicago.m - 1, chicago.d);
  return Math.max(0, Math.round((examDay - todayDay) / 86400000));
}

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

/** "Thursday, September 17, 2026" — no locale APIs, so SSR and the client cannot disagree. */
export function formatExamDate(long = true): string {
  const [year, month, day] = EXAM_DATE.split("-").map(Number);
  const weekday = WEEKDAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
  const monthName = MONTHS[month - 1];
  return long ? `${weekday}, ${monthName} ${day}, ${year}` : `${monthName} ${day}`;
}

/** Namespace for every attempt the Exam 1 experience records. */
export const LAB_QUIZ_PREFIX = "db-exam1:";

export type LabMode =
  | "learn"
  | "drill"
  | "study-guide"
  | "table-lab"
  | "division-lab"
  | "key-lab"
  | "trainer"
  | "mock-exam"
  | "cram";

export function labQuizId(mode: LabMode): string {
  return `${LAB_QUIZ_PREFIX}${mode}`;
}

export function isLabAttempt(attempt: Attempt): boolean {
  return attempt.quizId.startsWith(LAB_QUIZ_PREFIX);
}

const MODE_TITLES: Record<LabMode, string> = {
  learn: "Exam 1 — Guided practice",
  drill: "Exam 1 — Focused drill",
  "study-guide": "Exam 1 — Study-guide set",
  "table-lab": "Exam 1 — Table Lab",
  "division-lab": "Exam 1 — Division Lab",
  "key-lab": "Exam 1 — Keys & Integrity Lab",
  trainer: "Exam 1 — English ↔ algebra",
  "mock-exam": "Exam 1 — Mock exam",
  cram: "Exam 1 — Final review"
};

/**
 * Title for a lab attempt.
 *
 * `recentAttempts()` resolves titles through `getQuizSet()`, which knows
 * nothing about synthetic ids and would otherwise label every one of these
 * "Quiz" in the dashboard's activity list.
 */
export function labAttemptTitle(quizId: string): string | null {
  if (!quizId.startsWith(LAB_QUIZ_PREFIX)) return null;
  const mode = quizId.slice(LAB_QUIZ_PREFIX.length) as LabMode;
  return MODE_TITLES[mode] ?? "Exam 1 practice";
}

// ── Per-question history ──────────────────────────────────────────────────

export interface TopicEvent {
  topic: TopicId;
  correct: boolean;
  date: string;
  questionId: string;
  mistakes: MistakeTag[];
}

const TOPIC_SET = new Set<string>(TOPIC_IDS);

function eventsFromResult(
  result: PerQuestionResult,
  date: string
): TopicEvent[] {
  return result.tags
    .filter((tag) => TOPIC_SET.has(tag))
    .map((tag) => ({
      topic: tag as TopicId,
      correct: result.isCorrect,
      date,
      questionId: result.questionId,
      mistakes: (result.mistakes ?? []) as MistakeTag[]
    }));
}

/** Every answered lab question, newest first. */
export function labEvents(attempts: Attempt[]): TopicEvent[] {
  return attempts
    .filter(isLabAttempt)
    .flatMap((attempt) =>
      attempt.perQuestionResults.flatMap((result) => eventsFromResult(result, attempt.date))
    )
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

// ── Topic mastery ─────────────────────────────────────────────────────────

export type MasteryLevel = "not-started" | "weak" | "learning" | "mastered";

export interface TopicMastery {
  topic: TopicId;
  /** Questions answered on this topic, within the recency window. */
  attempted: number;
  correct: number;
  /** 0–100, or 0 when nothing has been attempted. */
  score: number;
  level: MasteryLevel;
  lastSeen: string | null;
  /** Total answered ever, including outside the recency window. */
  lifetimeAttempted: number;
}

/**
 * How many recent answers per topic are counted.
 *
 * Someone who misread three join questions on Monday and has answered six
 * correctly since should not still be shown as weak. A fixed window reflects
 * current understanding without throwing evidence away after a single lucky
 * guess — which a "last answer wins" rule would.
 */
const RECENCY_WINDOW = 12;

/** Enough answers to distinguish understanding from a coin flip. */
const CONFIDENCE_THRESHOLD = 4;

function levelFor(attempted: number, score: number): MasteryLevel {
  if (attempted === 0) return "not-started";
  if (attempted >= 2 && score < 60) return "weak";
  if (attempted >= CONFIDENCE_THRESHOLD && score >= 85) return "mastered";
  return "learning";
}

export function topicMastery(attempts: Attempt[]): TopicMastery[] {
  const events = labEvents(attempts);
  const byTopic = new Map<TopicId, TopicEvent[]>();

  events.forEach((event) => {
    const list = byTopic.get(event.topic) ?? [];
    list.push(event);
    byTopic.set(event.topic, list);
  });

  return TOPICS.map((topic) => {
    const all = byTopic.get(topic.id) ?? [];
    const recent = all.slice(0, RECENCY_WINDOW);
    const correct = recent.filter((event) => event.correct).length;
    const score = recent.length > 0 ? Math.round((correct / recent.length) * 100) : 0;

    return {
      topic: topic.id,
      attempted: recent.length,
      correct,
      score,
      level: levelFor(recent.length, score),
      lastSeen: all[0]?.date ?? null,
      lifetimeAttempted: all.length
    };
  });
}

export function masteryByTopic(attempts: Attempt[]): Record<TopicId, TopicMastery> {
  return Object.fromEntries(
    topicMastery(attempts).map((entry) => [entry.topic, entry])
  ) as Record<TopicId, TopicMastery>;
}

// ── Readiness ─────────────────────────────────────────────────────────────

export interface Readiness {
  /** 0–100, weighted by how much of the exam each topic represents. */
  percent: number;
  topicsMastered: number;
  topicsStarted: number;
  topicsTotal: number;
  questionsAnswered: number;
  /** Accuracy across every lab question ever answered. */
  accuracy: number;
  daysUntilExam: number;
}

export function readiness(attempts: Attempt[], today = new Date()): Readiness {
  const mastery = topicMastery(attempts);
  const events = labEvents(attempts);

  const totalWeight = TOPICS.reduce((sum, topic) => sum + topic.weight, 0);
  const earned = mastery.reduce((sum, entry) => {
    const weight = TOPICS.find((topic) => topic.id === entry.topic)?.weight ?? 1;
    // A topic with too little evidence cannot count for full credit, however
    // well those few answers went — one correct answer is not mastery.
    const confidence =
      entry.attempted >= CONFIDENCE_THRESHOLD
        ? 1
        : entry.attempted / CONFIDENCE_THRESHOLD;
    return sum + weight * (entry.score / 100) * confidence;
  }, 0);

  const correct = events.filter((event) => event.correct).length;

  return {
    percent: Math.round((earned / totalWeight) * 100),
    topicsMastered: mastery.filter((entry) => entry.level === "mastered").length,
    topicsStarted: mastery.filter((entry) => entry.level !== "not-started").length,
    topicsTotal: TOPICS.length,
    questionsAnswered: events.length,
    accuracy: events.length > 0 ? Math.round((correct / events.length) * 100) : 0,
    daysUntilExam: daysUntilExam(today)
  };
}

// ── What to work on next ──────────────────────────────────────────────────

/**
 * Weakest topics, worst first.
 *
 * Untouched topics are excluded — they are "not started", which is a
 * different message from "you keep getting this wrong" and belongs in a
 * different part of the UI.
 */
export function weakestTopics(attempts: Attempt[], limit = 4): TopicMastery[] {
  return topicMastery(attempts)
    .filter((entry) => entry.level === "weak" || entry.level === "learning")
    .filter((entry) => entry.attempted > 0)
    .sort((a, b) => a.score - b.score || b.attempted - a.attempted)
    .slice(0, limit);
}

/** Running tally of misconceptions across all recorded lab answers. */
export function mistakeCounts(attempts: Attempt[]): Partial<Record<MistakeTag, number>> {
  const counts: Partial<Record<MistakeTag, number>> = {};
  labEvents(attempts).forEach((event) => {
    event.mistakes.forEach((tag) => {
      counts[tag] = (counts[tag] ?? 0) + 1;
    });
  });
  return counts;
}

/** Topics missed in the last few sessions, newest first. */
export function recentlyMissed(attempts: Attempt[], limit = 5): TopicEvent[] {
  const seen = new Set<TopicId>();
  return labEvents(attempts)
    .filter((event) => !event.correct)
    .filter((event) => {
      if (seen.has(event.topic)) return false;
      seen.add(event.topic);
      return true;
    })
    .slice(0, limit);
}

/**
 * The single topic to continue with.
 *
 * Prefer repairing something weak over starting something new — a learner
 * with a broken understanding of outer joins gains more from fixing that than
 * from meeting division. Otherwise walk the prerequisite order and pick the
 * first topic not yet mastered.
 */
export function nextTopic(attempts: Attempt[]): TopicId {
  const mastery = masteryByTopic(attempts);

  const weak = topicMastery(attempts)
    .filter((entry) => entry.level === "weak")
    .sort((a, b) => a.score - b.score)[0];
  if (weak) return weak.topic;

  const ordered = TOPICS.map((topic) => topic.id);
  const unstarted = ordered.find((id) => mastery[id].level === "not-started");
  if (unstarted) return unstarted;

  const learning = ordered.find((id) => mastery[id].level === "learning");
  return learning ?? ordered[0];
}

/** Topics in the recommended order, with their current state attached. */
export function pathWithMastery(attempts: Attempt[]) {
  const mastery = masteryByTopic(attempts);
  return TOPICS.map((topic) => ({
    ...topic,
    mastery: mastery[topic.id],
    /** True when every prerequisite is at least "learning". */
    ready: topic.prerequisites.every(
      (prerequisite) => mastery[prerequisite].level !== "not-started"
    )
  }));
}

// ── Recording an attempt ──────────────────────────────────────────────────

export interface RecordedAnswer {
  questionId: string;
  topic: TopicId;
  correct: boolean;
  mistakes: MistakeTag[];
}

/**
 * Build an `Attempt` from a finished lab session.
 *
 * Deliberately produces the same shape the quiz engine produces, so streaks,
 * the activity feed and course analytics pick it up without special cases.
 */
export function buildLabAttempt({
  mode,
  answers,
  timeSpentSeconds,
  date = new Date().toISOString()
}: {
  mode: LabMode;
  answers: RecordedAnswer[];
  timeSpentSeconds: number;
  date?: string;
}): Attempt {
  const perQuestionResults: PerQuestionResult[] = answers.map((answer) => ({
    questionId: answer.questionId,
    questionType: "single",
    isCorrect: answer.correct,
    selected: [],
    correct: [],
    tags: [answer.topic],
    mistakes: answer.mistakes.length > 0 ? answer.mistakes : undefined
  }));

  const topicBreakdown: Attempt["topicBreakdown"] = {};
  answers.forEach((answer) => {
    const entry = topicBreakdown[answer.topic] ?? { correct: 0, total: 0 };
    entry.total += 1;
    if (answer.correct) entry.correct += 1;
    topicBreakdown[answer.topic] = entry;
  });

  const correctCount = answers.filter((answer) => answer.correct).length;

  return {
    id: `${LAB_QUIZ_PREFIX}${mode}-${date}-${Math.random().toString(36).slice(2, 8)}`,
    quizId: labQuizId(mode),
    courseId: DB_EXAM1_COURSE_ID,
    mode: mode === "mock-exam" ? "exam" : "quiz",
    date,
    score: answers.length > 0 ? Math.round((correctCount / answers.length) * 100) : 0,
    correctCount,
    totalCount: answers.length,
    timeSpent: timeSpentSeconds,
    perQuestionResults,
    topicBreakdown,
    status: "completed"
  };
}
