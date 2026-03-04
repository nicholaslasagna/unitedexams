"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/lib/app-data-context";
import { useToast } from "@/lib/hooks/use-toast";
import {
  getExam,
  getExamEvents,
  getExamMonitor,
  type ExamEventTimelineRow,
  type ExamMonitorRow
} from "@/features/exams/api";

export function ProfessorExamMonitorPage({ examId }: { examId: string }) {
  const { supabase, profile } = useAppData();
  const { push } = useToast();
  const isProfessor = profile.role === "professor" || profile.role === "admin";

  const [examTitle, setExamTitle] = useState("Exam Monitor");
  const [rows, setRows] = useState<ExamMonitorRow[]>([]);
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);
  const [events, setEvents] = useState<ExamEventTimelineRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [flaggedOnly, setFlaggedOnly] = useState(false);

  const refresh = async () => {
    if (!supabase || !isProfessor) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [exam, monitorRows] = await Promise.all([getExam(supabase, examId), getExamMonitor(supabase, examId)]);
      setExamTitle(exam?.title || "Exam");
      setRows(monitorRows);
      const nextSelected = selectedAttemptId && monitorRows.some((row) => row.attempt_id === selectedAttemptId)
        ? selectedAttemptId
        : monitorRows[0]?.attempt_id ?? null;
      setSelectedAttemptId(nextSelected);
      if (nextSelected) {
        const timeline = await getExamEvents(supabase, examId, nextSelected);
        setEvents(timeline);
      } else {
        setEvents([]);
      }
    } catch (error) {
      push({ title: "Unable to load monitor", description: (error as Error).message, tone: "error" });
      setRows([]);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, examId, isProfessor]);

  useEffect(() => {
    if (!supabase || !selectedAttemptId) return;
    getExamEvents(supabase, examId, selectedAttemptId)
      .then(setEvents)
      .catch(() => setEvents([]));
  }, [supabase, examId, selectedAttemptId]);

  useEffect(() => {
    if (!supabase || !isProfessor) return;
    const timer = window.setInterval(() => {
      void refresh();
    }, 10000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, examId, isProfessor, selectedAttemptId]);

  const visibleRows = useMemo(
    () => (flaggedOnly ? rows.filter((row) => row.flagged) : rows),
    [flaggedOnly, rows]
  );

  if (!isProfessor) {
    return (
      <Card>
        <CardBody className="p-8 text-center text-sm text-muted">Professor access required.</CardBody>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardBody className="p-8 text-sm text-muted">Loading live monitor…</CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl font-semibold tracking-tight">Live Exam Monitor</h1>
          <p className="mt-2 text-sm text-muted">{examTitle}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" asChild>
            <Link href={`/app/professor/exams/${examId}/edit`}>Edit exam</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href={`/app/professor/exams/${examId}/results`}>Results</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-2xl font-semibold">Attempts</h2>
              <label className="flex items-center gap-2 text-sm text-muted">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[hsl(var(--brand-2))]"
                  checked={flaggedOnly}
                  onChange={(event) => setFlaggedOnly(event.target.checked)}
                />
                Flagged only
              </label>
            </div>
          </CardHeader>
          <CardBody className="space-y-2">
            {visibleRows.length === 0 ? (
              <p className="rounded-xl border border-dashed border-borderc bg-soft px-3 py-2 text-sm text-muted">
                No attempts match this filter.
              </p>
            ) : (
              visibleRows.map((row) => (
                <button
                  key={row.attempt_id}
                  type="button"
                  onClick={() => setSelectedAttemptId(row.attempt_id)}
                  className={`w-full rounded-xl border px-3 py-2 text-left text-sm ${
                    selectedAttemptId === row.attempt_id
                      ? "border-accent/50 bg-accent-subtle"
                      : "border-borderc bg-soft"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-text">{row.student_display_name}</span>
                    <span className="text-xs text-muted">
                      {row.status} {row.time_remaining_seconds > 0 ? `· ${Math.ceil(row.time_remaining_seconds / 60)}m left` : ""}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted">
                    <span>Score: {row.score ?? "—"}</span>
                    <span>Suspicion: {row.suspicion_score}</span>
                    {row.flagged ? (
                      <span className="inline-flex items-center gap-1 text-warn">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Flagged
                      </span>
                    ) : null}
                  </div>
                </button>
              ))
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-display text-2xl font-semibold">Event timeline</h2>
          </CardHeader>
          <CardBody className="space-y-2">
            {!selectedAttemptId ? (
              <p className="rounded-xl border border-dashed border-borderc bg-soft px-3 py-2 text-sm text-muted">
                Select an attempt to inspect events.
              </p>
            ) : events.length === 0 ? (
              <p className="rounded-xl border border-dashed border-borderc bg-soft px-3 py-2 text-sm text-muted">
                No events recorded yet.
              </p>
            ) : (
              events.map((event) => (
                <div key={`${event.exam_attempt_id}:${event.created_at}:${event.event_type}`} className="rounded-xl border border-borderc bg-soft px-3 py-2 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-text">{event.event_type}</span>
                    <span className="text-muted">{new Date(event.created_at).toLocaleTimeString()}</span>
                  </div>
                  <p className="mt-1 text-muted">{JSON.stringify(event.event_payload)}</p>
                </div>
              ))
            )}
          </CardBody>
        </Card>
      </section>
    </div>
  );
}
