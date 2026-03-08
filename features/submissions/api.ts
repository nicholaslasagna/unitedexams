"use client";

export type SubmissionReviewKind = "assignment" | "exam";

export interface SubmissionReviewSource {
  id: string;
  title: string;
  sectionId: string;
  sectionName: string;
  courseId: string;
}

export interface SubmissionReviewQuestion {
  questionId: string;
  questionType: "single" | "multi" | "fill" | "free" | string;
  prompt: string;
  options: string[];
  correct: Array<number | string>;
  explanation: string;
  solutionMd: string | null;
  tags: string[];
  isCorrect: boolean;
  selected: Array<number | string>;
  responseText: string | null;
  selfMarked: boolean | null;
}

export interface SubmissionReviewHistoryItem {
  id: string;
  status: string;
  score: number | null;
  feedback: string | null;
  gradedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  startedAt: string | null;
  submittedAt: string | null;
  attemptId: string | null;
  suspicionScore: number | null;
}

export interface SubmissionReview {
  kind: SubmissionReviewKind;
  source: SubmissionReviewSource;
  studentId: string;
  studentName: string;
  solutionsVisible: boolean;
  history: SubmissionReviewHistoryItem[];
  submission: {
    id: string;
    assignmentId: string;
    studentId: string;
    attemptId: string | null;
    status: "submitted" | "graded" | "needs_review";
    score: number | null;
    feedback: string | null;
    gradedAt: string | null;
    createdAt: string | null;
    updatedAt: string | null;
  } | null;
  attempt: {
    id: string;
    status?: string;
    score: number | null;
    correctCount: number | null;
    totalCount: number | null;
    timeSpentSeconds: number | null;
    completedAt: string | null;
    submittedAt?: string | null;
    startedAt: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    suspicionScore?: number | null;
  } | null;
  questions: SubmissionReviewQuestion[];
}

async function parseJsonResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  const payload = (await response.json().catch(() => ({}))) as T & { error?: string; ok?: boolean };
  if (!response.ok || ("ok" in payload && payload.ok === false)) {
    throw new Error(payload.error || fallbackMessage);
  }
  return payload;
}

function normalizeQuestion(question: unknown): SubmissionReviewQuestion {
  const value = typeof question === "object" && question !== null ? (question as Record<string, unknown>) : {};
  return {
    questionId: String(value.questionId ?? ""),
    questionType: String(value.questionType ?? "single"),
    prompt: String(value.prompt ?? ""),
    options: Array.isArray(value.options) ? value.options.map((item) => String(item)) : [],
    correct: Array.isArray(value.correct)
      ? value.correct.map((item) => item as number | string)
      : [],
    explanation: String(value.explanation ?? ""),
    solutionMd: typeof value.solutionMd === "string" ? value.solutionMd : null,
    tags: Array.isArray(value.tags) ? value.tags.map((item) => String(item)) : [],
    isCorrect: Boolean(value.isCorrect),
    selected: Array.isArray(value.selected)
      ? value.selected.map((item) => item as number | string)
      : [],
    responseText: typeof value.responseText === "string" ? value.responseText : null,
    selfMarked: typeof value.selfMarked === "boolean" ? value.selfMarked : null
  };
}

function normalizeHistoryItem(item: unknown): SubmissionReviewHistoryItem {
  const value = typeof item === "object" && item !== null ? (item as Record<string, unknown>) : {};
  return {
    id: String(value.id ?? ""),
    status: String(value.status ?? "submitted"),
    score: typeof value.score === "number" ? value.score : value.score === null ? null : Number(value.score ?? null),
    feedback: typeof value.feedback === "string" ? value.feedback : null,
    gradedAt: typeof value.gradedAt === "string" ? value.gradedAt : null,
    createdAt: typeof value.createdAt === "string" ? value.createdAt : null,
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : null,
    startedAt: typeof value.startedAt === "string" ? value.startedAt : null,
    submittedAt: typeof value.submittedAt === "string" ? value.submittedAt : null,
    attemptId: typeof value.attemptId === "string" ? value.attemptId : null,
    suspicionScore:
      typeof value.suspicionScore === "number"
        ? value.suspicionScore
        : value.suspicionScore === null || value.suspicionScore === undefined
          ? null
          : Number(value.suspicionScore)
  };
}

export async function getSubmissionReview(payload: {
  kind: SubmissionReviewKind;
  sourceId: string;
  studentId?: string | null;
  reviewId?: string | null;
}) {
  const response = await fetch("/api/submissions/review", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const result = await parseJsonResponse<{ ok: true; review: SubmissionReview | null }>(
    response,
    "Unable to load submitted work."
  );

  const review = result.review;
  if (!review) return null;

  return {
    kind: review.kind,
    source: review.source,
    studentId: review.studentId,
    studentName: review.studentName,
    solutionsVisible: Boolean(review.solutionsVisible),
    history: Array.isArray(review.history) ? review.history.map((item) => normalizeHistoryItem(item)) : [],
    submission: review.submission
      ? {
          id: String(review.submission.id),
          assignmentId: String(review.submission.assignmentId),
          studentId: String(review.submission.studentId),
          attemptId: review.submission.attemptId ? String(review.submission.attemptId) : null,
          status: review.submission.status,
          score:
            typeof review.submission.score === "number"
              ? review.submission.score
              : review.submission.score === null
                ? null
                : Number(review.submission.score ?? null),
          feedback: review.submission.feedback ?? null,
          gradedAt: review.submission.gradedAt ?? null,
          createdAt: review.submission.createdAt ?? null,
          updatedAt: review.submission.updatedAt ?? null
        }
      : null,
    attempt: review.attempt
      ? {
          id: String(review.attempt.id),
          status: typeof review.attempt.status === "string" ? review.attempt.status : undefined,
          score:
            typeof review.attempt.score === "number"
              ? review.attempt.score
              : review.attempt.score === null
                ? null
                : Number(review.attempt.score ?? null),
          correctCount:
            typeof review.attempt.correctCount === "number"
              ? review.attempt.correctCount
              : review.attempt.correctCount === null || review.attempt.correctCount === undefined
                ? null
                : Number(review.attempt.correctCount),
          totalCount:
            typeof review.attempt.totalCount === "number"
              ? review.attempt.totalCount
              : review.attempt.totalCount === null || review.attempt.totalCount === undefined
                ? null
                : Number(review.attempt.totalCount),
          timeSpentSeconds:
            typeof review.attempt.timeSpentSeconds === "number"
              ? review.attempt.timeSpentSeconds
              : review.attempt.timeSpentSeconds === null || review.attempt.timeSpentSeconds === undefined
                ? null
                : Number(review.attempt.timeSpentSeconds),
          completedAt: review.attempt.completedAt ?? null,
          submittedAt: review.attempt.submittedAt ?? null,
          startedAt: review.attempt.startedAt ?? null,
          createdAt: review.attempt.createdAt ?? null,
          updatedAt: review.attempt.updatedAt ?? null,
          suspicionScore:
            typeof review.attempt.suspicionScore === "number"
              ? review.attempt.suspicionScore
              : review.attempt.suspicionScore === null || review.attempt.suspicionScore === undefined
                ? null
                : Number(review.attempt.suspicionScore)
        }
      : null,
    questions: Array.isArray(review.questions) ? review.questions.map((question) => normalizeQuestion(question)) : []
  } satisfies SubmissionReview;
}
