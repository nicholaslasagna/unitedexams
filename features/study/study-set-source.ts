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
  type: "single" | "multi" | "free";
  prompt_md: string;
  options: string[] | null;
  correct: number[] | null;
  explanation_md: string;
  solution_md: string | null;
  walkthrough_steps: string[] | null;
  references_data: string[] | null;
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
  return {
    id: row.id,
    externalId: row.external_id ?? undefined,
    type: row.type,
    prompt: row.prompt_md,
    options: row.options ?? undefined,
    correct: row.correct ?? undefined,
    explanation: row.explanation_md,
    solutionMd: row.solution_md ?? undefined,
    walkthroughSteps: row.walkthrough_steps ?? undefined,
    references: row.references_data ?? undefined,
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

export async function fetchPublishedStudySet(setId: string): Promise<QuizSet | null> {
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

  const { data: questionRows, error: questionsError } = await client
    .from("questions")
    .select(
      "id, external_id, quiz_set_id, type, prompt_md, options, correct, explanation_md, solution_md, walkthrough_steps, references_data, difficulty, homework_format, tags, from_professor"
    )
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

  return (data as QuizSetRow[]).map((row) => ({
    id: row.id,
    courseId: row.course_id,
    title: row.title,
    description: row.description,
    difficulty: mapDifficulty(row.difficulty),
    estMinutes: row.est_minutes,
    tags: row.tags ?? [],
    mode: row.mode ?? mode,
    questionCountTarget: row.question_count_target ?? undefined,
    isExamSimulation: Boolean(row.is_exam_simulation),
    timerDefaultMinutes: row.est_minutes,
    questions: []
  }));
}

export async function getStudySetWithFallback(setId: string): Promise<QuizSet | undefined> {
  const remote = await fetchPublishedStudySet(setId);
  return remote ?? getQuizSet(setId);
}
