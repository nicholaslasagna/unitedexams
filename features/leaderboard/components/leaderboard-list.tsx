import { Crown } from "lucide-react";
import type { LeaderboardRpcRow } from "@/lib/supabase/types";

export function LeaderboardList({
  rows,
  currentUserId
}: {
  rows: LeaderboardRpcRow[];
  currentUserId?: string;
}) {
  return (
    <div className="space-y-2">
      {rows.map((row, index) => (
        <div
          key={row.user_id}
          className={`flex items-center justify-between rounded-xl border px-3 py-3 transition-all duration-200 ease-out-expo hover:shadow-card-hover hover:border-border-accent stagger-${Math.min(index + 1, 8)} ${
            row.is_current_user || row.user_id === currentUserId
              ? "border-brand-2/45 bg-brand-2/12"
              : "border-borderc bg-soft"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-borderc bg-surface text-xs font-mono font-bold">
              {row.rank}
            </div>
            <div>
              <p className="text-sm font-semibold text-text">{row.display_name}</p>
              <p className="text-xs text-muted text-text-secondary">
                {row.real_name ? `${row.real_name} · ` : ""}
                {row.university_name || "University hidden"}
              </p>
            </div>
            {row.rank === 1 ? <Crown className="h-4 w-4 text-warn" /> : null}
          </div>
          <div className="text-right">
            <p className="font-mono text-base font-bold text-text">{row.points} pts</p>
            <p className="text-xs text-muted text-text-secondary"><span className="font-mono">{row.streak}</span> day streak</p>
          </div>
        </div>
      ))}
    </div>
  );
}
