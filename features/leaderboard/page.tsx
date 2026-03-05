"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Lock, Search, Trophy } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/lib/app-data-context";
import type { LeaderboardRpcRow } from "@/lib/supabase/types";
import { getLeaderboard } from "@/features/leaderboard/api";
import { LeaderboardList } from "@/features/leaderboard/components/leaderboard-list";

export function LeaderboardPageContent({ publicMode = false }: { publicMode?: boolean }) {
  const { supabase, user } = useAppData();
  const [rows, setRows] = useState<LeaderboardRpcRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const pageSize = publicMode && !user ? 5 : 25;

  const loadRows = async (nextOffset = 0, reset = false) => {
    if (!supabase) return;
    setLoading(true);
    try {
      const incoming = await getLeaderboard(supabase, {
        limit: pageSize,
        offset: nextOffset
      });

      setRows((prev) => {
        const merged = reset ? incoming : [...prev, ...incoming];
        return Array.from(new Map(merged.map((entry) => [entry.user_id, entry])).values());
      });
      setOffset(nextOffset + incoming.length);
      setHasMore(Boolean(user) && incoming.length === pageSize);
    } catch {
      setRows([]);
      setHasMore(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadRows(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, user?.id, publicMode]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      [row.display_name, row.real_name ?? "", row.university_name ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [rows, query]);

  const myRow = rows.find((row) => row.is_current_user || row.user_id === user?.id);

  return (
    <div className="space-y-6 animate-fade-rise">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-display-lg font-semibold tracking-tight">Leaderboard</h1>
          <p className="mt-2 text-sm text-muted text-text-secondary">Real users only. Privacy controls are respected.</p>
        </div>

        {myRow && !publicMode ? (
          <div className="rounded-xl border border-brand-2/40 bg-brand-2/10 px-4 py-2 text-sm text-text">
            Your rank: <span className="font-mono font-bold">#{myRow.rank}</span> · <span className="font-mono">{myRow.points}</span> pts
          </div>
        ) : null}
      </section>

      <Card>
        <CardBody className="p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="pl-9"
              placeholder="Search leaderboard"
              aria-label="Search leaderboard"
            />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="inline-flex items-center gap-2 text-heading font-semibold">
            <Trophy className="h-5 w-5 text-brand-2" />
            Rankings
          </h2>
        </CardHeader>
        <CardBody className="space-y-3">
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-borderc bg-soft px-4 py-8 text-center text-sm text-muted">
              {loading ? "Loading leaderboard..." : "No leaderboard entries yet."}
            </div>
          ) : (
            <LeaderboardList rows={filtered} currentUserId={user?.id} />
          )}

          {hasMore ? (
            <Button variant="secondary" onClick={() => loadRows(offset, false)} loading={loading}>
              Load more
            </Button>
          ) : null}

          {publicMode && !user ? (
            <div className="space-y-3">
              <div className="rounded-xl border border-borderc bg-soft px-4 py-3 text-sm text-muted text-text-secondary">
                Showing top 5.{" "}
                <Link href="/login?next=/app/leaderboard" className="font-semibold text-accent">
                  Sign in
                </Link>{" "}
                to view the full leaderboard.
              </div>
              <div className="space-y-2">
                {Array.from({ length: 15 }).map((_, index) => (
                  <div
                    key={`locked-${index}`}
                    className="flex items-center justify-between rounded-xl border border-borderc/80 bg-soft/70 px-3 py-3 opacity-70 blur-[0.4px]"
                    aria-hidden
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-borderc bg-surface text-xs font-mono font-bold">
                        {index + 6}
                      </div>
                      <div className="space-y-1">
                        <div className="h-3 w-28 rounded bg-white/10" />
                        <div className="h-2.5 w-20 rounded bg-white/10" />
                      </div>
                    </div>
                    <Lock className="h-4 w-4 text-muted" />
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {publicMode && user ? (
            <div className="rounded-xl border border-borderc bg-soft px-4 py-3 text-sm text-muted text-text-secondary">
              Signed in? Open the full board in the app. <Link href="/app/leaderboard" className="font-semibold text-accent">Go to app leaderboard</Link>
            </div>
          ) : null}
        </CardBody>
      </Card>
    </div>
  );
}
