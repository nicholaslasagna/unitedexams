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

async function parseJsonResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  const payload = (await response.json().catch(() => ({}))) as T & { error?: string; ok?: boolean };
  if (!response.ok || ("ok" in payload && payload.ok === false)) {
    throw new Error(payload.error || fallbackMessage);
  }
  return payload;
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
  _client: SupabaseClient,
  payload: { code: string; expiresAt: string | null }
) {
  const response = await fetch("/api/admin/professors/verification-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  await parseJsonResponse<{ ok: true }>(response, "Unable to rotate code.");
}

export async function setManagedProfessorVerification(
  _client: SupabaseClient,
  payload: { professorId: string; approved: boolean }
) {
  const response = await fetch(`/api/admin/professors/${payload.professorId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ approved: payload.approved })
  });
  await parseJsonResponse<{ ok: true }>(response, "Unable to update professor status.");
}
