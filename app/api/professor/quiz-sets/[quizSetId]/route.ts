import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAuthenticatedRouteContext, requireVerifiedProfessor } from "@/lib/auth/server-guards";
import { safeWriteAuditLog } from "@/lib/security/audit";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const paramsSchema = z.object({
  quizSetId: z.string().uuid()
});

export const runtime = "edge";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ quizSetId: string }> }
) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  try {
    const routeContext = await requireAuthenticatedRouteContext(supabase);
    requireVerifiedProfessor(routeContext);
    const { quizSetId } = paramsSchema.parse(await context.params);

    const { error } = await supabase.rpc("delete_professor_quiz_set", {
      quiz_set_id_input: quizSetId
    });

    if (error) {
      await safeWriteAuditLog(supabase, request, {
        action: "quiz_set.delete",
        targetType: "quiz_set",
        targetId: quizSetId,
        outcome: "error",
        metadata: { message: error.message }
      });
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await safeWriteAuditLog(supabase, request, {
      action: "quiz_set.delete",
      targetType: "quiz_set",
      targetId: quizSetId
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete quiz set.";
    const status = /unauthorized/i.test(message) ? 401 : /professor access/i.test(message) ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
