import type { SupabaseClient } from "@supabase/supabase-js";

export type ExamMode = "timed" | "practice";
export type ShowResultsAfter = "immediate" | "window_close" | "manual_release";

export interface ExamRow {
  id: string;
  section_id: string;
  title: string;
  description: string | null;
  quiz_set_id: string | null;
  mode: ExamMode;
  starts_at: string;
  ends_at: string;
  duration_minutes: number;
  attempt_limit: number;
  shuffle_questions: boolean;
  shuffle_options: boolean;
  show_results_after: ShowResultsAfter;
  published: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ExamAccessRuleRow {
  exam_id: string;
  require_section_membership: boolean;
  require_proctor_code: boolean;
  require_network_allowlist: boolean;
  allowed_ip_hashes: string[];
  allow_mobile_hotspot: boolean;
  block_vpn: boolean;
  lockdown_mode: boolean;
  open_notes_allowed: boolean;
  suspicion_threshold: number;
}

export interface ExamMonitorRow {
  attempt_id: string;
  student_id: string;
  student_display_name: string;
  started_at: string | null;
  submitted_at: string | null;
  expires_at: string | null;
  status: string;
  score: number | null;
  suspicion_score: number;
  flagged: boolean;
  time_remaining_seconds: number;
}

export interface ExamEventTimelineRow {
  exam_attempt_id: string;
  student_id: string;
  student_display_name: string;
  event_type: string;
  event_payload: Record<string, unknown>;
  created_at: string;
}

export interface ExamStartConfig {
  exam_id: string;
  section_id: string;
  quiz_set_id: string | null;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string;
  duration_minutes: number;
  attempt_limit: number;
  shuffle_questions: boolean;
  shuffle_options: boolean;
  show_results_after: ShowResultsAfter;
  mode: ExamMode;
  published: boolean;
  lockdown_mode: boolean;
  require_proctor_code: boolean;
  require_network_allowlist: boolean;
  open_notes_allowed: boolean;
}

export interface StartExamResponse {
  attemptId: string;
  expiresAt: string;
  examEndsAt: string;
  durationMinutes: number;
  status: string;
}

export interface SubmitExamResponse {
  score: number;
  correctCount: number;
  totalCount: number;
  suspicionScore: number;
  resultsAvailable: boolean;
  showResultsAfter: ShowResultsAfter;
  status: string;
}

export interface HeartbeatResponse {
  timeRemainingSeconds: number;
  status: string;
  suspicionScore: number;
  flagged: boolean;
  activeSessions: number;
  expiresAt: string | null;
}

async function parseJsonResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  const payload = (await response.json().catch(() => ({}))) as T & { error?: string; ok?: boolean };
  if (!response.ok || ("ok" in payload && payload.ok === false)) {
    throw new Error(payload.error || fallbackMessage);
  }
  return payload;
}

