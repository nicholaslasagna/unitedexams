import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAuthenticatedRouteContext, requireVerifiedProfessor } from "@/lib/auth/server-guards";
import { safeWriteAuditLog } from "@/lib/security/audit";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const paramsSchema = z.object({
  assignmentId: z.string().uuid()
});


export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ assignmentId: string }> }
) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  try {
    const routeContext = await requireAuthenticatedRouteContext(supabase);
    requireVerifiedProfessor(routeContext);
    const { assignmentId } = paramsSchema.parse(await context.params);

    const { data: assignment, error: assignmentLookupError } = await supabase
      .from("assignments")
      .select("id, section_id, quiz_set_id")
      .eq("id", assignmentId)
      .maybeSingle();

    if (assignmentLookupError || !assignment) {
      return NextResponse.json(
        { error: assignmentLookupError?.message || "Assignment not found." },
        { status: 404 }
      );
    }

    const { data: canManage, error: roleError } = await supabase.rpc("section_professor_exists", {
      section_id_input: assignment.section_id,
      user_id_input: routeContext.user.id
    });

    if (roleError || !canManage) {
      await safeWriteAuditLog(supabase, request, {
        action: "assignment.delete",
        targetType: "assignment",
        targetId: assignmentId,
        outcome: "denied",
        metadata: { sectionId: assignment.section_id, message: roleError?.message || "Section access denied" }
      });
      return NextResponse.json({ error: "Only section professors can delete assignments." }, { status: 403 });
    }

    const { error } = await supabase.from("assignments").delete().eq("id", assignmentId);

    if (error) {
      await safeWriteAuditLog(supabase, request, {
        action: "assignment.delete",
        targetType: "assignment",
        targetId: assignmentId,
        outcome: "error",
        metadata: { sectionId: assignment.section_id, message: error.message }
      });
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await safeWriteAuditLog(supabase, request, {
      action: "assignment.delete",
      targetType: "assignment",
      targetId: assignmentId,
      metadata: { sectionId: assignment.section_id, quizSetId: assignment.quiz_set_id }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete assignment.";
    const status = /unauthorized/i.test(message) ? 401 : /professor access/i.test(message) ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
