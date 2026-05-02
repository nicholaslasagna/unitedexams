import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getClientIp, hashIpForStorage } from "@/lib/auth/ip-protection";

const heartbeatSchema = z.object({
  attemptId: z.string().uuid(),
  sessionId: z.string().trim().min(3).max(120),
  visibilityState: z.string().trim().max(32).optional()
});

export const runtime = "edge";

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: z.infer<typeof heartbeatSchema>;
  try {
    payload = heartbeatSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid heartbeat payload." }, { status: 400 });
  }

  const ipAddress = getClientIp(request.headers);
  const ipHash = ipAddress ? await hashIpForStorage(ipAddress) : null;
  const userAgent = request.headers.get("user-agent")?.slice(0, 200) ?? null;

  const { data, error } = await supabase.rpc("heartbeat_exam_attempt", {
    attempt_id_input: payload.attemptId,
    session_id_input: payload.sessionId,
    ip_hash_input: ipHash,
    user_agent_input: userAgent,
    visibility_state_input: payload.visibilityState ?? null
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const row = (Array.isArray(data) ? data[0] : data) as
    | {
        time_remaining_seconds: number;
        status: string;
        suspicion_score: number;
        flagged: boolean;
        active_sessions: number;
        expires_at: string;
      }
    | null;

  if (!row) {
    return NextResponse.json({ error: "No heartbeat status returned." }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    timeRemainingSeconds: Number(row.time_remaining_seconds ?? 0),
    status: row.status,
    suspicionScore: Number(row.suspicion_score ?? 0),
    flagged: Boolean(row.flagged),
    activeSessions: Number(row.active_sessions ?? 0),
    expiresAt: row.expires_at
  });
}
