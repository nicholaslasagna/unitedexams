import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAuthenticatedRouteContext, requireUniversityAdmin } from "@/lib/auth/server-guards";
import { safeWriteAuditLog } from "@/lib/security/audit";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const paramsSchema = z.object({
  professorId: z.string().uuid()
});

const setVerificationSchema = z.object({
  approved: z.boolean()
});

export const runtime = "edge";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ professorId: string }> }
) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  try {
    const routeContext = await requireAuthenticatedRouteContext(supabase);
    requireUniversityAdmin(routeContext);
    const { professorId } = paramsSchema.parse(await context.params);
    const payload = setVerificationSchema.parse(await request.json());

    const { error } = await supabase.rpc("set_managed_professor_verification_status", {
      professor_id_input: professorId,
      approved_input: payload.approved
    });

    if (error) {
      await safeWriteAuditLog(supabase, request, {
        action: "admin.professor_verification.set",
        targetType: "profile",
        targetId: professorId,
        outcome: "error",
        metadata: { approved: payload.approved, message: error.message }
      });
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await safeWriteAuditLog(supabase, request, {
      action: "admin.professor_verification.set",
      targetType: "profile",
      targetId: professorId,
      metadata: { approved: payload.approved }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update professor status.";
    const status = /unauthorized/i.test(message) ? 401 : /university-admin access/i.test(message) ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
