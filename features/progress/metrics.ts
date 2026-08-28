import { getQuizSet, quizSets } from "@/data/seed";
import type { Attempt } from "@/lib/types";

export function attemptsForQuiz(attempts: Attempt[], quizId: string) {
  return attempts.filter((attempt) => attempt.quizId === quizId);
}

export function attemptsForCourse(attempts: Attempt[], courseId: string) {
  return attempts.filter((attempt) => attempt.courseId === courseId);
}

export function bestScoreForQuiz(attempts: Attempt[], quizId: string) {
  const quizAttempts = attemptsForQuiz(attempts, quizId);
  return quizAttempts.reduce((best, attempt) => Math.max(best, attempt.score), 0);
}

export function latestAttemptForQuiz(attempts: Attempt[], quizId: string) {
  return attemptsForQuiz(attempts, quizId).sort((a, b) => +new Date(b.date) - +new Date(a.date))[0] ?? null;
}

export function courseProgress(attempts: Attempt[], courseId: string) {
  const courseQuizSets = quizSets.filter((quiz) => quiz.courseId === courseId);
  if (courseQuizSets.length === 0) return 0;

  const scores = courseQuizSets.map((quiz) => bestScoreForQuiz(attempts, quiz.id));
  const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  return Math.round(avg);
}

export function getStreak(attempts: Attempt[]) {
  const uniqueDays = new Set(
    attempts.map((attempt) => new Date(attempt.date).toISOString().slice(0, 10))
  );

  if (uniqueDays.size === 0) return { current: 0, best: 0, activeDates: [] as string[] };

  const sorted = [...uniqueDays].sort();
  let best = 1;
  let currentRun = 1;

  for (let i = 1; i < sorted.length; i += 1) {
    const prev = new Date(`${sorted[i - 1]}T00:00:00Z`).getTime();
    const curr = new Date(`${sorted[i]}T00:00:00Z`).getTime();
    const diffDays = Math.round((curr - prev) / 86400000);
    if (diffDays === 1) {
      currentRun += 1;
      best = Math.max(best, currentRun);
    } else {
      currentRun = 1;
    }
  }

  const today = new Date();
  const todayIso = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
    .toISOString()
    .slice(0, 10);
  const yesterdayIso = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  const hasToday = uniqueDays.has(todayIso);
  const hasYesterday = uniqueDays.has(yesterdayIso);

  let current = 0;
  if (hasToday || hasYesterday) {
    let cursor = hasToday ? todayIso : yesterdayIso;
    while (uniqueDays.has(cursor)) {
      current += 1;
      const prev = new Date(`${cursor}T00:00:00Z`);
      prev.setUTCDate(prev.getUTCDate() - 1);
      cursor = prev.toISOString().slice(0, 10);
    }
  }

  return { current, best, activeDates: sorted };
}

export function recentAttempts(attempts: Attempt[], limit = 8) {
  return [...attempts]
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .slice(0, limit)
    .map((attempt) => ({
      ...attempt,
      quizTitle: getQuizSet(attempt.quizId)?.title ?? "Quiz"
    }));
}

export function topicMasteryForCourse(attempts: Attempt[], courseId: string) {
  const breakdown: Record<string, { correct: number; total: number }> = {};

  attemptsForCourse(attempts, courseId).forEach((attempt) => {
    Object.entries(attempt.topicBreakdown).forEach(([topic, score]) => {
      if (!breakdown[topic]) breakdown[topic] = { correct: 0, total: 0 };
      breakdown[topic].correct += score.correct;
      breakdown[topic].total += score.total;
    });
  });

  return Object.entries(breakdown)
    .map(([topic, score]) => ({
      topic,
      score: score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0,
      ...score
    }))
    .sort((a, b) => b.score - a.score);
}

export function streakSparkline(attempts: Attempt[], days = 14) {
  const now = new Date();
  const counts: number[] = [];

  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const count = attempts.filter((attempt) => attempt.date.slice(0, 10) === key).length;
    counts.push(count);
  }

  return counts;
}

export function leaderboardPoints(attempts: Attempt[]) {
  return attempts.reduce((sum, attempt) => sum + Math.round(attempt.score * 1.5), 0);
}

/**
 * Rows for the post-attempt "Topic breakdown" chart.
 *
 * Question tags mix genuine topics ("multiplicity") with set-level labels
 * ("software-engineering", "exam-2") that sit on every question. A tag
 * covering the whole run always scores exactly the overall score, so those
 * rows just restate the headline number several times over. Keep only tags
 * that distinguish part of the run - unless that leaves nothing, in which
 * case the full list is more useful than an empty chart.
 */
export function topicBreakdownRows(
  topicBreakdown: Attempt["topicBreakdown"],
  totalCount: number,
  limit = 8
) {
  const rows = Object.entries(topicBreakdown).map(([label, stats]) => ({
    label,
    value: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
    total: stats.total
  }));
  const distinguishing = rows.filter((row) => row.total < totalCount);
  return (distinguishing.length > 0 ? distinguishing : rows)
    .map(({ label, value }) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}
