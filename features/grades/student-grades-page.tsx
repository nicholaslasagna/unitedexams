"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ClipboardList, FolderOpen } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ProgressBar } from "@/components/ui/progress";
import { useAppData } from "@/lib/app-data-context";
import { useToast } from "@/lib/hooks/use-toast";
import { formatRelativeDate } from "@/lib/utils";
import { isUniversityAdmin, isVerifiedProfessor } from "@/lib/auth/roles";
import { getCourseVisual } from "@/features/study/course-branding";
import { listStudentCourseGrades, type StudentCourseGradeSummary, type StudentGradeItem } from "@/features/grades/api";
import { computeOverallAverageFromCourseSummaries } from "@/features/grades/metrics";
import { getSubmissionReview, type SubmissionReview } from "@/features/submissions/api";
import { SubmissionReviewContent } from "@/features/submissions/review-content";

function toneForScore(score: number | null) {
  if (score === null) return "default" as const;
  if (score >= 90) return "success" as const;
  if (score >= 75) return "brand" as const;
  if (score >= 60) return "warn" as const;
  return "danger" as const;
}

function statusLabel(item: StudentGradeItem) {
  switch (item.status) {
    case "graded":
      return item.score !== null ? `${item.score}%` : "Graded";
    case "needs_review":
      return "Needs review";
    case "submitted":
      return "Submitted";
    case "in_progress":
      return "In progress";
    case "expired":
      return item.score !== null ? `${item.score}%` : "Expired";
    default:
      return "Not submitted";
  }
}

function statusTone(item: StudentGradeItem) {
  if (item.status === "graded" || item.status === "expired") return toneForScore(item.score);
  if (item.status === "needs_review") return "warn" as const;
  if (item.status === "submitted" || item.status === "in_progress") return "info" as const;
  return "default" as const;
}

