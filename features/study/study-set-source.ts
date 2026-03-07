"use client";

import { getQuizSet } from "@/data/seed";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Question, QuizSet } from "@/lib/types";

interface QuizSetRow {
  id: string;
  course_id: string;
  title: string;
  description: string;
  difficulty: "intro" | "medium" | "hard";
  est_minutes: number;
  tags: string[];
  is_published: boolean;
  mode: "quiz" | "exam" | "homework" | null;
  question_count_target: number | null;
  is_exam_simulation: boolean | null;
}

interface QuestionRow {
  id: string;
  external_id: string | null;
  quiz_set_id: string;
  type: "single" | "multi" | "fill" | "free";
  prompt_md: string;
  options: string[] | null;
  correct: Array<number | string> | null;
  explanation_md: string;
  solution_md: string | null;
  walkthrough_steps: string[] | null;
  references_data?: string[] | null;
  reference_links?: string[] | null;
  difficulty: "easy" | "med" | "hard" | null;
  homework_format: "short" | "multi-step" | "proof" | "calc" | null;
  from_professor: boolean | null;
  tags: string[] | null;
}

function mapDifficulty(value: QuizSetRow["difficulty"]): QuizSet["difficulty"] {
  if (value === "intro") return "Beginner";
  if (value === "medium") return "Intermediate";
  return "Advanced";
}

function toQuestion(row: QuestionRow, fallbackTags: string[]): Question {
  const references =
    (Array.isArray(row.references_data) ? row.references_data : null) ??
    (Array.isArray(row.reference_links) ? row.reference_links : null) ??
    undefined;

  return {
    id: row.id,
    externalId: row.external_id ?? undefined,
    type: row.type,
    prompt: row.prompt_md,
    options: row.options ?? undefined,
    correct: Array.isArray(row.correct) ? row.correct : undefined,
    explanation: row.explanation_md,
    solutionMd: row.solution_md ?? undefined,
    walkthroughSteps: row.walkthrough_steps ?? undefined,
    references,
    tags: row.tags && row.tags.length > 0 ? row.tags : fallbackTags,
    difficulty: row.difficulty ?? undefined,
    homeworkFormat: row.homework_format ?? undefined,
    fromProfessor: Boolean(row.from_professor)
  };
}

function toQuizSet(row: QuizSetRow, questions: QuestionRow[]): QuizSet {
  return {
    id: row.id,
    courseId: row.course_id,
    title: row.title,
    description: row.description,
    difficulty: mapDifficulty(row.difficulty),
    estMinutes: row.est_minutes,
    tags: row.tags ?? [],
    mode: row.mode ?? "quiz",
    questionCountTarget: row.question_count_target ?? undefined,
    isExamSimulation: Boolean(row.is_exam_simulation),
    timerDefaultMinutes: row.est_minutes,
    questions: questions.map((question) => toQuestion(question, row.tags ?? []))
  };
}

async function loadQuestionCounts(client: NonNullable<ReturnType<typeof getSupabaseBrowserClient>>, setIds: string[]) {
  if (setIds.length === 0) return {} as Record<string, number>;

  const { data, error } = await client
    .from("questions")
    .select("quiz_set_id")
    .in("quiz_set_id", setIds);

  if (error || !data) return {} as Record<string, number>;

  return (data as Array<{ quiz_set_id: string }>).reduce<Record<string, number>>((acc, row) => {
    acc[row.quiz_set_id] = (acc[row.quiz_set_id] ?? 0) + 1;
    return acc;
  }, {});
}

async function loadProfessorSetIds(
  client: NonNullable<ReturnType<typeof getSupabaseBrowserClient>>,
  setIds: string[]
) {
  if (setIds.length === 0) return new Set<string>();
  const { data, error } = await client
    .from("questions")
    .select("quiz_set_id")
    .in("quiz_set_id", setIds)
    .eq("from_professor", true);

  if (error || !data) return new Set<string>();
  return new Set((data as Array<{ quiz_set_id: string }>).map((row) => row.quiz_set_id));
}

async function isProfessorSet(
  client: NonNullable<ReturnType<typeof getSupabaseBrowserClient>>,
  setId: string
) {
  const professorSetIds = await loadProfessorSetIds(client, [setId]);
  return professorSetIds.has(setId);
}

