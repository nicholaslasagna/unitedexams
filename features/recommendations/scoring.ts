import { quizSets } from "@/data/seed";
import type { Attempt } from "@/lib/types";

export interface RecommendationItem {
  quizId: string;
  title: string;
  courseId: string;
  description: string;
  difficulty: string;
  estMinutes: number;
  tags: string[];
  reason: string;
  score: number;
}

function weakTagsFromAttempts(attempts: Attempt[], selectedCourseIds: string[]) {
  const totals = new Map<string, { correct: number; total: number }>();

  attempts
    .filter((attempt) => selectedCourseIds.includes(attempt.courseId))
    .forEach((attempt) => {
      Object.entries(attempt.topicBreakdown).forEach(([tag, stats]) => {
        const current = totals.get(tag) ?? { correct: 0, total: 0 };
        current.correct += stats.correct;
        current.total += stats.total;
        totals.set(tag, current);
      });
    });

  return [...totals.entries()]
    .map(([tag, stats]) => ({ tag, mastery: stats.total > 0 ? stats.correct / stats.total : 0 }))
    .sort((a, b) => a.mastery - b.mastery)
    .slice(0, 8)
    .map((entry) => entry.tag);
}

export function fallbackRecommendations(
  attempts: Attempt[],
  userCourseIds: string[],
  limitCount = 6
): RecommendationItem[] {
  if (userCourseIds.length === 0) return [];

  const weakTags = weakTagsFromAttempts(attempts, userCourseIds);
  const hasMastery = weakTags.length > 0;

  const candidateSets = quizSets.filter((set) => userCourseIds.includes(set.courseId));

  const recentQuizIds = new Set(
    [...attempts]
      .sort((a, b) => +new Date(b.date) - +new Date(a.date))
      .slice(0, 8)
      .map((attempt) => attempt.quizId)
  );

  const scored = candidateSets.map((set) => {
    const overlap = set.tags.filter((tag) => weakTags.includes(tag)).length;
    const seenPenalty = recentQuizIds.has(set.id) ? 8 : 0;
    const lengthBonus = Math.max(0, 20 - set.estMinutes);
    const varietyBonus = hasMastery ? 0 : Math.max(0, 14 - set.tags.length);

    const score = overlap * 24 + lengthBonus + varietyBonus - seenPenalty;
    const reason = hasMastery
      ? overlap > 0
        ? `Targets weak topics: ${set.tags.filter((tag) => weakTags.includes(tag)).slice(0, 2).join(", ")}`
        : "Balanced reinforcement in enrolled courses"
      : "Great next step: concise and high-value practice";

    return {
      quizId: set.id,
      title: set.title,
      courseId: set.courseId,
      description: set.description,
      difficulty: set.difficulty,
      estMinutes: set.estMinutes,
      tags: set.tags,
      reason,
      score
    } satisfies RecommendationItem;
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limitCount);
}
