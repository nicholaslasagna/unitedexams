import type { SupabaseClient } from "@supabase/supabase-js";

export interface SectionSummary {
  id: string;
  name: string;
  term: string | null;
  course_id: string;
  join_code: string;
  created_at: string;
}

export interface AssignmentRow {
  id: string;
  section_id: string;
  quiz_set_id: string;
  due_at: string | null;
  created_at: string;
}

export interface SectionAnalytics {
  avg_score: number;
  completion_count: number;
  score_buckets: Record<string, number>;
  weak_tags: Array<{ tag: string; misses: number }>;
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
  const { data, error } = await client
    .from("class_sections")
    .insert({
      name: payload.name,
      term: payload.term ?? null,
      course_id: payload.courseId,
      created_by: payload.createdBy
    })
    .select("id, name, term, course_id, join_code, created_at")
    .single();

  if (error) throw error;
  return data as SectionSummary;
}

export async function regenerateJoinCode(client: SupabaseClient, sectionId: string) {
  const { data, error } = await client.rpc("regenerate_section_join_code", {
    section_id_input: sectionId
  });
  if (error) throw error;
  return data as string;
}

export async function joinSectionByCode(client: SupabaseClient, joinCode: string) {
  const { data, error } = await client.rpc("join_section_by_code", {
    join_code_input: joinCode.trim().toUpperCase()
  });
  if (error) throw error;
  return data as string;
}

export async function listSectionAssignments(client: SupabaseClient, sectionId: string) {
  const { data, error } = await client
    .from("assignments")
    .select("id, section_id, quiz_set_id, due_at, created_at")
    .eq("section_id", sectionId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as AssignmentRow[];
}

export async function createSectionAssignment(
  client: SupabaseClient,
  payload: { sectionId: string; quizSetId: string; dueAt?: string | null; createdBy: string }
) {
  const { data, error } = await client
    .from("assignments")
    .insert({
      section_id: payload.sectionId,
      quiz_set_id: payload.quizSetId,
      due_at: payload.dueAt ?? null,
      created_by: payload.createdBy
    })
    .select("id, section_id, quiz_set_id, due_at, created_at")
    .single();

  if (error) throw error;
  return data as AssignmentRow;
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
