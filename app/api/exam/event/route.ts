import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const eventSchema = z.object({
  attemptId: z.string().uuid(),
  eventType: z.string().trim().min(2).max(64),
  payload: z.record(z.string(), z.unknown()).optional()
});

export const runtime = "nodejs";

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

  let payload: z.infer<typeof eventSchema>;
  try {
    payload = eventSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid exam event payload." }, { status: 400 });
  }

  const { error } = await supabase.rpc("log_exam_event", {
    attempt_id_input: payload.attemptId,
    event_type_input: payload.eventType,
    payload_input: payload.payload ?? {}
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
