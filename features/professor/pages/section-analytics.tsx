"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress";
import { useAppData } from "@/lib/app-data-context";
import { isVerifiedProfessor } from "@/lib/auth/roles";
import {
  getSectionAnalytics,
  getSectionGradebook,
  listProfessorSections,
  type SectionAnalytics,
  type SectionGradebookRow,
  type SectionSummary
} from "@/features/professor/api";

const bucketDefs = [
  { key: "90_plus", label: "90+" },
  { key: "80_89", label: "80–89" },
  { key: "60_79", label: "60–79" },
  { key: "below_60", label: "<60" }
];

export function ProfessorSectionAnalyticsPage({ sectionId }: { sectionId?: string } = {}) {
  const params = useParams<{ id?: string; sectionId?: string }>();
  const resolvedSectionId = sectionId ?? params.sectionId ?? params.id ?? "";
  const { profile, supabase } = useAppData();

  const [section, setSection] = useState<SectionSummary | null>(null);
  const [analytics, setAnalytics] = useState<SectionAnalytics | null>(null);
  const [gradebookRows, setGradebookRows] = useState<SectionGradebookRow[]>([]);
  const [loading, setLoading] = useState(true);

  const isProfessor = isVerifiedProfessor(profile);

  useEffect(() => {
    if (!isProfessor || !supabase || !resolvedSectionId) {
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    Promise.all([
      listProfessorSections(supabase),
      getSectionAnalytics(supabase, resolvedSectionId),
      getSectionGradebook(supabase, resolvedSectionId)
    ])
      .then(([sections, analyticsRow, gradebook]) => {
        if (!active) return;
        setSection(sections.find((row) => row.id === resolvedSectionId) ?? null);
        setAnalytics(analyticsRow);
        setGradebookRows(gradebook);
      })
      .catch(() => {
        if (!active) return;
        setSection(null);
        setAnalytics(null);
        setGradebookRows([]);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isProfessor, resolvedSectionId, supabase]);

  const bucketRows = useMemo(() => {
    const scoreBuckets = analytics?.score_buckets ?? {};
    const total = bucketDefs.reduce((sum, bucket) => sum + Number(scoreBuckets[bucket.key] ?? 0), 0);
    return bucketDefs.map((bucket) => {
      const count = Number(scoreBuckets[bucket.key] ?? 0);
      const pct = total > 0 ? Math.round((count / total) * 100) : 0;
      return { ...bucket, count, pct };
    });
  }, [analytics]);

  const studentsAtRisk = useMemo(() => {
    const grouped = new Map<string, { name: string; scores: number[] }>();
    for (const row of gradebookRows) {
      if (!grouped.has(row.student_id)) {
        grouped.set(row.student_id, { name: row.display_name, scores: [] });
      }
      if (row.latest_score !== null && row.latest_score !== undefined) {
        grouped.get(row.student_id)?.scores.push(Number(row.latest_score));
      }
    }

    return Array.from(grouped.entries())
      .map(([studentId, item]) => ({
        studentId,
        name: item.name,
        average: item.scores.length > 0 ? item.scores.reduce((sum, score) => sum + score, 0) / item.scores.length : 0,
        gradedCount: item.scores.length
      }))
      .filter((item) => item.gradedCount === 0 || item.average < 70)
      .sort((a, b) => a.average - b.average)
      .slice(0, 8);
  }, [gradebookRows]);

  if (!isProfessor) {
    return (
      <Card>
        <CardBody className="space-y-3 p-8 text-center">
          <h1 className="font-display text-3xl font-semibold">Professor Access Required</h1>
          <p className="text-sm text-muted">Professor access is required for section analytics.</p>
        </CardBody>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardBody className="p-8 text-sm text-muted">Loading analytics…</CardBody>
      </Card>
    );
  }

  if (!section) {
    return (
      <Card>
        <CardBody className="space-y-3 p-8 text-center">
          <h1 className="font-display text-3xl font-semibold">Section Not Found</h1>
          <p className="text-sm text-muted">This section is unavailable or you do not have access.</p>
          <Button asChild>
            <Link href="/app/sections">Back to sections</Link>
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl font-semibold tracking-tight">Section Analytics</h1>
          <p className="mt-2 text-sm text-muted">
            {section.name} • {section.course_id}
            {section.term ? ` • ${section.term}` : ""}
          </p>
        </div>
        <Button variant="secondary" asChild>
          <Link href={`/app/sections/${section.id}`}>Back to section</Link>
        </Button>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardBody className="p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-muted">Average score</p>
            <p className="mt-2 font-mono text-3xl font-bold text-text">{analytics?.avg_score?.toFixed(1) ?? "0.0"}%</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-muted">Completions</p>
            <p className="mt-2 font-mono text-3xl font-bold text-text">{analytics?.completion_count ?? 0}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-muted">Weak tags tracked</p>
            <p className="mt-2 font-mono text-3xl font-bold text-text">{analytics?.weak_tags?.length ?? 0}</p>
          </CardBody>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="font-display text-2xl font-semibold">Score distribution</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            {bucketRows.map((bucket) => (
              <div key={bucket.key} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text">{bucket.label}</span>
                  <span className="font-mono text-muted">
                    {bucket.count} ({bucket.pct}%)
                  </span>
                </div>
                <ProgressBar value={bucket.pct} />
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-display text-2xl font-semibold">Weak tags</h2>
          </CardHeader>
          <CardBody className="space-y-2">
            {(analytics?.weak_tags ?? []).slice(0, 12).map((tag) => (
              <div key={tag.tag} className="flex items-center justify-between rounded-xl border border-borderc bg-soft px-3 py-2 text-sm">
                <span className="text-text">{tag.tag}</span>
                <span className="font-mono text-muted">{tag.misses} misses</span>
              </div>
            ))}
            {(analytics?.weak_tags ?? []).length === 0 ? (
              <p className="rounded-xl border border-dashed border-borderc bg-soft px-3 py-2 text-sm text-muted">
                No weak-tag data yet.
              </p>
            ) : null}
          </CardBody>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <h2 className="font-display text-2xl font-semibold">Students at risk</h2>
        </CardHeader>
        <CardBody className="space-y-2">
          {studentsAtRisk.length === 0 ? (
            <p className="rounded-xl border border-dashed border-borderc bg-soft px-3 py-2 text-sm text-muted">
              No at-risk indicators from current submissions.
            </p>
          ) : (
            studentsAtRisk.map((student) => (
              <div key={student.studentId} className="flex items-center justify-between rounded-xl border border-borderc bg-soft px-3 py-2 text-sm">
                <span className="text-text">{student.name}</span>
                <span className="font-mono text-muted">
                  {student.gradedCount === 0 ? "No graded submissions" : `${student.average.toFixed(1)}% avg`}
                </span>
              </div>
            ))
          )}
        </CardBody>
      </Card>
    </div>
  );
}
