"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/lib/app-data-context";
import { isVerifiedProfessor } from "@/lib/auth/roles";
import { useToast } from "@/lib/hooks/use-toast";
import { getExam, getExamMonitor, type ExamMonitorRow } from "@/features/exams/api";

function toCsv(rows: ExamMonitorRow[]) {
  const header = [
    "attempt_id",
    "student_id",
    "student_display_name",
    "status",
    "score",
    "suspicion_score",
    "flagged",
    "started_at",
    "submitted_at"
  ];
  const lines = rows.map((row) =>
    [
      row.attempt_id,
      row.student_id,
      row.student_display_name,
      row.status,
      row.score ?? "",
      row.suspicion_score,
      row.flagged ? "true" : "false",
      row.started_at ?? "",
      row.submitted_at ?? ""
    ]
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(",")
  );
  return [header.join(","), ...lines].join("\n");
}

export function ProfessorExamResultsPage({ examId }: { examId: string }) {
  const { supabase, profile } = useAppData();
  const { push } = useToast();
  const isProfessor = isVerifiedProfessor(profile);

  const [examTitle, setExamTitle] = useState("Exam Results");
  const [rows, setRows] = useState<ExamMonitorRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase || !isProfessor) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    Promise.all([getExam(supabase, examId), getExamMonitor(supabase, examId)])
      .then(([exam, monitorRows]) => {
        if (!active) return;
        setExamTitle(exam?.title || "Exam");
        setRows(monitorRows);
      })
      .catch((error) => {
        if (!active) return;
        setRows([]);
        push({ title: "Unable to load results", description: (error as Error).message, tone: "error" });
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [supabase, examId, isProfessor, push]);

  const summary = useMemo(() => {
    const graded = rows.filter((row) => typeof row.score === "number");
    const avg = graded.length
      ? graded.reduce((sum, row) => sum + Number(row.score ?? 0), 0) / graded.length
      : 0;
    const flagged = rows.filter((row) => row.flagged).length;
    return { avg, gradedCount: graded.length, flagged };
  }, [rows]);

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
        <CardBody className="p-8 text-sm text-muted">Loading exam results…</CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl font-semibold tracking-tight">Exam Results</h1>
          <p className="mt-2 text-sm text-muted">{examTitle}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" asChild>
            <Link href={`/app/professor/exams/${examId}/monitor`}>Monitor</Link>
          </Button>
          <Button
            onClick={() => {
              const csv = toCsv(rows);
              const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
              const url = URL.createObjectURL(blob);
              const anchor = document.createElement("a");
              anchor.href = url;
              anchor.download = `exam-results-${examId}.csv`;
              anchor.click();
              URL.revokeObjectURL(url);
            }}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardBody className="p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-muted">Attempts</p>
            <p className="mt-2 font-mono text-3xl font-bold text-text">{rows.length}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-muted">Average score</p>
            <p className="mt-2 font-mono text-3xl font-bold text-text">{summary.avg.toFixed(1)}%</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-muted">Flagged attempts</p>
            <p className="mt-2 font-mono text-3xl font-bold text-warn">{summary.flagged}</p>
          </CardBody>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <h2 className="font-display text-2xl font-semibold">Attempt breakdown</h2>
        </CardHeader>
        <CardBody className="space-y-2">
          {rows.length === 0 ? (
            <p className="rounded-xl border border-dashed border-borderc bg-soft px-3 py-2 text-sm text-muted">
              No attempts yet.
            </p>
          ) : (
            rows.map((row) => (
              <div key={row.attempt_id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-borderc bg-soft px-3 py-2 text-sm">
                <span className="font-medium text-text">{row.student_display_name}</span>
                <span className="text-muted">
                  {row.status}
                  {row.score !== null ? ` · ${row.score}%` : ""}
                  {row.flagged ? " · flagged" : ""}
                </span>
              </div>
            ))
          )}
        </CardBody>
      </Card>
    </div>
  );
}
