"use client";

import { useEffect, useMemo, useState } from "react";
import { Crown, Search, Trophy } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/lib/app-data-context";

interface LeaderboardRow {
  rank: number;
  user_id: string;
  display_name: string;
  real_name: string | null;
  university_name: string | null;
  points: number;
  streak: number;
  is_current_user: boolean;
}

export default function LeaderboardPage() {
  const { supabase, user } = useAppData();
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const pageSize = 25;

  const loadRows = async (nextOffset = 0, reset = false) => {
    if (!supabase) return;

    setLoading(true);
    const { data, error } = await supabase.rpc("get_leaderboard", {
      limit_count: pageSize,
      offset_count: nextOffset
    });
    setLoading(false);

    if (error) {
      setRows([]);
      setHasMore(false);
      return;
    }

    const incoming = (data as LeaderboardRow[]) ?? [];
    setRows((prev) => {
      const merged = reset ? incoming : [...prev, ...incoming];
      return Array.from(new Map(merged.map((entry) => [entry.user_id, entry])).values());
    });
    setOffset(nextOffset + incoming.length);
    setHasMore(Boolean(user) && incoming.length === pageSize);
  };

  useEffect(() => {
    loadRows(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, user?.id]);

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
    <div className="space-y-6">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold tracking-tight">Leaderboard</h1>
          <p className="mt-2 text-sm text-muted">Live rankings from real users only. No placeholder profiles.</p>
        </div>

        {myRow ? (
          <div className="rounded-xl border border-brand-2/40 bg-brand-2/10 px-4 py-2 text-sm text-text">
            Your rank: <span className="font-mono font-bold">#{myRow.rank}</span> · {myRow.points} pts
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
          <h2 className="inline-flex items-center gap-2 font-display text-2xl font-semibold">
            <Trophy className="h-5 w-5 text-brand-2" />
            Rankings
          </h2>
        </CardHeader>
        <CardBody className="space-y-2">
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-borderc bg-soft px-4 py-8 text-center text-sm text-muted">
              {loading ? "Loading leaderboard..." : "No leaderboard entries yet."}
            </div>
          ) : (
            filtered.map((row) => (
              <div
                key={row.user_id}
                className={`flex items-center justify-between rounded-xl border px-3 py-3 ${
                  row.is_current_user || row.user_id === user?.id
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
                    <p className="text-xs text-muted">
                      {row.real_name ? `${row.real_name} · ` : ""}
                      {row.university_name || "University hidden"}
                    </p>
                  </div>
                  {row.rank === 1 ? <Crown className="h-4 w-4 text-warn" /> : null}
                </div>
                <div className="text-right">
                  <p className="font-mono text-base font-bold text-text">{row.points} pts</p>
                  <p className="text-xs text-muted">{row.streak} day streak</p>
                </div>
              </div>
            ))
          )}

          {hasMore ? (
            <div className="pt-2">
              <Button variant="secondary" onClick={() => loadRows(offset, false)} loading={loading}>
                Load more
              </Button>
            </div>
          ) : null}
        </CardBody>
      </Card>
    </div>
  );
}
