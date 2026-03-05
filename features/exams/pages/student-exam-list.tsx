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
    <div className="space-y-6 animate-fade-rise">
      <section>
        <h1 className="text-display-lg font-semibold tracking-tight">Timed Exams</h1>
        <p className="mt-2 text-sm text-muted text-text-secondary">
          Exams are visible only when your section access allows them.
        </p>
      </section>

      <Card>
        <CardHeader>
          <h2 className="text-heading font-semibold">Available exams</h2>
        </CardHeader>
        <CardBody className="space-y-3">
          {exams.length === 0 ? (
            <p className="rounded-xl border border-dashed border-borderc bg-soft px-4 py-3 text-sm text-muted text-text-secondary">
              No published exams currently available for your enrollments.
            </p>
          ) : (
            exams.map((exam, index) => (
              <article key={exam.id} className={`rounded-xl border border-borderc bg-soft px-4 py-3 transition-all duration-200 ease-out-expo hover:shadow-card-hover hover:border-border-accent stagger-${Math.min(index + 1, 8)}`}>
                <p className="text-base font-semibold text-text">{exam.title}</p>
                <p className="mt-1 text-xs text-muted text-text-secondary">
                  Window: {new Date(exam.starts_at).toLocaleString()} → {new Date(exam.ends_at).toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-muted text-text-secondary">
                  Duration: <span className="font-mono">{exam.duration_minutes}</span> minutes • Attempts: <span className="font-mono">{exam.attempt_limit}</span>
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
