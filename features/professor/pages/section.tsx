"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppData } from "@/lib/app-data-context";
import { useToast } from "@/lib/hooks/use-toast";
import {
  deleteProfessorSection,
  createSectionAssignment,
  getSectionAnalytics,
  listProfessorSections,
  listSectionAssignments,
  listSectionMembers,
  submitAssignment,
  type AssignmentRow,
  type SectionAnalytics,
  type SectionMemberRow,
  type SectionSummary
} from "@/features/professor/api";
import { listSectionExams, type ExamRow } from "@/features/exams/api";

interface QuizSetOption {
  id: string;
  title: string;
  est_minutes: number;
}

export function ProfessorSectionPage({ sectionId }: { sectionId?: string } = {}) {
  const router = useRouter();
  const params = useParams<{ id?: string; sectionId?: string }>();
  const resolvedSectionId = sectionId ?? params.sectionId ?? params.id ?? "";

  const { profile, supabase, user } = useAppData();
  const { push } = useToast();

  const [section, setSection] = useState<SectionSummary | null>(null);
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [analytics, setAnalytics] = useState<SectionAnalytics | null>(null);
  const [members, setMembers] = useState<SectionMemberRow[]>([]);
  const [sectionExams, setSectionExams] = useState<ExamRow[]>([]);
  const [availableQuizSets, setAvailableQuizSets] = useState<QuizSetOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingAssignmentId, setSubmittingAssignmentId] = useState<string | null>(null);

  const [quizSetId, setQuizSetId] = useState("");
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [allowLate, setAllowLate] = useState(false);
  const [maxAttempts, setMaxAttempts] = useState("");
  const [gradingMode, setGradingMode] = useState<"auto" | "manual" | "mixed">("auto");

  const isProfessor = profile.role === "professor" || profile.role === "admin";
  const canDeleteSection = profile.role === "professor";

  const refresh = async () => {
    if (!supabase || !resolvedSectionId) return;
    setLoading(true);
    try {
      const [allSections, sectionAssignments, sectionAnalytics, sectionMembers, sectionExamRows] = await Promise.all([
        listProfessorSections(supabase),
        listSectionAssignments(supabase, resolvedSectionId),
        getSectionAnalytics(supabase, resolvedSectionId),
        listSectionMembers(supabase, resolvedSectionId),
        listSectionExams(supabase, resolvedSectionId)
      ]);

      const foundSection = allSections.find((row) => row.id === resolvedSectionId) ?? null;
      setSection(foundSection);
      setAssignments(sectionAssignments);
      setAnalytics(sectionAnalytics);
      setMembers(sectionMembers);
      setSectionExams(sectionExamRows);

      if (foundSection) {
        const { data: setRows, error } = await supabase
          .from("quiz_sets")
          .select("id, title, est_minutes")
          .eq("course_id", foundSection.course_id)
          .eq("is_published", true)
          .order("created_at", { ascending: false });

        if (!error && setRows) {
          const mapped = (setRows as QuizSetOption[]).map((row) => ({
            id: String(row.id),
            title: row.title,
            est_minutes: row.est_minutes
          }));
          setAvailableQuizSets(mapped);
          if (!quizSetId && mapped[0]) {
            setQuizSetId(mapped[0].id);
          } else if (mapped.length === 0) {
            setQuizSetId("");
          }
        } else {
          setAvailableQuizSets([]);
          setQuizSetId("");
        }
      } else {
        setAvailableQuizSets([]);
        setQuizSetId("");
      }
    } catch {
      setSection(null);
      setAssignments([]);
      setAnalytics(null);
      setMembers([]);
      setSectionExams([]);
      setAvailableQuizSets([]);
      setQuizSetId("");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!supabase || !resolvedSectionId) {
      setLoading(false);
      return;
    }
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedSectionId, supabase]);

  const studentCount = useMemo(
    () => members.filter((member) => member.role === "student").length,
    [members]
  );

  if (loading) {
    return (
      <Card>
        <CardBody className="p-8 text-sm text-muted">Loading section…</CardBody>
      </Card>
    );
  }

  if (!section) {
    return (
      <Card>
        <CardBody className="space-y-3 p-8 text-center">
          <h1 className="font-display text-3xl font-semibold">Section Not Found</h1>
          <p className="text-sm text-muted">This section is unavailable or you no longer have access.</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-4">
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
            <p className="text-xs uppercase tracking-[0.14em] text-muted">Students</p>
            <p className="mt-2 font-mono text-3xl font-bold text-text">{studentCount}</p>
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
          <div className="flex flex-wrap gap-2 pt-2">
            <Button variant="secondary" asChild>
              <Link href={`/app/sections/${section.id}/analytics`}>Analytics</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href={`/app/sections/${section.id}/materials`}>Materials</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href={`/app/sections/${section.id}/gradebook`}>Gradebook</Link>
            </Button>
            {isProfessor ? (
              <Button variant="secondary" asChild>
                <Link href={`/app/professor/sections/${section.id}/exams`}>Exams</Link>
              </Button>
            ) : null}
            {canDeleteSection ? (
              <Button
                variant="danger"
                onClick={async () => {
                  if (!supabase) return;
                  const confirmed = window.confirm("Delete this section? This also removes members, assignments, materials, and exams.");
                  if (!confirmed) return;
                  try {
                    await deleteProfessorSection(supabase, section.id);
                    push({ title: "Section deleted", tone: "success" });
                    router.push("/app/professor/sections");
                  } catch (error) {
                    push({ title: "Unable to delete section", description: (error as Error).message, tone: "error" });
                  }
                }}
              >
                Delete section
              </Button>
            ) : null}
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          {isProfessor ? (
            <div className="space-y-3 rounded-xl border border-borderc bg-soft p-4">
              <h2 className="font-display text-2xl font-semibold">Create assignment</h2>
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-borderc bg-surface p-4">
                <div>
                  <h3 className="text-base font-semibold text-text">Quiz Builder</h3>
                  <p className="text-xs text-muted">
                    Build full quiz sets with multiple question types and student preview.
                  </p>
                </div>
                <Button asChild>
                  <Link href={`/app/professor/sections/${resolvedSectionId}/quiz-builder`}>Open quiz builder</Link>
                </Button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Title</label>
                  <Input
                    value={assignmentTitle}
                    onChange={(event) => setAssignmentTitle(event.target.value)}
                    placeholder="Homework 3 · Linear systems"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Quiz set</label>
                  <select
                    className="h-11 w-full rounded-[10px] border border-borderc bg-surface px-3 text-sm text-text"
                    value={quizSetId}
                    onChange={(event) => setQuizSetId(event.target.value)}
                  >
                    {availableQuizSets.length === 0 ? (
                      <option value="">No quiz sets available for this course</option>
                    ) : null}
                    {availableQuizSets.map((set) => (
                      <option key={set.id} value={set.id}>
                        {set.title} ({set.est_minutes}m)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Instructions (markdown)</label>
                <textarea
                  value={instructions}
                  onChange={(event) => setInstructions(event.target.value)}
                  className="min-h-24 w-full rounded-[10px] border border-borderc bg-surface px-3 py-2 text-sm text-text outline-none focus-visible:ring-2 focus-visible:ring-accent/55"
                  placeholder="Show your work and explain each step."
                />
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Due date</label>
                  <Input type="datetime-local" value={dueAt} onChange={(event) => setDueAt(event.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Max attempts</label>
                  <Input
                    value={maxAttempts}
                    onChange={(event) => setMaxAttempts(event.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="Unlimited"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Grading mode</label>
                  <select
                    className="h-11 w-full rounded-[10px] border border-borderc bg-surface px-3 text-sm text-text"
                    value={gradingMode}
                    onChange={(event) => setGradingMode(event.target.value as typeof gradingMode)}
                  >
                    <option value="auto">Auto</option>
                    <option value="mixed">Mixed</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-muted">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[hsl(var(--brand-2))]"
                  checked={allowLate}
                  onChange={(event) => setAllowLate(event.target.checked)}
                />
                Allow late submissions
              </label>

              <Button
                onClick={async () => {
                  if (!supabase || !user) return;
                  if (!quizSetId) {
                    push({ title: "Select a quiz set", tone: "error" });
                    return;
                  }
                  if (!assignmentTitle.trim()) {
                    push({ title: "Assignment title is required", tone: "error" });
                    return;
                  }
                  try {
                    await createSectionAssignment(supabase, {
                      sectionId: resolvedSectionId,
                      quizSetId,
                      title: assignmentTitle.trim(),
                      instructionsMd: instructions.trim(),
                      dueAt: dueAt ? new Date(dueAt).toISOString() : null,
                      allowLate,
                      maxAttempts: maxAttempts ? Number(maxAttempts) : null,
                      gradingMode,
                      createdBy: user.id
                    });
                    push({ title: "Assignment created", tone: "success" });
                    setAssignmentTitle("");
                    setInstructions("");
                    setDueAt("");
                    setAllowLate(false);
                    setMaxAttempts("");
                    setGradingMode("auto");
                    await refresh();
                  } catch (error) {
                    push({ title: "Unable to create assignment", description: (error as Error).message, tone: "error" });
                  }
                }}
              >
                Create assignment
              </Button>
            </div>
          ) : (
            <p className="rounded-xl border border-borderc bg-soft px-4 py-3 text-sm text-muted">
              Complete assigned quizzes and submit attempts here. Auto-gradable question types are scored instantly.
            </p>
          )}

          <div className="space-y-2">
            <p className="text-sm font-semibold text-text">Assignments</p>
            {assignments.length === 0 ? (
              <p className="rounded-xl border border-dashed border-borderc bg-soft px-4 py-3 text-sm text-muted">
                No assignments yet.
              </p>
            ) : (
              assignments.map((assignment) => (
                <div key={assignment.id} className="rounded-xl border border-borderc bg-soft px-4 py-3 text-sm">
                  <p className="font-semibold text-text">{assignment.title || assignment.quiz_set_id}</p>
                  <p className="mt-1 text-xs text-muted">
                    Due: {assignment.due_at ? new Date(assignment.due_at).toLocaleString() : "No due date"} · Grading:{" "}
                    {assignment.grading_mode}
                  </p>
                  {assignment.instructions_md ? (
                    <p className="mt-2 whitespace-pre-wrap text-xs text-muted">{assignment.instructions_md}</p>
                  ) : null}

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button asChild variant="secondary">
                      <Link href={`/quiz/${assignment.quiz_set_id}`}>Open assigned set</Link>
                    </Button>
                    {!isProfessor ? (
                      <Button
                        onClick={async () => {
                          if (!supabase) return;
                          setSubmittingAssignmentId(assignment.id);
                          try {
                            const result = await submitAssignment(supabase, { assignmentId: assignment.id });
                            push({
                              title:
                                result.status === "graded"
                                  ? `Submitted · ${result.score ?? 0}%`
                                  : "Submitted for review",
                              tone: "success"
                            });
                          } catch (error) {
                            push({ title: "Unable to submit assignment", description: (error as Error).message, tone: "error" });
                          } finally {
                            setSubmittingAssignmentId(null);
                          }
                        }}
                        loading={submittingAssignmentId === assignment.id}
                      >
                        Submit latest attempt
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-text">Timed exams</p>
              {isProfessor ? (
                <Button size="sm" variant="secondary" asChild>
                  <Link href={`/app/professor/sections/${resolvedSectionId}/exams`}>Manage exams</Link>
                </Button>
              ) : null}
            </div>
            {sectionExams.length === 0 ? (
              <p className="rounded-xl border border-dashed border-borderc bg-soft px-4 py-3 text-sm text-muted">
                No exams scheduled yet.
              </p>
            ) : (
              sectionExams.map((exam) => (
                <div key={exam.id} className="rounded-xl border border-borderc bg-soft px-4 py-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-text">{exam.title}</p>
                    <span className="text-xs text-muted">
                      {exam.published ? "Published" : "Draft"} • {exam.duration_minutes}m
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {new Date(exam.starts_at).toLocaleString()} → {new Date(exam.ends_at).toLocaleString()}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button size="sm" asChild>
                      <Link href={`/app/exams/${exam.id}`}>Open exam</Link>
                    </Button>
                    {isProfessor ? (
                      <>
                        <Button size="sm" variant="secondary" asChild>
                          <Link href={`/app/professor/exams/${exam.id}/edit`}>Edit</Link>
                        </Button>
                        <Button size="sm" variant="secondary" asChild>
                          <Link href={`/app/professor/exams/${exam.id}/monitor`}>Monitor</Link>
                        </Button>
                      </>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