export async function listSectionExams(client: SupabaseClient, sectionId: string) {
  const { data, error } = await client
    .from("exams")
    .select(
      "id, section_id, title, description, quiz_set_id, mode, starts_at, ends_at, duration_minutes, attempt_limit, shuffle_questions, shuffle_options, show_results_after, published, created_by, created_at, updated_at"
    )
    .eq("section_id", sectionId)
    .order("starts_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as ExamRow[];
}

export async function listEnrolledPublishedExams(client: SupabaseClient) {
  const { data, error } = await client
    .from("exams")
    .select(
      "id, section_id, title, description, quiz_set_id, mode, starts_at, ends_at, duration_minutes, attempt_limit, shuffle_questions, shuffle_options, show_results_after, published, created_by, created_at, updated_at"
    )
    .eq("published", true)
    .order("starts_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as ExamRow[];
}

export async function getExam(client: SupabaseClient, examId: string) {
  const { data, error } = await client
    .from("exams")
    .select(
      "id, section_id, title, description, quiz_set_id, mode, starts_at, ends_at, duration_minutes, attempt_limit, shuffle_questions, shuffle_options, show_results_after, published, created_by, created_at, updated_at"
    )
    .eq("id", examId)
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as ExamRow | null;
}

export async function getExamAccessRules(client: SupabaseClient, examId: string) {
  const { data, error } = await client
    .from("exam_access_rules")
    .select(
      "exam_id, require_section_membership, require_proctor_code, require_network_allowlist, allowed_ip_hashes, allow_mobile_hotspot, block_vpn, lockdown_mode, open_notes_allowed, suspicion_threshold"
    )
    .eq("exam_id", examId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  const row = data as Omit<ExamAccessRuleRow, "allowed_ip_hashes"> & { allowed_ip_hashes: unknown };
  return {
    ...row,
    allowed_ip_hashes: Array.isArray(row.allowed_ip_hashes)
      ? row.allowed_ip_hashes.map((item) => String(item))
      : []
  } satisfies ExamAccessRuleRow;
}

export async function createExam(
  _client: SupabaseClient,
  payload: Omit<ExamRow, "id" | "created_at" | "updated_at">
) {
  const response = await fetch("/api/professor/exams", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sectionId: payload.section_id,
      title: payload.title,
      description: payload.description,
      quizSetId: payload.quiz_set_id,
      mode: payload.mode,
      startsAt: payload.starts_at,
      endsAt: payload.ends_at,
      durationMinutes: payload.duration_minutes,
      attemptLimit: payload.attempt_limit,
      shuffleQuestions: payload.shuffle_questions,
      shuffleOptions: payload.shuffle_options,
      showResultsAfter: payload.show_results_after,
      published: payload.published
    })
  });
  const result = await parseJsonResponse<{ ok: true; exam: ExamRow }>(response, "Unable to create exam.");
  return result.exam;
}

