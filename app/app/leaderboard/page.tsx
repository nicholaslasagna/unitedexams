"use client";

import { useMemo } from "react";
import { Crown, Flame, Trophy } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppData } from "@/lib/app-data-context";
import { getStreak, leaderboardPoints } from "@/features/progress/metrics";

export default function LeaderboardPage() {
  const { attempts, profile } = useAppData();
  const streak = useMemo(() => getStreak(attempts), [attempts]);
  const points = useMemo(() => leaderboardPoints(attempts), [attempts]);

  const rows = [
    {
      id: "me",
      name: profile.name || "You",
      school: profile.school,
      role: "student" as const,
      streak: streak.current,
      points
    }
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardBody className="p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-muted">Current streak</p>
            <p className="mt-2 inline-flex items-center gap-2 font-mono text-3xl font-bold text-text">
              <Flame className="h-6 w-6 text-warn" />
              {streak.current}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-muted">Total points</p>
            <p className="mt-2 inline-flex items-center gap-2 font-mono text-3xl font-bold text-text">
              <Trophy className="h-6 w-6 text-brand-2" />
              {points}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-muted">Leaderboard style</p>
            <p className="mt-2 text-sm text-muted">Local-first for now. Class/friends entries will appear once real sync is connected.</p>
          </CardBody>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <h1 className="font-display text-3xl font-semibold">Leaderboard</h1>
          <p className="text-sm text-muted">Only real user data is shown. No seeded or synthetic users.</p>
        </CardHeader>
        <CardBody>
          <div className="space-y-2">
            {rows.map((row, idx) => (
              <div
                key={row.id}
                className={`flex items-center justify-between rounded-xl border px-3 py-3 ${
                  row.id === "me" ? "border-brand-2/40 bg-brand-2/10" : "border-borderc bg-soft"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-borderc bg-surface text-xs font-mono font-bold">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text">{row.name}</p>
                    <p className="text-xs text-muted">{row.school || "Independent"}</p>
                  </div>
                  {idx === 0 ? <Crown className="h-4 w-4 text-warn" /> : null}
                  <Badge tone="default">{row.role || "student"}</Badge>
                </div>
                <div className="text-right">
                  <p className="font-mono text-base font-bold text-text">{row.points} pts</p>
                  <p className="text-xs text-muted">{row.streak} day streak</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-dashed border-borderc/75 bg-soft/70 px-4 py-3 text-sm text-muted">
            No classmates connected yet. When backend sync is enabled, this board will populate with real class/friend standings.
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
