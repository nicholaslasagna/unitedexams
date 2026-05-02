import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getClientIp, hashIpForStorage } from "@/lib/auth/ip-protection";
import {
  getTurnstileClientIp,
  isTurnstileConfigured,
  verifyTurnstileToken
} from "@/lib/security/turnstile";

const startExamSchema = z.object({
  examId: z.string().uuid(),
  proctorCode: z.string().max(64).optional(),
  turnstileToken: z.string().optional()
});


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

  let payload: z.infer<typeof startExamSchema>;
  try {
    payload = startExamSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid exam start payload." }, { status: 400 });
  }

  if (isTurnstileConfigured()) {
    const token = payload.turnstileToken?.trim() || "";
    if (!token) {
      return NextResponse.json({ error: "Verification required to start exam." }, { status: 400 });
    }

    const turnstileResult = await verifyTurnstileToken(token, {
      expectedAction: "exam-start",
      remoteIp: getTurnstileClientIp(request.headers),
      softFail: false
    });
    if (!turnstileResult.ok) {
      return NextResponse.json(
        { error: turnstileResult.reason || "Unable to verify exam start request." },
        { status: 400 }
      );
    }
  }

  const ipAddress = getClientIp(request.headers);
  const ipHash = ipAddress ? await hashIpForStorage(ipAddress) : null;
  const userAgent = request.headers.get("user-agent")?.slice(0, 200) ?? null;

  const { data, error } = await supabase.rpc("start_exam", {
    exam_id_input: payload.examId,
    proctor_code_input: payload.proctorCode?.trim() || null,
    turnstile_token_input: payload.turnstileToken?.trim() || null,
    ip_hash_input: ipHash,
    user_agent_input: userAgent
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const row = (Array.isArray(data) ? data[0] : data) as
    | {
        attempt_id: string;
        expires_at: string;
        exam_ends_at: string;
        duration_minutes: number;
        status: string;
      }
    | null;

  if (!row?.attempt_id) {
    return NextResponse.json({ error: "Unable to start exam." }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    attemptId: row.attempt_id,
    expiresAt: row.expires_at,
    examEndsAt: row.exam_ends_at,
    durationMinutes: row.duration_minutes,
    status: row.status
  });
}
