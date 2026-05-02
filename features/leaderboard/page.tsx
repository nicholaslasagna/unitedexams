"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Crown, Flame, Lock, Medal, Search, Sparkles, Trophy, Users } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { useAppData } from "@/lib/app-data-context";
import type { LeaderboardRpcRow } from "@/lib/supabase/types";
import { getLeaderboard } from "@/features/leaderboard/api";
import { LeaderboardList } from "@/features/leaderboard/components/leaderboard-list";

type Filter = "all" | "weekly";

export function LeaderboardPageContent({
  publicMode = false,
  showHeader = true
}: {
  publicMode?: boolean;
  showHeader?: boolean;
}) {
  const { supabase, user } = useAppData();
  const [rows, setRows] = useState<LeaderboardRpcRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
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
  const podium = filtered.slice(0, 3);
  const rest = filtered.slice(3);

  return (
    <div className="space-y-8">
      {showHeader ? (
        <section className="relative">
          <div className="aurora absolute inset-0 -z-10 rounded-[2rem] opacity-90" aria-hidden />
          <div className="premium-card glow-border p-5 sm:p-7">
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div className="space-y-4">
                <span className="eyebrow">
                  <Trophy className="h-3 w-3" />
                  Leaderboard
                </span>
                <h1 className="font-display text-[2.4rem] font-semibold leading-[1.02] tracking-tight text-text sm:text-[3rem]">
                  Real students. Real progress.
                </h1>
                <p className="max-w-xl text-[15px] leading-relaxed text-text-secondary">
                  Privacy controls are respected — display name, real name, and
                  university visibility are user-controlled. No shame-based design,
                  just a quiet record of the work.
                </p>

                <div className="flex flex-wrap gap-2">
                  <Badge tone="brand">Top 5 public</Badge>
                  <Badge tone="success">Privacy-aware</Badge>
                  <Badge>No fake bots</Badge>
                </div>

                {myRow && !publicMode ? (
                  <div className="rounded-[1.1rem] border border-accent/35 bg-accent/10 px-4 py-3 text-[14px] text-text">
                    <span className="text-text-secondary">Your rank: </span>
                    <span className="font-mono text-lg font-bold text-text">#{myRow.rank}</span>
                    <span className="text-text-secondary"> · </span>
                    <span className="font-mono font-bold text-text">{myRow.points}</span>
                    <span className="text-text-secondary"> pts</span>
                  </div>
                ) : null}
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <PodiumStat
                  icon={<Trophy className="h-4 w-4" />}
                  label="Tracked"
                  value={rows.length}
                />
                <PodiumStat
                  icon={<Flame className="h-4 w-4" />}
                  label="Top streak"
                  value={
                    rows.length === 0
                      ? "—"
                      : Math.max(0, ...rows.map((row) => row.streak ?? 0))
                  }
                />
                <PodiumStat
                  icon={<Users className="h-4 w-4" />}
                  label="Universities"
                  value={
                    rows.length === 0
                      ? "—"
                      : new Set(
                          rows.map((row) => row.university_name).filter(Boolean) as string[]
                        ).size || "—"
                  }
                />
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* Filter row */}
      <Card>
        <CardBody className="grid gap-3 p-4 md:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="pl-9"
              placeholder="Search by name or university"
              aria-label="Search leaderboard"
            />
          </div>
          <div className="flex rounded-xl border border-borderc bg-soft p-1 text-[12px] font-semibold">
            {(["all", "weekly"] as Filter[]).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setFilter(opt)}
                className={`rounded-lg px-3 py-1.5 transition-colors ${
                  filter === opt
                    ? "bg-surface text-text shadow-subtle"
                    : "text-text-secondary hover:text-text"
                }`}
              >
                {opt === "all" ? "All-time" : "This week"}
              </button>
            ))}
          </div>
          <Button
            variant="ghost"
            onClick={() => {
              setQuery("");
              setFilter("all");
            }}
          >
            Reset
          </Button>
        </CardBody>
      </Card>

      {/* Podium (top 3) */}
      {podium.length > 0 ? (
        <section>
          <SectionHeading eyebrow="Top 3" title="The podium." />
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {podium.map((row, idx) => (
              <PodiumCard
                key={row.user_id}
                rank={idx + 1}
                row={row}
                isCurrentUser={row.is_current_user || row.user_id === user?.id}
              />
            ))}
          </div>
        </section>
      ) : null}

      {/* Rest of the table */}
      <Card>
        <CardHeader>
          <h2 className="inline-flex items-center gap-2 font-display text-xl font-semibold text-text">
            <Trophy className="h-4 w-4 text-accent" />
            Rankings
          </h2>
        </CardHeader>
        <CardBody className="space-y-4">
          {filtered.length === 0 && !loading ? (
            <EmptyState
              icon={<Sparkles className="h-6 w-6" />}
              title="No leaderboard entries yet"
              description="Once people start posting attempts, this list fills in. Be the first to post a score."
              action={
                <Button asChild>
                  <Link href="/courses">Start a quiz</Link>
                </Button>
              }
            />
          ) : (
            <LeaderboardList rows={rest} currentUserId={user?.id} />
          )}

          {hasMore ? (
            <Button variant="secondary" onClick={() => loadRows(offset, false)} loading={loading}>
              Load more
            </Button>
          ) : null}

          {publicMode && !user ? (
            <div className="space-y-3 border-t border-borderc pt-4">
              <div className="rounded-[1rem] border border-accent/35 bg-accent/10 px-4 py-3 text-[13.5px] text-text">
                Showing top {Math.min(5, filtered.length)}.{" "}
                <Link href="/login?next=/app/leaderboard" className="font-semibold text-accent">
                  Sign in
                </Link>{" "}
                to view the full board, your rank, and weekly changes.
              </div>
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, index) => (
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
                        <div className="h-3 w-28 rounded bg-borderc/70" />
                        <div className="h-2.5 w-20 rounded bg-borderc/70" />
                      </div>
                    </div>
                    <Lock className="h-4 w-4 text-muted" />
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {publicMode && user ? (
            <div className="rounded-xl border border-borderc bg-soft px-4 py-3 text-[13px] text-text-secondary">
              Want the full experience?{" "}
              <Link href="/app/leaderboard" className="font-semibold text-accent">
                Open the in-app leaderboard
              </Link>{" "}
              for filters, rank changes, and your standing.
            </div>
          ) : null}
        </CardBody>
      </Card>
    </div>
  );
}

