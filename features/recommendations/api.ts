import type { SupabaseClient } from "@supabase/supabase-js";
import type { RecommendationRpcRow } from "@/lib/supabase/types";
import type { Attempt } from "@/lib/types";
import { fallbackRecommendations, type RecommendationItem } from "@/features/recommendations/scoring";

export async function getRecommendations(
  client: SupabaseClient | null,
  {
    limit,
    attempts,
    userCourseIds
  }: {
    limit: number;
    attempts: Attempt[];
    userCourseIds: string[];
  }
): Promise<RecommendationItem[]> {
  if (client) {
    const { data, error } = await client.rpc("get_recommendations", {
      limit_count: limit
    });

    if (!error && Array.isArray(data)) {
      return (data as RecommendationRpcRow[]).map((row) => ({
        quizId: row.quiz_set_id,
        title: row.title,
        courseId: row.course_id,
        description: row.description,
        difficulty: row.difficulty,
        estMinutes: row.est_minutes,
        tags: row.tags,
        reason: row.reason,
        score: row.recommendation_score
      }));
    }
  }

  return fallbackRecommendations(attempts, userCourseIds, limit);
}
