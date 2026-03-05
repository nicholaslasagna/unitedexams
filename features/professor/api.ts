import type { SupabaseClient } from "@supabase/supabase-js";

export interface SectionSummary {
  id: string;
  name: string;
  term: string | null;
  course_id: string;
  join_code: string;
  created_at: string;
}

export interface CreateProfessorQuizSetPayload {
  sectionId: string;
  title: string;
  description?: string;
  difficulty: "intro" | "medium" | "hard";
  estMinutes: number;
  mode: "quiz" | "exam" | "homework";
  tags: string[];
  questions: ProfessorQuizQuestionPayload[];
}

export interface ProfessorQuizQuestionPayload {
  type: "single" | "multi" | "fill" | "free";
  prompt: string;
  options?: string[];
  correctIndexes?: number[];
  acceptableAnswers?: string[];
  explanation?: string;
  tags?: string[];
}

export interface AssignmentRow {
  id: string;
  section_id: string;
  quiz_set_id: string;
  title: string | null;
  instructions_md: string | null;
  due_at: string | null;
  allow_late: boolean;
  max_attempts: number | null;
  grading_mode: "auto" | "manual" | "mixed";
  created_at: string;
}

export interface SectionMemberRow {
  user_id: string;
  role: "student" | "professor" | "ta";
  joined_at: string;
  profiles?: {
    display_name: string;
    email: string | null;
  }[] | null;
}

