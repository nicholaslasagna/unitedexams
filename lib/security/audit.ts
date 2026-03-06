import type { SupabaseClient } from "@supabase/supabase-js";
import { getClientIp, hashIpForStorage } from "@/lib/auth/ip-protection";

type AuditOutcome = "success" | "denied" | "error";

export interface AuditEventInput {
  action: string;
  targetType: string;
  targetId?: string | null;
  outcome?: AuditOutcome;
  metadata?: Record<string, unknown>;
}

function resolveRequestId(headers: Headers) {
  return (
    headers.get("x-request-id") ||
    headers.get("x-vercel-id") ||
    headers.get("cf-ray") ||
    null
  );
}

export async function writeAuditLog(
  supabase: SupabaseClient,
  request: Request,
  input: AuditEventInput
) {
  const ipAddress = getClientIp(request.headers);
  const ipHash = ipAddress ? await hashIpForStorage(ipAddress) : null;
  const url = new URL(request.url);

  const { error } = await supabase.rpc("write_audit_log", {
    action_input: input.action,
    target_type_input: input.targetType,
    target_id_input: input.targetId ?? null,
    outcome_input: input.outcome ?? "success",
    ip_hash_input: ipHash,
    request_path_input: url.pathname,
    request_method_input: request.method,
    request_id_input: resolveRequestId(request.headers),
    metadata_input: input.metadata ?? {}
  });

  if (error) {
    throw error;
  }
}

export async function safeWriteAuditLog(
  supabase: SupabaseClient,
  request: Request,
  input: AuditEventInput
) {
  try {
    await writeAuditLog(supabase, request, input);
  } catch {
    // Audit writes should not block primary workflows.
  }
}