function PodiumStat({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-[1rem] border border-borderc bg-surface/85 p-3.5">
      <p className="flex items-center justify-between text-[10.5px] font-bold uppercase tracking-[0.18em] text-text-secondary">
        {label}
        <span className="text-accent/80">{icon}</span>
      </p>
      <p className="mt-1.5 font-mono text-2xl font-bold leading-none text-text">{value}</p>
    </div>
  );
}

function PodiumCard({
  rank,
  row,
  isCurrentUser
}: {
  rank: number;
  row: LeaderboardRpcRow;
  isCurrentUser: boolean;
}) {
  const tone =
    rank === 1
      ? {
          ring: "border-warn/50",
          bg: "bg-gradient-to-br from-warn/15 via-warn/5 to-transparent",
          accent: "text-warn",
          icon: <Crown className="h-5 w-5" />,
          title: "Gold"
        }
      : rank === 2
        ? {
            ring: "border-borderc",
            bg: "bg-gradient-to-br from-soft via-soft to-transparent",
            accent: "text-text-secondary",
            icon: <Medal className="h-5 w-5" />,
            title: "Silver"
          }
        : {
            ring: "border-success/40",
            bg: "bg-gradient-to-br from-success/12 via-success/5 to-transparent",
            accent: "text-success",
            icon: <Medal className="h-5 w-5" />,
            title: "Bronze"
          };

  return (
    <div
      className={`relative overflow-hidden rounded-[1.4rem] border ${tone.ring} ${tone.bg} p-5 ${
        isCurrentUser ? "shadow-glow" : "shadow-subtle"
      }`}
    >
      <div className="absolute right-3 top-3">
        <span
          className={`inline-flex items-center gap-1 rounded-full border border-borderc bg-surface/80 px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.16em] ${tone.accent}`}
        >
          {tone.icon}
          {tone.title}
        </span>
      </div>
      <p className="font-mono text-5xl font-bold leading-none text-text">#{rank}</p>
      <p className="mt-3 font-display text-lg font-semibold text-text">{row.display_name}</p>
      <p className="text-[12.5px] text-text-secondary">
        {row.real_name ? `${row.real_name} · ` : ""}
        {row.university_name || "University hidden"}
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2 text-center">
        <div className="rounded-[0.85rem] border border-borderc bg-surface/80 px-2 py-2">
          <p className="font-mono text-base font-bold leading-none text-text">{row.points}</p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-text-secondary">pts</p>
        </div>
        <div className="rounded-[0.85rem] border border-borderc bg-surface/80 px-2 py-2">
          <p className="font-mono text-base font-bold leading-none text-text">{row.streak ?? 0}</p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-text-secondary">streak</p>
        </div>
      </div>
    </div>
  );
}
