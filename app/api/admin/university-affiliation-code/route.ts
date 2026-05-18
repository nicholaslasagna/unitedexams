import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAuthenticatedRouteContext, requireUniversityAdmin } from "@/lib/auth/server-guards";
import { safeWriteAuditLog } from "@/lib/security/audit";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const payloadSchema = z.object({
  code: z.string().trim().min(8).max(128),
  assignedEmail: z.string().trim().email().nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  maxUses: z.literal(1).optional()
});

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  try {
    const routeContext = await requireAuthenticatedRouteContext(supabase);
    requireUniversityAdmin(routeContext);
    const payload = payloadSchema.parse(await request.json());

    const { data, error } = await supabase.rpc("create_university_affiliation_code", {
      code_input: payload.code,
      assigned_email_input: payload.assignedEmail ?? null,
      expires_at_input: payload.expiresAt ?? null,
      max_uses_input: payload.maxUses ?? 1
    });

    if (error) {
      await safeWriteAuditLog(supabase, request, {
        action: "admin.university_affiliation_code.create",
        targetType: "university",
        targetId: routeContext.profile.university_id ?? undefined,
        outcome: "error",
        metadata: { message: error.message }
      });
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await safeWriteAuditLog(supabase, request, {
      action: "admin.university_affiliation_code.create",
      targetType: "university",
      targetId: routeContext.profile.university_id ?? undefined,
      metadata: {
        assignedEmail: payload.assignedEmail ?? null,
        maxUses: payload.maxUses ?? 1
      }
    });

    return NextResponse.json({ ok: true, code: data?.[0] ?? null });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create university affiliation code.";
    const status = /unauthorized/i.test(message)
      ? 401
      : /university-admin access/i.test(message)
        ? 403
        : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
