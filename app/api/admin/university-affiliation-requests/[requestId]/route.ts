import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAuthenticatedRouteContext, requireUniversityAdmin } from "@/lib/auth/server-guards";
import { safeWriteAuditLog } from "@/lib/security/audit";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const paramsSchema = z.object({
  requestId: z.string().uuid()
});

const payloadSchema = z.object({
  approved: z.boolean(),
  note: z.string().trim().max(500).nullable().optional()
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ requestId: string }> }
) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  try {
    const routeContext = await requireAuthenticatedRouteContext(supabase);
    requireUniversityAdmin(routeContext);
    const { requestId } = paramsSchema.parse(await context.params);
    const payload = payloadSchema.parse(await request.json());

    const { data, error } = await supabase.rpc("review_university_affiliation_request", {
      request_id_input: requestId,
      approved_input: payload.approved,
      note_input: payload.note ?? null
    });

    if (error) {
      await safeWriteAuditLog(supabase, request, {
        action: "admin.university_affiliation.review",
        targetType: "university_affiliation_request",
        targetId: requestId,
        outcome: "error",
        metadata: { approved: payload.approved, message: error.message }
      });
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await safeWriteAuditLog(supabase, request, {
      action: "admin.university_affiliation.review",
      targetType: "university_affiliation_request",
      targetId: requestId,
      metadata: { approved: payload.approved }
    });

    return NextResponse.json({ ok: true, request: data?.[0] ?? null });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to review university affiliation request.";
    const status = /unauthorized/i.test(message)
      ? 401
      : /university-admin access/i.test(message)
        ? 403
        : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
