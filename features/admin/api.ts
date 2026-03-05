import type { SupabaseClient } from "@supabase/supabase-js";

export interface ManagedProfessorRow {
  professor_id: string;
  display_name: string;
  email: string | null;
  professor_verified: boolean;
  professor_verified_at: string | null;
  created_at: string;
}

export interface ProfessorCodeStatusRow {
  university_id: string;
  university_name: string;
  has_active_code: boolean;
  expires_at: string | null;
  updated_at: string | null;
}

export async function getManagedProfessors(client: SupabaseClient) {
  const { data, error } = await client.rpc("get_managed_professors");
  if (error) throw error;
  return (data ?? []) as ManagedProfessorRow[];
}

export async function getProfessorVerificationCodeStatus(client: SupabaseClient) {
  const { data, error } = await client.rpc("get_professor_verification_code_status");
  if (error) throw error;
  return ((data ?? [])[0] ?? null) as ProfessorCodeStatusRow | null;
}

export async function rotateProfessorVerificationCode(
  client: SupabaseClient,
  payload: { code: string; expiresAt: string | null }
) {
  const { error } = await client.rpc("rotate_professor_verification_code", {
    code_input: payload.code,
    expires_at_input: payload.expiresAt
  });
  if (error) throw error;
}

export async function setManagedProfessorVerification(
  client: SupabaseClient,
  payload: { professorId: string; approved: boolean }
) {
  const { error } = await client.rpc("set_managed_professor_verification_status", {
    professor_id_input: payload.professorId,
    approved_input: payload.approved
  });
  if (error) throw error;
}
