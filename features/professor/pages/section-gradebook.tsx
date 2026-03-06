"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppData } from "@/lib/app-data-context";
import { isVerifiedProfessor } from "@/lib/auth/roles";
import { useToast } from "@/lib/hooks/use-toast";
import { sendGradeChangeEmailNotice } from "@/features/announcements/api";
import { getExamMonitor, listSectionExams } from "@/features/exams/api";
import {
  getSectionGradebook,
  listProfessorSections,
  upsertManualGrade,
  type SectionGradebookRow,
  type SectionSummary
} from "@/features/professor/api";

export function ProfessorSectionGradebookPage({ sectionId }: { sectionId?: string } = {}) {
  const params = useParams<{ id?: string; sectionId?: string }>();
  const resolvedSectionId = sectionId ?? params.sectionId ?? params.id ?? "";
  const { profile, supabase } = useAppData();
  const { push } = useToast();

  const [section, setSection] = useState<SectionSummary | null>(null);
  const [rows, setRows] = useState<SectionGradebookRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRowKey, setEditingRowKey] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<"submitted" | "graded" | "needs_review">("graded");
  const [editScore, setEditScore] = useState("");
  const [editPointsEarned, setEditPointsEarned] = useState("");
  const [editPointsPossible, setEditPointsPossible] = useState("100");
  const [editFeedback, setEditFeedback] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [integrityRows, setIntegrityRows] = useState<
    Array<{
      examId: string;
      examTitle: string;
      attemptCount: number;
      flaggedCount: number;
      topFlags: Array<{ student: string; suspicion: number }>;
    }>
  >([]);

  const isProfessor = isVerifiedProfessor(profile);

  const refreshGradebook = useCallback(async () => {
    if (!supabase || !resolvedSectionId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [sections, gradebookRows, examRows] = await Promise.all([
        listProfessorSections(supabase),
        getSectionGradebook(supabase, resolvedSectionId),
        listSectionExams(supabase, resolvedSectionId)
      ]);
      setSection(sections.find((item) => item.id === resolvedSectionId) ?? null);
      setRows(gradebookRows);

      const monitorRows = await Promise.all(
        examRows.map(async (exam) => {
          try {
            const monitor = await getExamMonitor(supabase, exam.id);
            const flagged = monitor
              .filter((attempt) => attempt.flagged)
              .sort((a, b) => b.suspicion_score - a.suspicion_score);
            return {
              examId: exam.id,
              examTitle: exam.title,
              attemptCount: monitor.length,
              flaggedCount: flagged.length,
              topFlags: flagged.slice(0, 3).map((attempt) => ({
                student: attempt.student_display_name,
                suspicion: attempt.suspicion_score
              }))
            };
          } catch {
            return {
              examId: exam.id,
              examTitle: exam.title,
              attemptCount: 0,
              flaggedCount: 0,
              topFlags: [] as Array<{ student: string; suspicion: number }>
            };
          }
        })
      );
      setIntegrityRows(monitorRows);
    } catch {
      setSection(null);
      setRows([]);
      setIntegrityRows([]);
    } finally {
      setLoading(false);
    }
  }, [resolvedSectionId, supabase]);

  useEffect(() => {
    let active = true;
    if (!active) return;
    void refreshGradebook();

    return () => {
      active = false;
    };
  }, [refreshGradebook]);

  const grouped = useMemo(() => {
    const byAssignment = new Map<
      string,
      {
        assignmentTitle: string;
        rows: SectionGradebookRow[];
      }
    >();

    const compareRowFreshness = (candidate: SectionGradebookRow, existing: SectionGradebookRow) => {
      const candidateTime = candidate.submitted_at ? new Date(candidate.submitted_at).getTime() : -1;
      const existingTime = existing.submitted_at ? new Date(existing.submitted_at).getTime() : -1;
      if (candidateTime !== existingTime) return candidateTime > existingTime;
      const candidateHasSubmission = Boolean(candidate.latest_submission_id);
      const existingHasSubmission = Boolean(existing.latest_submission_id);
      return candidateHasSubmission && !existingHasSubmission;
    };

    for (const row of rows) {
      const existingGroup = byAssignment.get(row.assignment_id);
      if (!existingGroup) {
        byAssignment.set(row.assignment_id, {
          assignmentTitle: row.assignment_title,
          rows: [row]
        });
        continue;
      }

      const existingRowIndex = existingGroup.rows.findIndex((item) => item.student_id === row.student_id);
      if (existingRowIndex === -1) {
        existingGroup.rows.push(row);
        continue;
      }

      if (compareRowFreshness(row, existingGroup.rows[existingRowIndex])) {
        existingGroup.rows[existingRowIndex] = row;
      }
    }

    return Array.from(byAssignment.entries()).map(([assignmentId, value]) => ({
      assignmentId,
      assignmentTitle: value.assignmentTitle,
      rows: value.rows.sort((a, b) => a.display_name.localeCompare(b.display_name))
    }));
  }, [rows]);

  const normalizeNumberInput = (value: string) => value.replace(/[^0-9.]/g, "");

  const roundTwo = (value: number) => Math.round(value * 100) / 100;

  const syncPercentFromPoints = useCallback((earnedRaw: string, possibleRaw: string) => {
    const earned = Number.parseFloat(earnedRaw);
    const possible = Number.parseFloat(possibleRaw);
    if (Number.isNaN(earned) || Number.isNaN(possible) || possible <= 0) {
      setEditScore("");
      return;
    }
    setEditScore(String(roundTwo((earned / possible) * 100)));
  }, []);

  const syncPointsFromPercent = useCallback((percentRaw: string, possibleRaw: string) => {
    const percent = Number.parseFloat(percentRaw);
    const possible = Number.parseFloat(possibleRaw);
    if (Number.isNaN(percent) || Number.isNaN(possible) || possible <= 0) {
      setEditPointsEarned("");
      return;
    }
    setEditPointsEarned(String(roundTwo((percent / 100) * possible)));
  }, []);

  if (!isProfessor) {
    return (
      <Card>
        <CardBody className="p-8 text-center text-sm text-muted">Professor access required for gradebook data.</CardBody>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardBody className="p-8 text-sm text-muted">Loading gradebook…</CardBody>
      </Card>
    );
  }

  if (!section) {
    return (
      <Card>
        <CardBody className="p-8 text-sm text-muted">Section not found.</CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl font-semibold tracking-tight">Gradebook</h1>
          <p className="mt-2 text-sm text-muted">{section.name}</p>
        </div>
        <Button variant="secondary" asChild>
          <Link href={`/app/sections/${section.id}`}>Back to section</Link>
        </Button>
      </section>

      {grouped.length === 0 ? (
        <Card>
          <CardBody className="p-6 text-sm text-muted">No submissions yet.</CardBody>
        </Card>
      ) : (
        grouped.map(({ assignmentId, assignmentTitle, rows: gradeRows }) => {
          return (
            <Card key={assignmentId}>
              <CardHeader>
                <h2 className="font-display text-2xl font-semibold">{assignmentTitle}</h2>
              </CardHeader>
              <CardBody className="space-y-2">
                {gradeRows.map((row) => {
                  const rowKey = `${row.assignment_id}:${row.student_id}`;
                  return (
                    <div key={rowKey} className="rounded-lg border border-borderc bg-soft px-3 py-2 text-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-medium text-text">{row.display_name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-muted">
                            {row.latest_status ? row.latest_status : "Not submitted"}
                            {row.latest_score !== null ? ` · ${row.latest_score}%` : ""}
                            {row.submitted_at ? ` · ${new Date(row.submitted_at).toLocaleString()}` : ""}
                          </span>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setEditingRowKey(rowKey);
                              setEditStatus(
                                row.latest_status === "submitted" || row.latest_status === "needs_review"
                                  ? row.latest_status
                                  : "graded"
                              );
                              const nextScore = row.latest_score === null ? "" : String(row.latest_score);
                              setEditScore(nextScore);
                              setEditPointsPossible("100");
                              setEditPointsEarned(
                                row.latest_score === null ? "" : String(Math.round(row.latest_score * 100) / 100)
                              );
                              setEditFeedback("");
                            }}
                          >
                            {row.latest_submission_id ? "Edit grade" : "Set grade"}
                          </Button>
                        </div>
                      </div>

                      {editingRowKey === rowKey ? (
                        <div className="mt-3 space-y-2 rounded-lg border border-borderc bg-surface p-3">
                          <div className="grid gap-2 md:grid-cols-4">
                            <div className="space-y-1">
                              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Status</label>
                              <select
                                className="h-10 w-full rounded-[10px] border border-borderc bg-soft px-3 text-sm text-text"
                                value={editStatus}
                                onChange={(event) =>
                                  setEditStatus(event.target.value as "submitted" | "graded" | "needs_review")
                                }
                              >
                                <option value="graded">graded</option>
                                <option value="needs_review">needs_review</option>
                                <option value="submitted">submitted</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Score (%)</label>
                              <Input
                                value={editScore}
                                onChange={(event) => {
                                  const nextValue = normalizeNumberInput(event.target.value);
                                  setEditScore(nextValue);
                                  syncPointsFromPercent(nextValue, editPointsPossible);
                                }}
                                placeholder={editStatus === "graded" ? "0-100" : "Optional"}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Points earned</label>
                              <Input
                                value={editPointsEarned}
                                onChange={(event) => {
                                  const nextValue = normalizeNumberInput(event.target.value);
                                  setEditPointsEarned(nextValue);
                                  syncPercentFromPoints(nextValue, editPointsPossible);
                                }}
                                placeholder="e.g. 10"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Points possible</label>
                              <Input
                                value={editPointsPossible}
                                onChange={(event) => {
                                  const nextValue = normalizeNumberInput(event.target.value);
                                  setEditPointsPossible(nextValue);
                                  if ((editPointsEarned || "").trim().length > 0) {
                                    syncPercentFromPoints(editPointsEarned, nextValue);
                                  } else {
                                    syncPointsFromPercent(editScore, nextValue);
                                  }
                                }}
                                placeholder="e.g. 10"
                              />
                            </div>
                          </div>
                          <p className="text-xs text-muted">
                            Enter either percent or points. Values auto-convert both ways.
                          </p>

                          <div className="space-y-1">
                            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Feedback</label>
                            <textarea
                              value={editFeedback}
                              onChange={(event) => setEditFeedback(event.target.value)}
                              className="min-h-20 w-full rounded-[10px] border border-borderc bg-soft px-3 py-2 text-sm text-text outline-none focus-visible:ring-2 focus-visible:ring-accent/55"
                              placeholder="Optional note to student"
                            />
                          </div>

                          <div className="flex gap-2">
                            <Button
                              loading={savingEdit}
                              disabled={savingEdit}
                              onClick={async () => {
                                if (savingEdit) return;
                                if (!supabase) {
                                  push({
                                    title: "Unable to update grade",
                                    description: "Not connected to database.",
                                    tone: "error"
                                  });
                                  return;
                                }

                                const numericScore =
                                  editScore.trim().length === 0 ? null : Number.parseFloat(editScore.trim());

                                if (
                                  editStatus === "graded" &&
                                  (numericScore === null ||
                                    Number.isNaN(numericScore) ||
                                    numericScore < 0 ||
                                    numericScore > 100)
                                ) {
                                  push({
                                    title: "Score must be between 0 and 100",
                                    tone: "error"
                                  });
                                  return;
                                }

                                setSavingEdit(true);
                                try {
                                  const { submissionId } = await upsertManualGrade(supabase, {
                                    assignmentId: row.assignment_id,
                                    studentId: row.student_id,
                                    status: editStatus,
                                    score: editStatus === "graded" ? numericScore : null,
                                    feedback: editFeedback.trim() || null
                                  });

                                  let warning: string | undefined;
                                  if (editStatus === "graded" && submissionId) {
                                    try {
                                      const emailResult = await sendGradeChangeEmailNotice(submissionId);
                                      warning = emailResult.warning;
                                    } catch (emailError) {
                                      warning = (emailError as Error).message;
                                    }
                                  }

                                  push({
                                    title: "Grade updated",
                                    description: warning,
                                    tone: warning ? "default" : "success"
                                  });
                                  setEditingRowKey(null);
                                  setEditFeedback("");
                                  setEditScore("");
                                  setEditPointsEarned("");
                                  setEditPointsPossible("100");
                                  await refreshGradebook();
                                } catch (error) {
                                  push({
                                    title: "Unable to update grade",
                                    description: (error as Error).message,
                                    tone: "error"
                                  });
                                } finally {
                                  setSavingEdit(false);
                                }
                              }}
                            >
                              Save grade
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={() => {
                                setEditingRowKey(null);
                                setEditFeedback("");
                                setEditScore("");
                                setEditPointsEarned("");
                                setEditPointsPossible("100");
                              }}
                              disabled={savingEdit}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </CardBody>
            </Card>
          );
        })
      )}

      {integrityRows.length > 0 ? (
        <Card>
          <CardHeader>
            <h2 className="font-display text-2xl font-semibold">Integrity checks</h2>
          </CardHeader>
          <CardBody className="space-y-2">
            {integrityRows.map((row) => (
              <div key={row.examId} className="rounded-lg border border-borderc bg-soft px-3 py-2 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-text">{row.examTitle}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted">
                      {row.flaggedCount} flagged / {row.attemptCount} attempts
                    </span>
                    <Button size="sm" variant="secondary" asChild>
                      <Link href={`/app/professor/exams/${row.examId}/monitor`}>Open monitor</Link>
                    </Button>
                  </div>
                </div>
                {row.topFlags.length > 0 ? (
                  <p className="mt-1 text-xs text-muted">
                    Highest flags:{" "}
                    {row.topFlags.map((flag) => `${flag.student} (${flag.suspicion})`).join(", ")}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-muted">No flagged attempts.</p>
                )}
              </div>
            ))}
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}