async function canAccessProfessorSetFromSection(
  client: NonNullable<ReturnType<typeof getSupabaseBrowserClient>>,
  setId: string,
  sectionId?: string,
  quizCourseId?: string
) {
  if (!sectionId) return false;

  const { data: assignmentRows, error: assignmentError } = await client
    .from("assignments")
    .select("id")
    .eq("quiz_set_id", setId)
    .eq("section_id", sectionId)
    .limit(1);

  if (!assignmentError && (assignmentRows?.length ?? 0) > 0) return true;

  const { data: examRows, error: examError } = await client
    .from("exams")
    .select("id")
    .eq("quiz_set_id", setId)
    .eq("section_id", sectionId)
    .limit(1);

  if (!examError && (examRows?.length ?? 0) > 0) return true;

  const { data: linkedRows, error: linkError } = await client
    .from("section_quiz_sets")
    .select("quiz_set_id")
    .eq("section_id", sectionId)
    .eq("quiz_set_id", setId)
    .limit(1);

  if (!linkError && (linkedRows?.length ?? 0) > 0) return true;

  if (!quizCourseId) return false;

  const [{ data: authData }, { data: sectionRow, error: sectionError }] = await Promise.all([
    client.auth.getUser(),
    client
      .from("class_sections")
      .select("course_id, created_by, owner_id")
      .eq("id", sectionId)
      .maybeSingle()
  ]);

  const userId = authData.user?.id;
  if (!userId || sectionError || !sectionRow || sectionRow.course_id !== quizCourseId) {
    return false;
  }

  if (sectionRow.created_by === userId || sectionRow.owner_id === userId) {
    return true;
  }

  const { data: membershipRow, error: membershipError } = await client
    .from("section_members")
    .select("role")
    .eq("section_id", sectionId)
    .eq("user_id", userId)
    .maybeSingle();

  if (membershipError || !membershipRow) return false;
  return membershipRow.role === "professor" || membershipRow.role === "ta";
}

export async function fetchPublishedStudySet(
  setId: string,
  options?: { sectionId?: string }
): Promise<QuizSet | null> {
  const client = getSupabaseBrowserClient();
  if (!client) return null;

  const { data: quizRow, error: quizError } = await client
    .from("quiz_sets")
    .select(
      "id, course_id, title, description, difficulty, est_minutes, tags, is_published, mode, question_count_target, is_exam_simulation"
    )
    .eq("id", setId)
    .eq("is_published", true)
    .maybeSingle();

  if (quizError || !quizRow) return null;

  const professorOwned = await isProfessorSet(client, setId);
  if (professorOwned) {
    const allowed = await canAccessProfessorSetFromSection(
      client,
      setId,
      options?.sectionId,
      quizRow.course_id
    );
    if (!allowed) return null;
  }

  const { data: questionRows, error: questionsError } = await client
    .from("questions")
    .select("*")
    .eq("quiz_set_id", setId)
    .order("created_at", { ascending: true });

  if (questionsError || !questionRows || questionRows.length === 0) return null;

  return toQuizSet(quizRow as QuizSetRow, questionRows as QuestionRow[]);
}

export async function fetchPublishedSetsByMode(mode: "quiz" | "exam" | "homework"): Promise<QuizSet[]> {
  const client = getSupabaseBrowserClient();
  if (!client) return [];

  const { data, error } = await client
    .from("quiz_sets")
    .select(
      "id, course_id, title, description, difficulty, est_minutes, tags, is_published, mode, question_count_target, is_exam_simulation"
    )
    .eq("is_published", true)
    .eq("mode", mode)
    .order("course_id", { ascending: true })
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  const rows = data as QuizSetRow[];
  const setIds = rows.map((row) => row.id);
  const [counts, professorSetIds] = await Promise.all([
    loadQuestionCounts(client, setIds),
    loadProfessorSetIds(client, setIds)
  ]);
  const publicRows = rows.filter((row) => !professorSetIds.has(row.id));

  return publicRows.map((row) => ({
    id: row.id,
    courseId: row.course_id,
    title: row.title,
    description: row.description,
    difficulty: mapDifficulty(row.difficulty),
    estMinutes: row.est_minutes,
    tags: row.tags ?? [],
    mode: row.mode ?? mode,
    questionCountTarget: row.question_count_target ?? counts[row.id] ?? undefined,
    isExamSimulation: Boolean(row.is_exam_simulation),
    timerDefaultMinutes: row.est_minutes,
    questions: []
  }));
}

export async function fetchPublishedSetsByCourse(courseId: string): Promise<QuizSet[]> {
  const client = getSupabaseBrowserClient();
  if (!client) return [];

  const { data, error } = await client
    .from("quiz_sets")
    .select(
      "id, course_id, title, description, difficulty, est_minutes, tags, is_published, mode, question_count_target, is_exam_simulation"
    )
    .eq("is_published", true)
    .eq("course_id", courseId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  const rows = data as QuizSetRow[];
  const setIds = rows.map((row) => row.id);
  const [counts, professorSetIds] = await Promise.all([
    loadQuestionCounts(client, setIds),
    loadProfessorSetIds(client, setIds)
  ]);
  const publicRows = rows.filter((row) => !professorSetIds.has(row.id));

  return publicRows.map((row) => ({
    id: row.id,
    courseId: row.course_id,
    title: row.title,
    description: row.description,
    difficulty: mapDifficulty(row.difficulty),
    estMinutes: row.est_minutes,
    tags: row.tags ?? [],
    mode: row.mode ?? "quiz",
    questionCountTarget: row.question_count_target ?? counts[row.id] ?? undefined,
    isExamSimulation: Boolean(row.is_exam_simulation),
    timerDefaultMinutes: row.est_minutes,
    questions: []
  }));
}

export async function getStudySetWithFallback(setId: string): Promise<QuizSet | undefined> {
  const remote = await fetchPublishedStudySet(setId);
  return remote ?? getQuizSet(setId);
}