export function StudentGradesPage() {
  const { supabase, user, profile } = useAppData();
  const { push } = useToast();
  const [rows, setRows] = useState<StudentCourseGradeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSelectionLoadingId, setReviewSelectionLoadingId] = useState<string | null>(null);
  const [activeReviewItem, setActiveReviewItem] = useState<StudentGradeItem | null>(null);
  const [activeReview, setActiveReview] = useState<SubmissionReview | null>(null);

  const isProfessor = profile.role === "professor" || isVerifiedProfessor(profile);
  const isSchoolAdmin = isUniversityAdmin(profile);

  useEffect(() => {
    if (isProfessor || isSchoolAdmin) {
      setRows([]);
      setLoading(false);
      return;
    }

    if (!supabase || !user) {
      setRows([]);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);

    listStudentCourseGrades(supabase, user.id)
      .then((result) => {
        if (!active) return;
        setRows(result);
      })
      .catch(() => {
        if (!active) return;
        setRows([]);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isProfessor, isSchoolAdmin, supabase, user]);

  const totals = useMemo(() => {
    const allItems = rows.flatMap((row) => row.items);
    const graded = allItems.filter((item) => typeof item.score === "number");
    const pending = allItems.filter((item) => item.score === null);
    return {
      courseCount: rows.length,
      gradedCount: graded.length,
      pendingCount: pending.length,
      overallAverage: computeOverallAverageFromCourseSummaries(rows)
    };
  }, [rows]);

  if (isProfessor || isSchoolAdmin) {
    return (
      <Card>
        <CardBody className="p-8 text-sm text-text-secondary">
          Student grades are shown only to enrolled student accounts. Professors should use the section gradebook.
        </CardBody>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardBody className="p-8 text-sm text-text-secondary">Loading grades…</CardBody>
      </Card>
    );
  }

  if (rows.length === 0) {
    return (
      <Card>
        <CardBody className="space-y-4 p-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-2/35 bg-brand-2/10 text-brand-2">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xl font-semibold text-text">No course grades yet</p>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-secondary">
              Join a section and submit work there. Once your instructor grades assignments or section exams, your course averages will appear here.
            </p>
          </div>
          <Button asChild>
            <Link href="/app/sections">Open sections</Link>
          </Button>
        </CardBody>
      </Card>
    );
  }

  const loadReview = async (item: StudentGradeItem, reviewId?: string | null) => {
    setReviewLoading(true);
    setActiveReviewItem(item);
    try {
      const review = await getSubmissionReview({
        kind: item.kind,
        sourceId: item.sourceId,
        reviewId: reviewId ?? item.reviewId
      });
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
      setReviewSelectionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">Academic standing</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-text">Grades</h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-text-secondary">
            Overall course averages across your joined sections, including graded assignments and section exams.
          </p>
        </div>
        <Button variant="secondary" asChild>
          <Link href="/app/sections">Open sections</Link>
        </Button>
      </section>

      <div className="grid gap-3 md:grid-cols-4">
        <Card>
          <CardBody className="p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-text-secondary">Courses</p>
            <p className="mt-2 font-mono text-2xl font-bold text-text">{totals.courseCount}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-text-secondary">Overall average</p>
            <p className="mt-2 font-mono text-2xl font-bold text-text">
              {totals.overallAverage === null ? "—" : `${totals.overallAverage}%`}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-text-secondary">Graded items</p>
            <p className="mt-2 font-mono text-2xl font-bold text-text">{totals.gradedCount}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-text-secondary">Awaiting grade</p>
            <p className="mt-2 font-mono text-2xl font-bold text-text">{totals.pendingCount}</p>
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {rows.map((course) => {
          const visual = getCourseVisual(course.courseId);
          const primarySection = course.sections[0] ?? null;
          const sectionLink = course.sections.length === 1 && primarySection ? `/app/sections/${primarySection.sectionId}` : "/app/sections";
          const sectionLabel = course.sections.length === 1 ? "Open section" : "Open sections";

          return (
            <Card key={course.courseId} className="overflow-hidden">
              <div className="grid gap-0 lg:grid-cols-[160px_1fr]">
                <div className={`relative min-h-[150px] overflow-hidden border-b border-borderc lg:min-h-full lg:border-b-0 lg:border-r ${visual.glowClass}`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${visual.surfaceClass}`} />
                  <Image
                    src={visual.artworkSrc}
                    alt={`${course.courseName} artwork`}
                    fill
                    className="object-cover opacity-95"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-text-secondary">{course.courseCode}</p>
                    <p className="mt-1 text-lg font-semibold text-text">{course.courseName}</p>
                  </div>
                </div>

                <CardBody className="space-y-4 p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={toneForScore(course.average)}>{course.average === null ? "No average yet" : `${course.average}% overall`}</Badge>
                    <Badge>{course.sections.length} section{course.sections.length === 1 ? "" : "s"}</Badge>
                    <Badge tone="info">{course.gradedCount} graded</Badge>
                    <Badge tone={course.pendingCount > 0 ? "warn" : "default"}>{course.pendingCount} pending</Badge>
                    <Badge tone={course.hasMixedPolicies ? "warn" : "default"}>{course.policyLabel}</Badge>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-text">Current standing</p>
                    <p className="mt-1 text-sm text-text-secondary">
                      {course.latestUpdatedAt
                        ? `Last updated ${formatRelativeDate(course.latestUpdatedAt)}`
                        : "No graded work has landed yet for this course."}
                    </p>
                  </div>

                  <ProgressBar value={course.average ?? 0} />

                  <div className="space-y-2">
                    {course.items.length === 0 ? (
                      <div className="rounded-[1rem] border border-borderc bg-soft px-4 py-3 text-sm text-text-secondary">
                        No assignments or section exam attempts have been graded yet.
                      </div>
                    ) : (
                      course.items.map((item) => (
                        <div key={item.key} className="flex items-start justify-between gap-3 rounded-[1rem] border border-borderc bg-soft px-4 py-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate text-sm font-semibold text-text">{item.title}</p>
                              <Badge size="sm" tone={item.kind === "exam" ? "warn" : "brand"}>
                                {item.kind === "exam" ? "Exam" : "Assignment"}
                              </Badge>
                              {item.feedbackAvailable ? (
                                <Badge size="sm" tone="info">
                                  Feedback
                                </Badge>
                              ) : null}
                            </div>
                            <p className="mt-1 text-xs text-text-secondary">
                              {item.sectionName}
                              {item.updatedAt ? ` · ${formatRelativeDate(item.updatedAt)}` : ""}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <Badge tone={statusTone(item)}>{statusLabel(item)}</Badge>
                            {item.reviewId ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled={reviewLoading && activeReviewItem?.key === item.key}
                                onClick={() => {
                                  void loadReview(item);
                                }}
                              >
                                {reviewLoading && activeReviewItem?.key === item.key ? "Loading…" : "View work"}
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button asChild>
                      <Link href={sectionLink}>
                        {sectionLabel}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="secondary" asChild>
                      <Link href={`/app/courses/${course.courseId}`}>
                        Open course hub
                        <FolderOpen className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardBody>
              </div>
            </Card>
          );
        })}
      </div>

      <Modal
        open={reviewModalOpen}
        onClose={() => {
          setReviewModalOpen(false);
          setActiveReview(null);
          setActiveReviewItem(null);
          setReviewSelectionLoadingId(null);
        }}
        title={activeReview?.source.title ?? activeReviewItem?.title ?? "Submitted work"}
        description={activeReview?.studentName ? `${activeReview.studentName} · ${activeReview.source.sectionName}` : undefined}
        size="lg"
      >
        <SubmissionReviewContent
          review={activeReview}
          loading={reviewLoading}
          emptyMessage="No submitted work is attached to this grade item yet."
          selectedHistoryId={activeReview?.submission?.id ?? activeReview?.attempt?.id ?? null}
          selectingHistoryId={reviewSelectionLoadingId}
          onSelectHistory={
            activeReview && activeReview.history.length > 1 && activeReviewItem
              ? async (historyId) => {
                  setReviewSelectionLoadingId(historyId);
                  await loadReview(activeReviewItem, historyId);
                }
              : undefined
          }
        />
      </Modal>
    </div>
  );
}
