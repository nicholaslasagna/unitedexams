"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import { getCourse } from "@/data/seed";
import { listEnrolledPublishedExams, type ExamRow } from "@/features/exams/api";
import { listJoinedSections, type JoinedSectionSummary } from "@/features/professor/api";

type AssignmentLite = {
  id: string;
  section_id: string;
  title: string | null;
  due_at: string | null;
  created_at: string;
};

type AssignmentSubmissionLite = {
  id: string;
  assignment_id: string;
  status: "submitted" | "graded" | "needs_review";
  score: number | null;
  feedback_md: string | null;
  graded_at: string | null;
  created_at: string;
  updated_at: string | null;
};

type ExamAttemptLite = {
  id: string;
  exam_id: string;
  status: string;
  score: number | null;
  submitted_at: string | null;
  created_at: string;
  updated_at: string | null;
};

export interface StudentGradeItem {
  key: string;
  kind: "assignment" | "exam";
  sourceId: string;
  reviewId: string | null;
  title: string;
  sectionId: string;
  sectionName: string;
  status: "graded" | "submitted" | "needs_review" | "not_submitted" | "in_progress" | "expired";
  score: number | null;
  updatedAt: string | null;
  feedbackAvailable: boolean;
}

export interface StudentCourseGradeSummary {
  courseId: string;
  courseName: string;
  courseCode: string;
  sections: JoinedSectionSummary[];
  average: number | null;
  gradedCount: number;
  pendingCount: number;
  latestUpdatedAt: string | null;
  items: StudentGradeItem[];
}

