"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/lib/app-data-context";
import { listEnrolledPublishedExams, type ExamRow } from "@/features/exams/api";

export function StudentExamListPage() {
  const { supabase } = useAppData();
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<ExamRow[]>([]);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    setLoading(true);
    listEnrolledPublishedExams(supabase)
      .then((rows) => setExams(rows))
      .catch(() => setExams([]))
      .finally(() => setLoading(false));
  }, [supabase]);

  if (loading) {
    return (
      <Card>
        <CardBody className="p-8 text-sm text-muted">Loading exams…</CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <section>
        <h1 className="font-display text-4xl font-semibold tracking-tight">Timed Exams</h1>
        <p className="mt-2 text-sm text-muted">
          Exams are visible only when your section access allows them.
        </p>
      </section>

      <Card>
        <CardHeader>
          <h2 className="font-display text-2xl font-semibold">Available exams</h2>
        </CardHeader>
        <CardBody className="space-y-3">
          {exams.length === 0 ? (
            <p className="rounded-xl border border-dashed border-borderc bg-soft px-4 py-3 text-sm text-muted">
              No published exams currently available for your enrollments.
            </p>
          ) : (
            exams.map((exam) => (
              <article key={exam.id} className="rounded-xl border border-borderc bg-soft px-4 py-3">
                <p className="text-base font-semibold text-text">{exam.title}</p>
                <p className="mt-1 text-xs text-muted">
                  Window: {new Date(exam.starts_at).toLocaleString()} → {new Date(exam.ends_at).toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-muted">
                  Duration: {exam.duration_minutes} minutes • Attempts: {exam.attempt_limit}
                </p>
                <div className="mt-3">
                  <Button asChild>
                    <Link href={`/app/exams/${exam.id}`}>Open exam</Link>
                  </Button>
                </div>
              </article>
            ))
          )}
        </CardBody>
      </Card>
    </div>
  );
}