export interface SectionMaterialRow {
  id: string;
  section_id: string;
  title: string;
  body_md: string;
  attachments: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface AssignmentSubmissionRow {
  id: string;
  assignment_id: string;
  user_id: string;
  attempt_id: string | null;
  status: "submitted" | "graded" | "needs_review";
  score: number | null;
  feedback_md: string | null;
  graded_at: string | null;
  created_at: string;
}

export interface SectionGradebookRow {
  assignment_id: string;
  assignment_title: string;
  student_id: string;
  display_name: string;
  latest_status: string | null;
  latest_score: number | null;
  submitted_at: string | null;
}

export interface SectionAnalytics {
  avg_score: number;
  completion_count: number;
  score_buckets: Record<string, number>;
  weak_tags: Array<{ tag: string; misses: number }>;
}

export interface JoinedSectionSummary {
  sectionId: string;
  role: "student" | "professor" | "ta";
  joinedAt: string;
  sectionName: string;
  courseId: string;
  term: string | null;
  isOwner: boolean;
}

export async function listProfessorSections(client: SupabaseClient) {
  const { data, error } = await client
    .from("class_sections")
    .select("id, name, term, course_id, join_code, created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as SectionSummary[];
}

export async function createProfessorSection(
  client: SupabaseClient,
  payload: { name: string; term?: string; courseId: string; createdBy: string }
) {
  const joinCode = Array.from({ length: 8 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)]).join("");
  const attempts: Array<Record<string, string | null>> = [
    {
      name: payload.name,
      section_name: payload.name,
      term: payload.term ?? null,
      course_id: payload.courseId,
      created_by: payload.createdBy,
      owner_id: payload.createdBy,
      join_code: joinCode
    },
    {
      name: payload.name,
      term: payload.term ?? null,
      course_id: payload.courseId,
      created_by: payload.createdBy,
      join_code: joinCode
    },
    {
      section_name: payload.name,
      term: payload.term ?? null,
      course_id: payload.courseId,
      owner_id: payload.createdBy,
      join_code: joinCode
    }
  ];

  let lastError: { message: string } | null = null;
  for (const attempt of attempts) {
    const { error } = await client.from("class_sections").insert(attempt);
    if (!error) return;
    lastError = error;
  }

  throw new Error(lastError?.message ?? "Unable to create section.");
}

export async function deleteProfessorSection(client: SupabaseClient, sectionId: string) {
  const { error } = await client.from("class_sections").delete().eq("id", sectionId);
  if (error) throw error;
}

export async function regenerateJoinCode(client: SupabaseClient, sectionId: string) {
  const { data, error } = await client.rpc("regenerate_section_join_code", {
    section_id_input: sectionId
  });
  if (error) throw error;
  return data as string;
}

export async function joinSectionByCode(client: SupabaseClient, joinCode: string) {
  const normalized = joinCode.trim().toUpperCase();
  const first = await client.rpc("join_section_by_code", { join_code_input: normalized });
  if (!first.error) {
    return first.data as string;
  }

  const normalizedMessage = first.error.message.toLowerCase();
  const likelyArgMismatch =
    normalizedMessage.includes("could not find the function public.join_section_by_code(join_code_input)") ||
    (normalizedMessage.includes("schema cache") && normalizedMessage.includes("join_section_by_code"));

  if (!likelyArgMismatch) {
    throw first.error;
  }

  // Backward compatibility for legacy function argument name.
  const second = await client.rpc("join_section_by_code", { code: normalized });
  if (second.error) throw second.error;
  return second.data as string;
}

export async function listJoinedSections(client: SupabaseClient, userId: string) {
  type RawRow = {
    section_id: string;
    role: string | null;
    joined_at: string;
    class_sections:
      | {
          id: string;
          name: string | null;
          section_name: string | null;
          course_id: string;
          term: string | null;
          created_by: string | null;
          owner_id: string | null;
        }
      | Array<{
          id: string;
          name: string | null;
          section_name: string | null;
          course_id: string;
          term: string | null;
          created_by: string | null;
          owner_id: string | null;
        }>
      | null;
  };

  const { data, error } = await client
    .from("section_members")
    .select(
      "section_id, role, joined_at, class_sections(id, name, section_name, course_id, term, created_by, owner_id)"
    )
    .eq("user_id", userId)
    .order("joined_at", { ascending: false });

  if (error) throw error;

  return ((data ?? []) as RawRow[])
    .map((row) => {
      const section = Array.isArray(row.class_sections) ? row.class_sections[0] : row.class_sections;
      if (!section) return null;
      const normalizedRole = row.role === "professor" || row.role === "ta" ? row.role : "student";
      const ownerId = section.created_by ?? section.owner_id ?? "";
      return {
        sectionId: row.section_id,
        role: normalizedRole,
        joinedAt: row.joined_at,
        sectionName: (section.name || section.section_name || "Untitled Section").trim(),
        courseId: section.course_id,
        term: section.term,
        isOwner: ownerId !== "" && ownerId === userId
      } satisfies JoinedSectionSummary;
    })
    .filter((value): value is JoinedSectionSummary => Boolean(value));
}

export async function leaveJoinedSection(
  client: SupabaseClient,
  payload: { sectionId: string; userId: string }
) {
  const { error } = await client
    .from("section_members")
    .delete()
    .eq("section_id", payload.sectionId)
    .eq("user_id", payload.userId);

  if (error) throw error;
}

export async function createProfessorQuizSet(
  client: SupabaseClient,
  payload: CreateProfessorQuizSetPayload
) {
  const { data, error } = await client.rpc("create_professor_quiz_set", {
    section_id_input: payload.sectionId,
    title_input: payload.title,
    description_input: payload.description ?? "",
    difficulty_input: payload.difficulty,
    est_minutes_input: payload.estMinutes,
    mode_input: payload.mode,
    tags_input: payload.tags,
    questions_input: payload.questions.map((question) => ({
      type: question.type,
      prompt: question.prompt,
      options: question.options ?? [],
      correct_indexes: question.correctIndexes ?? [],
      acceptable_answers: question.acceptableAnswers ?? [],
      explanation: question.explanation ?? "",
      tags: question.tags ?? []
    }))
  });

  if (error) throw error;
  return String(data);
}

export async function listSectionAssignments(client: SupabaseClient, sectionId: string) {
  const { data, error } = await client
    .from("assignments")
    .select("id, section_id, quiz_set_id, title, instructions_md, due_at, allow_late, max_attempts, grading_mode, created_at")
    .eq("section_id", sectionId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as AssignmentRow[];
}

export async function createSectionAssignment(
  client: SupabaseClient,
  payload: {
    sectionId: string;
    quizSetId: string;
    title: string;
    instructionsMd?: string;
    dueAt?: string | null;
    allowLate?: boolean;
    maxAttempts?: number | null;
    gradingMode?: "auto" | "manual" | "mixed";
    createdBy: string;
  }
) {
  const { data, error } = await client
    .from("assignments")
    .insert({
      section_id: payload.sectionId,
      quiz_set_id: payload.quizSetId,
      title: payload.title,
      instructions_md: payload.instructionsMd ?? "",
      due_at: payload.dueAt ?? null,
      allow_late: Boolean(payload.allowLate),
      max_attempts: payload.maxAttempts ?? null,
      grading_mode: payload.gradingMode ?? "auto",
      created_by: payload.createdBy
    })
    .select("id, section_id, quiz_set_id, title, instructions_md, due_at, allow_late, max_attempts, grading_mode, created_at")
    .single();

  if (error) throw error;
  return data as AssignmentRow;
}

export async function listSectionMembers(client: SupabaseClient, sectionId: string) {
  const { data, error } = await client
    .from("section_members")
    .select("user_id, role, joined_at, profiles(display_name, email)")
    .eq("section_id", sectionId)
    .order("joined_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as SectionMemberRow[];
}

export async function listSectionMaterials(client: SupabaseClient, sectionId: string) {
  const { data, error } = await client
    .from("section_materials")
    .select("id, section_id, title, body_md, attachments, created_by, created_at, updated_at")
    .eq("section_id", sectionId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return ((data ?? []) as Array<Omit<SectionMaterialRow, "attachments"> & { attachments: unknown }>).map((row) => ({
    ...row,
    attachments: Array.isArray(row.attachments) ? row.attachments.map((item) => String(item)) : []
  }));
}

export async function createSectionMaterial(
  client: SupabaseClient,
  payload: {
    sectionId: string;
    title: string;
    bodyMd: string;
    attachments?: string[];
    createdBy: string;
  }
) {
  const { data, error } = await client
    .from("section_materials")
    .insert({
      section_id: payload.sectionId,
      title: payload.title,
      body_md: payload.bodyMd,
      attachments: payload.attachments ?? [],
      created_by: payload.createdBy
    })
    .select("id, section_id, title, body_md, attachments, created_by, created_at, updated_at")
    .single();

  if (error) throw error;
  const row = data as Omit<SectionMaterialRow, "attachments"> & { attachments: unknown };
  return {
    ...row,
    attachments: Array.isArray(row.attachments) ? row.attachments.map((item) => String(item)) : []
  } satisfies SectionMaterialRow;
}

export async function deleteSectionMaterial(client: SupabaseClient, materialId: string) {
  const { error } = await client.from("section_materials").delete().eq("id", materialId);
  if (error) throw error;
}

export async function listAssignmentSubmissions(client: SupabaseClient, assignmentId: string) {
  const { data, error } = await client
    .from("assignment_submissions")
    .select("id, assignment_id, user_id, attempt_id, status, score, feedback_md, graded_at, created_at")
    .eq("assignment_id", assignmentId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as AssignmentSubmissionRow[];
}

export async function submitAssignment(
  client: SupabaseClient,
  payload: { assignmentId: string; attemptId?: string | null }
) {
  const { data, error } = await client.rpc("submit_assignment", {
    assignment_id_input: payload.assignmentId,
    attempt_id_input: payload.attemptId ?? null
  });
  if (error) throw error;

  const first = (Array.isArray(data) ? data[0] : data) as
    | { submission_id?: string; status?: string; score?: number | null }
    | null;
  return {
    submissionId: first?.submission_id ?? "",
    status: first?.status ?? "submitted",
    score: first?.score ?? null
  };
}

export async function getSectionGradebook(client: SupabaseClient, sectionId: string) {
  const { data, error } = await client.rpc("get_section_gradebook", {
    section_id_input: sectionId
  });
  if (error) throw error;
  return (data ?? []) as SectionGradebookRow[];
}

export async function getSectionAnalytics(client: SupabaseClient, sectionId: string) {
  const { data, error } = await client.rpc("get_section_analytics", { section_id_input: sectionId });
  if (error) throw error;

  const row = (data?.[0] ?? {}) as {
    avg_score?: number;
    completion_count?: number;
    score_buckets?: Record<string, number>;
    weak_tags?: Array<{ tag: string; misses: number }>;
  };

  return {
    avg_score: Number(row.avg_score ?? 0),
    completion_count: Number(row.completion_count ?? 0),
    score_buckets: row.score_buckets ?? {},
    weak_tags: row.weak_tags ?? []
  } satisfies SectionAnalytics;
}
