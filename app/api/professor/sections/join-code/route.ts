import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAuthenticatedRouteContext, requireVerifiedProfessor } from "@/lib/auth/server-guards";
import { safeWriteAuditLog } from "@/lib/security/audit";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const regenerateSchema = z.object({
  sectionId: z.string().uuid()
});


export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  try {
    const context = await requireAuthenticatedRouteContext(supabase);
    requireVerifiedProfessor(context);
    const payload = regenerateSchema.parse(await request.json());

    const { data, error } = await supabase.rpc("regenerate_section_join_code", {
      section_id_input: payload.sectionId
    });

    if (error) {
      await safeWriteAuditLog(supabase, request, {
        action: "section.join_code.regenerate",
        targetType: "class_section",
        targetId: payload.sectionId,
        outcome: "error",
        metadata: { message: error.message }
      });
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await safeWriteAuditLog(supabase, request, {
      action: "section.join_code.regenerate",
      targetType: "class_section",
      targetId: payload.sectionId
    });

    return NextResponse.json({ ok: true, joinCode: String(data) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to regenerate join code.";
    const status = /unauthorized/i.test(message) ? 401 : /professor access/i.test(message) ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
