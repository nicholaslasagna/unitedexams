import type { SupabaseClient } from "@supabase/supabase-js";
import type { LeaderboardRpcRow } from "@/lib/supabase/types";

export async function getLeaderboard(
  client: SupabaseClient,
  { limit, offset }: { limit: number; offset: number }
) {
  const { data, error } = await client.rpc("get_leaderboard", {
    limit_count: limit,
    offset_count: offset
  });

  if (error) throw error;
  return (data ?? []) as LeaderboardRpcRow[];
}