function humanizeCourseId(courseId: string) {
  return courseId
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function toTimestamp(value: string | null | undefined) {
  if (!value) return 0;
  const stamp = new Date(value).getTime();
  return Number.isNaN(stamp) ? 0 : stamp;
}

function pickLatestSubmission(current: AssignmentSubmissionLite | undefined, next: AssignmentSubmissionLite) {
  if (!current) return next;
  const currentStamp = Math.max(toTimestamp(current.updated_at), toTimestamp(current.graded_at), toTimestamp(current.created_at));
  const nextStamp = Math.max(toTimestamp(next.updated_at), toTimestamp(next.graded_at), toTimestamp(next.created_at));
  return nextStamp >= currentStamp ? next : current;
}

function pickLatestAttempt(current: ExamAttemptLite | undefined, next: ExamAttemptLite) {
  if (!current) return next;
  const currentStamp = Math.max(toTimestamp(current.submitted_at), toTimestamp(current.updated_at), toTimestamp(current.created_at));
  const nextStamp = Math.max(toTimestamp(next.submitted_at), toTimestamp(next.updated_at), toTimestamp(next.created_at));
  return nextStamp >= currentStamp ? next : current;
}

function normalizeExamStatus(attempt: ExamAttemptLite): StudentGradeItem["status"] {
  if (attempt.score !== null) return "graded";
  if (attempt.status === "in_progress") return "in_progress";
  if (attempt.status === "expired") return "expired";
  return "submitted";
}

export async function listStudentCourseGrades(client: SupabaseClient, userId: string) {
  const joinedSections = (await listJoinedSections(client, userId)).filter((section) => section.role === "student");
  if (joinedSections.length === 0) return [] as StudentCourseGradeSummary[];

  const sectionIds = joinedSections.map((section) => section.sectionId);
  const sectionById = new Map(joinedSections.map((section) => [section.sectionId, section]));

  const { data: assignmentRows, error: assignmentError } = await client
    .from("assignments")
    .select("id, section_id, title, due_at, created_at")
    .in("section_id", sectionIds)
    .order("created_at", { ascending: false });

  if (assignmentError) throw assignmentError;

  const assignments = (assignmentRows ?? []) as AssignmentLite[];
  const assignmentIds = assignments.map((assignment) => assignment.id);

  let submissionRows: AssignmentSubmissionLite[] = [];
  if (assignmentIds.length > 0) {
    const { data, error } = await client
      .from("assignment_submissions")
      .select("id, assignment_id, status, score, feedback_md, graded_at, created_at, updated_at")
      .eq("user_id", userId)
      .in("assignment_id", assignmentIds)
      .order("updated_at", { ascending: false });

    if (error) throw error;
    submissionRows = (data ?? []) as AssignmentSubmissionLite[];
  }

  const latestSubmissionByAssignment = new Map<string, AssignmentSubmissionLite>();
  for (const submission of submissionRows) {
    latestSubmissionByAssignment.set(
      submission.assignment_id,
      pickLatestSubmission(latestSubmissionByAssignment.get(submission.assignment_id), submission)
    );
  }

  const publishedExams = (await listEnrolledPublishedExams(client)).filter((exam) => sectionIds.includes(exam.section_id));
  const examIds = publishedExams.map((exam) => exam.id);

  let attemptRows: ExamAttemptLite[] = [];
  if (examIds.length > 0) {
    const { data, error } = await client
      .from("exam_attempts")
      .select("id, exam_id, status, score, submitted_at, created_at, updated_at")
      .eq("student_id", userId)
      .in("exam_id", examIds)
      .order("updated_at", { ascending: false });

    if (error) throw error;
    attemptRows = (data ?? []) as ExamAttemptLite[];
  }

  const examById = new Map(publishedExams.map((exam) => [exam.id, exam] as const));
  const latestAttemptByExam = new Map<string, ExamAttemptLite>();
  for (const attempt of attemptRows) {
    latestAttemptByExam.set(attempt.exam_id, pickLatestAttempt(latestAttemptByExam.get(attempt.exam_id), attempt));
  }

  const courses = new Map<
    string,
    {
      courseId: string;
      courseName: string;
      courseCode: string;
      sections: JoinedSectionSummary[];
      items: StudentGradeItem[];
    }
  >();

  const ensureCourse = (courseId: string) => {
    const existing = courses.get(courseId);
    if (existing) return existing;
    const seedCourse = getCourse(courseId);
    const next = {
      courseId,
      courseName: seedCourse?.name ?? humanizeCourseId(courseId),
      courseCode: seedCourse?.code ?? courseId.toUpperCase(),
      sections: joinedSections.filter((section) => section.courseId === courseId),
      items: [] as StudentGradeItem[]
    };
    courses.set(courseId, next);
    return next;
  };

  for (const section of joinedSections) {
    ensureCourse(section.courseId);
  }

  for (const assignment of assignments) {
    const section = sectionById.get(assignment.section_id);
    if (!section) continue;
    const submission = latestSubmissionByAssignment.get(assignment.id);
    const status = !submission
      ? "not_submitted"
      : submission.score !== null
        ? "graded"
        : submission.status;

    ensureCourse(section.courseId).items.push({
      key: `assignment:${assignment.id}`,
      kind: "assignment",
      sourceId: assignment.id,
      reviewId: submission?.id ?? null,
      title: assignment.title?.trim() || "Assignment",
      sectionId: section.sectionId,
      sectionName: section.sectionName,
      status,
      score: submission?.score ?? null,
      updatedAt: submission?.graded_at ?? submission?.updated_at ?? submission?.created_at ?? assignment.due_at ?? assignment.created_at,
      feedbackAvailable: Boolean(submission?.feedback_md?.trim())
    });
  }

  for (const [examId, attempt] of latestAttemptByExam.entries()) {
    const exam = examById.get(examId) as ExamRow | undefined;
    if (!exam) continue;
    const section = sectionById.get(exam.section_id);
    if (!section) continue;

    ensureCourse(section.courseId).items.push({
      key: `exam:${exam.id}`,
      kind: "exam",
      sourceId: exam.id,
      reviewId: attempt.id,
      title: exam.title,
      sectionId: section.sectionId,
      sectionName: section.sectionName,
      status: normalizeExamStatus(attempt),
      score: attempt.score,
      updatedAt: attempt.submitted_at ?? attempt.updated_at ?? attempt.created_at,
      feedbackAvailable: false
    });
  }

  return Array.from(courses.values())
    .map((course) => {
      const sortedItems = [...course.items].sort((left, right) => {
        const stamp = toTimestamp(right.updatedAt) - toTimestamp(left.updatedAt);
        if (stamp !== 0) return stamp;
        return left.title.localeCompare(right.title);
      });

      const gradedItems = sortedItems.filter((item) => typeof item.score === "number");
      const pendingItems = sortedItems.filter((item) => item.score === null);
      const average =
        gradedItems.length > 0
          ? Math.round(
              (gradedItems.reduce((sum, item) => sum + Number(item.score ?? 0), 0) / gradedItems.length) * 10
            ) / 10
          : null;

      return {
        courseId: course.courseId,
        courseName: course.courseName,
        courseCode: course.courseCode,
        sections: course.sections,
        average,
        gradedCount: gradedItems.length,
        pendingCount: pendingItems.length,
        latestUpdatedAt: sortedItems[0]?.updatedAt ?? null,
        items: sortedItems
      } satisfies StudentCourseGradeSummary;
    })
    .sort((left, right) => {
      const stamp = toTimestamp(right.latestUpdatedAt) - toTimestamp(left.latestUpdatedAt);
      if (stamp !== 0) return stamp;
      return left.courseName.localeCompare(right.courseName);
    });
}