export async function updateExam(
  _client: SupabaseClient,
  examId: string,
  payload: Partial<Omit<ExamRow, "id" | "section_id" | "created_by" | "created_at" | "updated_at">>
) {
  const response = await fetch(`/api/professor/exams/${examId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: payload.title,
      description: payload.description,
      quizSetId: payload.quiz_set_id,
      mode: payload.mode,
      startsAt: payload.starts_at,
      endsAt: payload.ends_at,
      durationMinutes: payload.duration_minutes,
      attemptLimit: payload.attempt_limit,
      shuffleQuestions: payload.shuffle_questions,
      shuffleOptions: payload.shuffle_options,
      showResultsAfter: payload.show_results_after,
      published: payload.published
    })
  });
  const result = await parseJsonResponse<{ ok: true; exam: ExamRow }>(response, "Unable to update exam.");
  return result.exam;
}

export async function upsertExamAccessRules(
  _client: SupabaseClient,
  payload: {
    examId: string;
    requireSectionMembership: boolean;
    requireProctorCode: boolean;
    proctorCode?: string;
    clearProctorCode?: boolean;
    requireNetworkAllowlist: boolean;
    allowMobileHotspot: boolean;
    blockVpn: boolean;
    lockdownMode: boolean;
    suspicionThreshold: number;
    openNotesAllowed?: boolean;
  }
) {
  const response = await fetch(`/api/professor/exams/${payload.examId}/access-rules`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  await parseJsonResponse<{ ok: true }>(response, "Unable to update exam access rules.");
}

export async function addCurrentNetworkAllowlist(examId: string) {
  const response = await fetch(`/api/professor/exams/${examId}/network`, {
    method: "POST"
  });
  const payload = (await response.json().catch(() => ({}))) as {
    ok?: boolean;
    error?: string;
    addedIpHash?: string;
    totalAllowed?: number;
  };
  if (!response.ok || !payload.ok) {
    throw new Error(payload.error || "Unable to add current network.");
  }
  return payload;
}

export async function removeAllowedNetwork(examId: string, ipHash: string) {
  const response = await fetch(`/api/professor/exams/${examId}/network`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ipHash })
  });
  const payload = (await response.json().catch(() => ({}))) as {
    ok?: boolean;
    error?: string;
    totalAllowed?: number;
  };
  if (!response.ok || !payload.ok) {
    throw new Error(payload.error || "Unable to remove network.");
  }
  return payload;
}

export async function getExamStartConfig(client: SupabaseClient, examId: string) {
  const preferred = await client.rpc("get_exam_start_config_v2", { exam_id_input: examId });
  if (!preferred.error) {
    const preferredRow = (Array.isArray(preferred.data) ? preferred.data[0] : preferred.data) as ExamStartConfig | null;
    return preferredRow ?? null;
  }

  const fallback = await client.rpc("get_exam_start_config", { exam_id_input: examId });
  if (fallback.error) throw fallback.error;
  const fallbackRow = (Array.isArray(fallback.data) ? fallback.data[0] : fallback.data) as
    | (Omit<ExamStartConfig, "open_notes_allowed"> & { open_notes_allowed?: boolean | null })
    | null;
  if (!fallbackRow) return null;
  return {
    ...fallbackRow,
    open_notes_allowed: Boolean(fallbackRow.open_notes_allowed)
  } satisfies ExamStartConfig;
}

export async function startExamSession(payload: {
  examId: string;
  proctorCode?: string;
  turnstileToken?: string;
}) {
  const response = await fetch("/api/exam/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const body = (await response.json().catch(() => ({}))) as {
    ok?: boolean;
    error?: string;
    attemptId?: string;
    expiresAt?: string;
    examEndsAt?: string;
    durationMinutes?: number;
    status?: string;
  };
  if (!response.ok || !body.ok || !body.attemptId || !body.expiresAt || !body.examEndsAt) {
    throw new Error(body.error || "Unable to start exam.");
  }
  return {
    attemptId: body.attemptId,
    expiresAt: body.expiresAt,
    examEndsAt: body.examEndsAt,
    durationMinutes: body.durationMinutes ?? 0,
    status: body.status ?? "in_progress"
  } satisfies StartExamResponse;
}

export async function submitExamSession(payload: { attemptId: string; answers: Record<string, number[]> }) {
  const response = await fetch("/api/exam/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const body = (await response.json().catch(() => ({}))) as {
    ok?: boolean;
    error?: string;
    score?: number;
    correctCount?: number;
    totalCount?: number;
    suspicionScore?: number;
    resultsAvailable?: boolean;
    showResultsAfter?: ShowResultsAfter;
    status?: string;
  };
  if (!response.ok || !body.ok) {
    throw new Error(body.error || "Unable to submit exam.");
  }
  return {
    score: Number(body.score ?? 0),
    correctCount: Number(body.correctCount ?? 0),
    totalCount: Number(body.totalCount ?? 0),
    suspicionScore: Number(body.suspicionScore ?? 0),
    resultsAvailable: Boolean(body.resultsAvailable),
    showResultsAfter: body.showResultsAfter ?? "window_close",
    status: body.status ?? "submitted"
  } satisfies SubmitExamResponse;
}

export async function logExamRuntimeEvent(payload: {
  attemptId: string;
  eventType: string;
  payload?: Record<string, unknown>;
}) {
  const response = await fetch("/api/exam/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const body = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
  if (!response.ok || !body.ok) {
    throw new Error(body.error || "Unable to log exam event.");
  }
}

export async function heartbeatExamSession(payload: {
  attemptId: string;
  sessionId: string;
  visibilityState?: string;
}) {
  const response = await fetch("/api/exam/heartbeat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const body = (await response.json().catch(() => ({}))) as {
    ok?: boolean;
    error?: string;
    timeRemainingSeconds?: number;
    status?: string;
    suspicionScore?: number;
    flagged?: boolean;
    activeSessions?: number;
    expiresAt?: string | null;
  };
  if (!response.ok || !body.ok) {
    throw new Error(body.error || "Heartbeat failed.");
  }
  return {
    timeRemainingSeconds: Number(body.timeRemainingSeconds ?? 0),
    status: body.status ?? "in_progress",
    suspicionScore: Number(body.suspicionScore ?? 0),
    flagged: Boolean(body.flagged),
    activeSessions: Number(body.activeSessions ?? 1),
    expiresAt: body.expiresAt ?? null
  } satisfies HeartbeatResponse;
}

export async function getExamMonitor(client: SupabaseClient, examId: string) {
  const { data, error } = await client.rpc("get_exam_monitor", {
    exam_id_input: examId
  });
  if (error) throw error;
  return (data ?? []) as ExamMonitorRow[];
}

export async function getExamEvents(client: SupabaseClient, examId: string, attemptId?: string | null) {
  const { data, error } = await client.rpc("get_exam_events", {
    exam_id_input: examId,
    attempt_id_input: attemptId ?? null
  });
  if (error) throw error;
  return (data ?? []) as ExamEventTimelineRow[];
}
