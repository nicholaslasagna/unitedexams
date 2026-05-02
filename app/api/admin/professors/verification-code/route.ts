import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAuthenticatedRouteContext, requireUniversityAdmin } from "@/lib/auth/server-guards";
import { safeWriteAuditLog } from "@/lib/security/audit";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const rotateCodeSchema = z.object({
  code: z.string().trim().min(8).max(48),
  expiresAt: z.string().datetime().nullable().optional()
});

export const runtime = "edge";

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  try {
    const context = await requireAuthenticatedRouteContext(supabase);
    requireUniversityAdmin(context);
    const payload = rotateCodeSchema.parse(await request.json());

    const { error } = await supabase.rpc("rotate_professor_verification_code", {
      code_input: payload.code,
      expires_at_input: payload.expiresAt ?? null
    });

    if (error) {
      await safeWriteAuditLog(supabase, request, {
        action: "admin.professor_code.rotate",
        targetType: "university_professor_verification_code",
        outcome: "error",
        metadata: { message: error.message, expiresAt: payload.expiresAt ?? null }
      });
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await safeWriteAuditLog(supabase, request, {
      action: "admin.professor_code.rotate",
      targetType: "university_professor_verification_code",
      metadata: { expiresAt: payload.expiresAt ?? null }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to rotate code.";
    const status = /unauthorized/i.test(message) ? 401 : /university-admin access/i.test(message) ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
