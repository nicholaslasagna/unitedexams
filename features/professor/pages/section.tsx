"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { quizSets } from "@/data/seed";
import { useAppData } from "@/lib/app-data-context";
import { useToast } from "@/lib/hooks/use-toast";
import {
  createSectionAssignment,
  getSectionAnalytics,
  listSectionAssignments,
  listProfessorSections,
  type AssignmentRow,
  type SectionAnalytics,
  type SectionSummary
} from "@/features/professor/api";

export function ProfessorSectionPage() {
  const params = useParams<{ id: string }>();
  const sectionId = params.id;

  const { profile, supabase, user } = useAppData();
  const { push } = useToast();

  const [section, setSection] = useState<SectionSummary | null>(null);
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [analytics, setAnalytics] = useState<SectionAnalytics | null>(null);

  const [quizSetId, setQuizSetId] = useState("");
  const [dueAt, setDueAt] = useState("");

  const isProfessor = profile.role === "professor" || profile.role === "admin";

  const sectionQuizSets = useMemo(() => {
    if (!section) return [];
    return quizSets.filter((set) => set.courseId === section.course_id);
  }, [section]);

  const refresh = async () => {
    if (!supabase) return;

    const [allSections, sectionAssignments, sectionAnalytics] = await Promise.all([
      listProfessorSections(supabase),
      listSectionAssignments(supabase, sectionId),
      getSectionAnalytics(supabase, sectionId)
    ]);

    setSection(allSections.find((row) => row.id === sectionId) ?? null);
    setAssignments(sectionAssignments);
    setAnalytics(sectionAnalytics);

    if (!quizSetId && section) {
      const first = quizSets.find((set) => set.courseId === section.course_id);
      setQuizSetId(first?.id ?? "");
    }
  };

  useEffect(() => {
    if (!isProfessor) return;
    refresh().catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isProfessor, sectionId, supabase]);

  useEffect(() => {
    if (!section) return;
    if (quizSetId) return;
    const first = quizSets.find((set) => set.courseId === section.course_id);
    setQuizSetId(first?.id ?? "");
  }, [section, quizSetId]);

  if (!isProfessor) {
    return (
      <Card>
        <CardBody className="space-y-3 p-8 text-center">
          <h1 className="font-display text-3xl font-semibold">403</h1>
          <p className="text-sm text-muted">Professor access is required for this section.</p>
        </CardBody>
      </Card>
    );
  }

  if (!section) {
    return (
      <Card>
        <CardBody className="p-8 text-sm text-muted">Loading section…</CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-3">
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
            <p className="text-xs uppercase tracking-[0.14em] text-muted">Join code</p>
            <p className="mt-2 font-mono text-3xl font-bold text-accent">{section.join_code}</p>
          </CardBody>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <h1 className="font-display text-3xl font-semibold">{section.name}</h1>
          <p className="text-sm text-muted">
            {section.course_id}
            {section.term ? ` · ${section.term}` : ""}
          </p>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[1fr_220px_160px]">
            <select
              className="h-11 rounded-[10px] border border-borderc bg-soft px-3 text-sm text-text"
              value={quizSetId}
              onChange={(event) => setQuizSetId(event.target.value)}
            >
              {sectionQuizSets.map((set) => (
                <option key={set.id} value={set.id}>
                  {set.title}
                </option>
              ))}
            </select>
            <Input type="datetime-local" value={dueAt} onChange={(event) => setDueAt(event.target.value)} />
            <Button
              onClick={async () => {
                if (!supabase || !user || !quizSetId) return;
                try {
                  await createSectionAssignment(supabase, {
                    sectionId,
                    quizSetId,
                    dueAt: dueAt ? new Date(dueAt).toISOString() : null,
                    createdBy: user.id
                  });
                  push({ title: "Assignment created", tone: "success" });
                  setDueAt("");
                  refresh();
                } catch (error) {
                  push({ title: "Unable to create assignment", description: (error as Error).message, tone: "error" });
                }
              }}
            >
              Assign
            </Button>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-text">Assignments</p>
            {assignments.length === 0 ? (
              <p className="rounded-xl border border-dashed border-borderc bg-soft px-4 py-3 text-sm text-muted">
                No assignments yet.
              </p>
            ) : (
              assignments.map((assignment) => (
                <div key={assignment.id} className="rounded-xl border border-borderc bg-soft px-4 py-3 text-sm">
                  <p className="font-semibold text-text">{assignment.quiz_set_id}</p>
                  <p className="text-xs text-muted">Due: {assignment.due_at ? new Date(assignment.due_at).toLocaleString() : "No due date"}</p>
                </div>
              ))
            )}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-borderc bg-soft p-3">
              <p className="text-sm font-semibold text-text">Score distribution</p>
              <div className="mt-2 space-y-1 text-xs text-muted">
                <p>90+: {analytics?.score_buckets?.["90_plus"] ?? 0}</p>
                <p>80–89: {analytics?.score_buckets?.["80_89"] ?? 0}</p>
                <p>60–79: {analytics?.score_buckets?.["60_79"] ?? 0}</p>
                <p>&lt;60: {analytics?.score_buckets?.["below_60"] ?? 0}</p>
              </div>
            </div>
            <div className="rounded-xl border border-borderc bg-soft p-3">
              <p className="text-sm font-semibold text-text">Weak tags</p>
              <div className="mt-2 space-y-1 text-xs text-muted">
                {(analytics?.weak_tags ?? []).slice(0, 6).map((tag) => (
                  <p key={tag.tag}>
                    {tag.tag}: {tag.misses} misses
                  </p>
                ))}
                {(analytics?.weak_tags ?? []).length === 0 ? <p>No weak-tag data yet.</p> : null}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
