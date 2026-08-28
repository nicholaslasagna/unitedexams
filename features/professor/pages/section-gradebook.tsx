"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { useAppData } from "@/lib/app-data-context";
import { isVerifiedProfessor } from "@/lib/auth/roles";
import { useToast } from "@/lib/hooks/use-toast";
import { sendGradeChangeEmailNotice } from "@/features/announcements/api";
import {
  getExamMonitor,
  listSectionExams,
  type ExamMonitorRow,
  type ExamRow
} from "@/features/exams/api";
import {
  getSectionGradebook,
  listProfessorSections,
  updateSectionGradingPolicy,
  upsertManualGrade,
  type SectionGradebookRow,
  type SectionSummary
} from "@/features/professor/api";
import { getSubmissionReview, type SubmissionReview, type SubmissionReviewKind } from "@/features/submissions/api";
import { SubmissionReviewContent } from "@/features/submissions/review-content";

type ReviewRequest = {
  kind: SubmissionReviewKind;
  sourceId: string;
  studentId: string;
  reviewId?: string | null;
  buttonKey: string;
};

type IntegritySummaryRow = {
  examId: string;
  examTitle: string;
  attemptCount: number;
  flaggedCount: number;
  topFlags: Array<{ student: string; suspicion: number }>;
};

type SectionExamGroup = {
  exam: ExamRow;
  attempts: ExamMonitorRow[];
};

function formatStatusLabel(status: string | null | undefined) {
  switch (status) {
    case "graded":
      return "Graded";
    case "needs_review":
      return "Needs review";
    case "submitted":
      return "Submitted";
    case "in_progress":
      return "In progress";
    case "expired":
      return "Expired";
    default:
      return "Not submitted";
  }
}

function formatAttemptMeta(value: string | null | undefined) {
  return value ? new Date(value).toLocaleString() : null;
}

