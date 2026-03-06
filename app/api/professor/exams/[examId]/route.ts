import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAuthenticatedRouteContext, requireVerifiedProfessor } from "@/lib/auth/server-guards";
import { safeWriteAuditLog } from "@/lib/security/audit";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const paramsSchema = z.object({
  examId: z.string().uuid()
});

const updateExamSchema = z.object({
  title: z.string().trim().min(3).max(160).optional(),
  description: z.string().trim().max(4000).nullable().optional(),
  quizSetId: z.string().uuid().nullable().optional(),
  mode: z.enum(["timed", "practice"]).optional(),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
  durationMinutes: z.number().int().min(1).max(360).optional(),
  attemptLimit: z.number().int().min(1).max(20).optional(),
  shuffleQuestions: z.boolean().optional(),
  shuffleOptions: z.boolean().optional(),
  showResultsAfter: z.enum(["immediate", "window_close", "manual_release"]).optional(),
  published: z.boolean().optional()
});

export const runtime = "nodejs";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ examId: string }> }
) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  try {
    const routeContext = await requireAuthenticatedRouteContext(supabase);
    requireVerifiedProfessor(routeContext);
    const { examId } = paramsSchema.parse(await context.params);
    const payload = updateExamSchema.parse(await request.json());

    const { data: exam, error: examLookupError } = await supabase
      .from("exams")
      .select("id, section_id")
      .eq("id", examId)
      .maybeSingle();

    if (examLookupError || !exam) {
      return NextResponse.json({ error: examLookupError?.message || "Exam not found." }, { status: 404 });
    }

    const { data: canManage, error: roleError } = await supabase.rpc("section_professor_exists", {
      section_id_input: exam.section_id,
      user_id_input: routeContext.user.id
    });

    if (roleError || !canManage) {
      await safeWriteAuditLog(supabase, request, {
        action: "exam.update",
        targetType: "exam",
        targetId: examId,
        outcome: "denied",
        metadata: { sectionId: exam.section_id, message: roleError?.message || "Section access denied" }
      });
      return NextResponse.json({ error: "Only section professors can update exams." }, { status: 403 });
    }

    const updates: Record<string, unknown> = {};
    if (payload.title !== undefined) updates.title = payload.title;
    if (payload.description !== undefined) updates.description = payload.description;
    if (payload.quizSetId !== undefined) updates.quiz_set_id = payload.quizSetId;
    if (payload.mode !== undefined) updates.mode = payload.mode;
    if (payload.startsAt !== undefined) updates.starts_at = payload.startsAt;
    if (payload.endsAt !== undefined) updates.ends_at = payload.endsAt;
    if (payload.durationMinutes !== undefined) updates.duration_minutes = payload.durationMinutes;
    if (payload.attemptLimit !== undefined) updates.attempt_limit = payload.attemptLimit;
    if (payload.shuffleQuestions !== undefined) updates.shuffle_questions = payload.shuffleQuestions;
    if (payload.shuffleOptions !== undefined) updates.shuffle_options = payload.shuffleOptions;
    if (payload.showResultsAfter !== undefined) updates.show_results_after = payload.showResultsAfter;
    if (payload.published !== undefined) updates.published = payload.published;

    const { data, error } = await supabase
      .from("exams")
      .update(updates)
      .eq("id", examId)
      .select(
        "id, section_id, title, description, quiz_set_id, mode, starts_at, ends_at, duration_minutes, attempt_limit, shuffle_questions, shuffle_options, show_results_after, published, created_by, created_at, updated_at"
      )
      .single();

    if (error || !data) {
      await safeWriteAuditLog(supabase, request, {
        action: "exam.update",
        targetType: "exam",
        targetId: examId,
        outcome: "error",
        metadata: { sectionId: exam.section_id, message: error?.message || "Update failed" }
      });
      return NextResponse.json({ error: error?.message || "Unable to update exam." }, { status: 400 });
    }

    await safeWriteAuditLog(supabase, request, {
      action: "exam.update",
      targetType: "exam",
      targetId: examId,
      metadata: { sectionId: exam.section_id, updatedFields: Object.keys(updates) }
    });

    return NextResponse.json({ ok: true, exam: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update exam.";
    const status = /unauthorized/i.test(message) ? 401 : /professor access/i.test(message) ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