export function ProfessorSectionGradebookPage({ sectionId }: { sectionId?: string } = {}) {
  const params = useParams<{ id?: string; sectionId?: string }>();
  const resolvedSectionId = sectionId ?? params.sectionId ?? params.id ?? "";
  const { profile, supabase } = useAppData();
  const { push } = useToast();

  const [section, setSection] = useState<SectionSummary | null>(null);
  const [assignmentWeight, setAssignmentWeight] = useState("40");
  const [examWeight, setExamWeight] = useState("60");
  const [savingPolicy, setSavingPolicy] = useState(false);
  const [rows, setRows] = useState<SectionGradebookRow[]>([]);
  const [examGroups, setExamGroups] = useState<SectionExamGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRowKey, setEditingRowKey] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<"submitted" | "graded" | "needs_review">("graded");
  const [editScore, setEditScore] = useState("");
  const [editPointsEarned, setEditPointsEarned] = useState("");
  const [editPointsPossible, setEditPointsPossible] = useState("100");
  const [editFeedback, setEditFeedback] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [integrityRows, setIntegrityRows] = useState<IntegritySummaryRow[]>([]);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewButtonLoadingKey, setReviewButtonLoadingKey] = useState<string | null>(null);
  const [reviewSelectionLoadingId, setReviewSelectionLoadingId] = useState<string | null>(null);
  const [activeReviewRequest, setActiveReviewRequest] = useState<ReviewRequest | null>(null);
  const [activeReview, setActiveReview] = useState<SubmissionReview | null>(null);

  const isProfessor = isVerifiedProfessor(profile);

  const refreshGradebook = useCallback(async () => {
    if (!supabase || !resolvedSectionId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [sections, gradebookRows, sectionExamRows] = await Promise.all([
        listProfessorSections(supabase),
        getSectionGradebook(supabase, resolvedSectionId),
        listSectionExams(supabase, resolvedSectionId)
      ]);

      setSection(sections.find((item) => item.id === resolvedSectionId) ?? null);
      setRows(gradebookRows.filter((row) => row.student_id !== profile?.id));

      const monitorRows = await Promise.all(
        sectionExamRows.map(async (exam) => {
          try {
            const attempts = (await getExamMonitor(supabase, exam.id)).filter((attempt) => attempt.student_id !== profile?.id);
            const flagged = attempts.filter((attempt) => attempt.flagged).sort((a, b) => b.suspicion_score - a.suspicion_score);
            return {
              exam,
              attempts,
              integrity: {
                examId: exam.id,
                examTitle: exam.title,
                attemptCount: attempts.length,
                flaggedCount: flagged.length,
                topFlags: flagged.slice(0, 3).map((attempt) => ({
                  student: attempt.student_display_name,
                  suspicion: attempt.suspicion_score
                }))
              } satisfies IntegritySummaryRow
            };
          } catch {
            return {
              exam,
              attempts: [] as ExamMonitorRow[],
              integrity: {
                examId: exam.id,
                examTitle: exam.title,
                attemptCount: 0,
                flaggedCount: 0,
                topFlags: []
              } satisfies IntegritySummaryRow
            };
          }
        })
      );

      setExamGroups(monitorRows.map((item) => ({ exam: item.exam, attempts: item.attempts })));
      setIntegrityRows(monitorRows.map((item) => item.integrity));
    } catch {
      setSection(null);
      setRows([]);
      setExamGroups([]);
      setIntegrityRows([]);
    } finally {
      setLoading(false);
    }
  }, [profile?.id, resolvedSectionId, supabase]);

  useEffect(() => {
    let active = true;
    if (!active) return;
    void refreshGradebook();
    return () => {
      active = false;
    };
  }, [refreshGradebook]);

  useEffect(() => {
    if (!section) return;
    setAssignmentWeight(String(section.assignment_weight));
    setExamWeight(String(section.exam_weight));
  }, [section]);

  const groupedAssignments = useMemo(() => {
    const byAssignment = new Map<string, { assignmentTitle: string; rows: SectionGradebookRow[] }>();

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

  const loadReview = useCallback(
    async (request: ReviewRequest, reviewId?: string | null) => {
      const nextReviewId = reviewId ?? request.reviewId ?? null;
      const selectingHistory = Boolean(reviewModalOpen && nextReviewId && activeReviewRequest);

      if (selectingHistory) {
        setReviewSelectionLoadingId(nextReviewId);
      } else {
        setReviewButtonLoadingKey(request.buttonKey);
        setReviewLoading(true);
      }

      try {
        const review = await getSubmissionReview({
          kind: request.kind,
          sourceId: request.sourceId,
          studentId: request.studentId,
          reviewId: nextReviewId
        });

        setActiveReviewRequest({ ...request, reviewId: nextReviewId });
        setActiveReview(review);
        setReviewModalOpen(true);
      } catch (error) {
        push({
          title: "Unable to load submitted work",
          description: (error as Error).message,
          tone: "error"
        });
      } finally {
        setReviewLoading(false);
        setReviewButtonLoadingKey(null);
        setReviewSelectionLoadingId(null);
      }
    },
    [activeReviewRequest, push, reviewModalOpen]
  );

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

      <Card>
        <CardHeader>
          <div>
            <h2 className="font-display text-2xl font-semibold">Course grading policy</h2>
            <p className="mt-1 text-sm text-muted">Student course averages in this section follow these weights.</p>
          </div>
        </CardHeader>
        <CardBody className="space-y-3">
          <div className="grid gap-3 md:grid-cols-[minmax(0,220px)_minmax(0,220px)_1fr] md:items-end">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Assignments (%)</label>
              <Input
                value={assignmentWeight}
                onChange={(event) => setAssignmentWeight(normalizeNumberInput(event.target.value))}
                placeholder="40"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Exams (%)</label>
              <Input
                value={examWeight}
                onChange={(event) => setExamWeight(normalizeNumberInput(event.target.value))}
                placeholder="60"
              />
            </div>
            <div className="text-sm text-muted">
              Current total:{" "}
              <span className="font-semibold text-text">
                {(Number.parseInt(assignmentWeight || "0", 10) || 0) +
                  (Number.parseInt(examWeight || "0", 10) || 0)}
                %
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              loading={savingPolicy}
              disabled={savingPolicy}
              onClick={async () => {
                if (!supabase) {
                  push({
                    title: "Unable to update grading policy",
                    description: "Not connected to database.",
                    tone: "error"
                  });
                  return;
                }

                const nextAssignment = Number.parseInt(assignmentWeight, 10);
                const nextExam = Number.parseInt(examWeight, 10);

                if (
                  Number.isNaN(nextAssignment) ||
                  Number.isNaN(nextExam) ||
                  nextAssignment < 0 ||
                  nextExam < 0 ||
                  nextAssignment > 100 ||
                  nextExam > 100
                ) {
                  push({
                    title: "Weights must be between 0 and 100",
                    tone: "error"
                  });
                  return;
                }

                if (nextAssignment + nextExam !== 100) {
                  push({
                    title: "Weights must total 100",
                    description: "Set assignment and exam weights so they add up to 100%.",
                    tone: "error"
                  });
                  return;
                }

                setSavingPolicy(true);
                try {
                  const updated = await updateSectionGradingPolicy(supabase, {
                    sectionId: section.id,
                    assignmentWeight: nextAssignment,
                    examWeight: nextExam
                  });
                  setSection(updated);
                  push({
                    title: "Grading policy updated",
                    tone: "success"
                  });
                } catch (error) {
                  push({
                    title: "Unable to update grading policy",
                    description: (error as Error).message,
                    tone: "error"
                  });
                } finally {
                  setSavingPolicy(false);
                }
              }}
            >
              Save policy
            </Button>
            <Button
              variant="ghost"
              disabled={savingPolicy}
              onClick={() => {
                setAssignmentWeight(String(section.assignment_weight));
                setExamWeight(String(section.exam_weight));
              }}
            >
              Reset
            </Button>
          </div>
        </CardBody>
      </Card>

      {groupedAssignments.length === 0 ? (
        <Card>
          <CardBody className="p-6 text-sm text-muted">No assignment submissions yet.</CardBody>
        </Card>
      ) : (
        groupedAssignments.map(({ assignmentId, assignmentTitle, rows: gradeRows }) => (
          <Card key={assignmentId}>
            <CardHeader>
              <h2 className="font-display text-2xl font-semibold">{assignmentTitle}</h2>
            </CardHeader>
            <CardBody className="space-y-2">
              {gradeRows.map((row) => {
                const rowKey = `${row.assignment_id}:${row.student_id}`;
                const submittedLabel = formatAttemptMeta(row.submitted_at);

                return (
                  <div key={rowKey} className="rounded-lg border border-borderc bg-soft px-3 py-2 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium text-text">{row.display_name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-muted">
                          {formatStatusLabel(row.latest_status)}
                          {row.latest_score !== null ? ` · ${row.latest_score}%` : ""}
                          {submittedLabel ? ` · ${submittedLabel}` : ""}
                        </span>
                        {row.latest_submission_id ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={reviewButtonLoadingKey === rowKey}
                            onClick={() => {
                              void loadReview({
                                kind: "assignment",
                                sourceId: row.assignment_id,
                                studentId: row.student_id,
                                reviewId: row.latest_submission_id,
                                buttonKey: rowKey
                              });
                            }}
                          >
                            {reviewButtonLoadingKey === rowKey ? "Loading work…" : "View work"}
                          </Button>
                        ) : null}
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
                            setEditPointsEarned(row.latest_score === null ? "" : String(Math.round(row.latest_score * 100) / 100));
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
                              aria-label="Status"
                              className="h-10 w-full rounded-[10px] border border-borderc bg-soft px-3 text-sm text-text"
                              value={editStatus}
                              onChange={(event) => setEditStatus(event.target.value as "submitted" | "graded" | "needs_review")}
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
                        <p className="text-xs text-muted">Enter either percent or points. Values auto-convert both ways.</p>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Feedback</label>
                          <textarea
                            aria-label="Feedback"
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

                              const numericScore = editScore.trim().length === 0 ? null : Number.parseFloat(editScore.trim());

                              if (
                                editStatus === "graded" &&
                                (numericScore === null || Number.isNaN(numericScore) || numericScore < 0 || numericScore > 100)
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
        ))
      )}

      {examGroups.length > 0 ? (
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-display text-2xl font-semibold">Exam attempts</h2>
                <p className="mt-1 text-sm text-muted">Open any submitted exam attempt to review exactly what the student turned in.</p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            {examGroups.map(({ exam, attempts }) => {
              const integrity = integrityRows.find((row) => row.examId === exam.id);
              return (
                <div key={exam.id} className="rounded-xl border border-borderc bg-soft p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-semibold text-text">{exam.title}</p>
                        <Badge tone={exam.published ? "success" : "default"}>{exam.published ? "Published" : "Draft"}</Badge>
                        <Badge tone="warn">{attempts.length} attempt{attempts.length === 1 ? "" : "s"}</Badge>
                        {integrity && integrity.flaggedCount > 0 ? <Badge tone="danger">{integrity.flaggedCount} flagged</Badge> : null}
                      </div>
                      <p className="mt-1 text-sm text-muted">
                        {exam.starts_at ? `${new Date(exam.starts_at).toLocaleString()} → ${new Date(exam.ends_at).toLocaleString()}` : "Exam window unavailable"}
                      </p>
                    </div>
                    <Button size="sm" variant="secondary" asChild>
                      <Link href={`/app/professor/exams/${exam.id}/monitor`}>Open monitor</Link>
                    </Button>
                  </div>

                  {attempts.length === 0 ? (
                    <p className="mt-3 text-sm text-muted">No attempts recorded for this exam yet.</p>
                  ) : (
                    <div className="mt-3 space-y-2">
                      {attempts.map((attempt) => {
                        const rowKey = `exam:${attempt.attempt_id}`;
                        return (
                          <div key={attempt.attempt_id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-borderc bg-surface px-3 py-2 text-sm">
                            <div>
                              <p className="font-medium text-text">{attempt.student_display_name}</p>
                              <p className="text-muted">
                                {formatStatusLabel(attempt.status)}
                                {attempt.score !== null ? ` · ${attempt.score}%` : ""}
                                {attempt.submitted_at ? ` · ${new Date(attempt.submitted_at).toLocaleString()}` : ""}
                                {attempt.flagged ? ` · Integrity ${attempt.suspicion_score}` : ""}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {attempt.flagged ? <Badge tone="danger">Flagged</Badge> : null}
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled={reviewButtonLoadingKey === rowKey}
                                onClick={() => {
                                  void loadReview({
                                    kind: "exam",
                                    sourceId: exam.id,
                                    studentId: attempt.student_id,
                                    reviewId: attempt.attempt_id,
                                    buttonKey: rowKey
                                  });
                                }}
                              >
                                {reviewButtonLoadingKey === rowKey ? "Loading work…" : "View work"}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </CardBody>
        </Card>
      ) : null}

      <Modal
        open={reviewModalOpen}
        onClose={() => {
          setReviewModalOpen(false);
          setActiveReview(null);
          setActiveReviewRequest(null);
          setReviewSelectionLoadingId(null);
        }}
        title={activeReview?.source.title ?? "Submitted work"}
        description={activeReview ? `${activeReview.studentName} · ${activeReview.source.sectionName}` : undefined}
        size="lg"
      >
        <SubmissionReviewContent
          review={activeReview}
          loading={reviewLoading}
          emptyMessage="No submitted work is attached to this record yet."
          selectedHistoryId={activeReview?.submission?.id ?? activeReview?.attempt?.id ?? null}
          selectingHistoryId={reviewSelectionLoadingId}
          onSelectHistory={
            activeReview && activeReviewRequest && activeReview.history.length > 1
              ? async (historyId) => {
                  await loadReview(activeReviewRequest, historyId);
                }
              : undefined
          }
        />
      </Modal>
    </div>
  );
}
