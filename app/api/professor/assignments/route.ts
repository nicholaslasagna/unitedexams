import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAuthenticatedRouteContext, requireVerifiedProfessor } from "@/lib/auth/server-guards";
import { safeWriteAuditLog } from "@/lib/security/audit";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const createAssignmentSchema = z.object({
  sectionId: z.string().uuid(),
  quizSetId: z.string().uuid(),
  title: z.string().trim().min(1).max(160),
  instructionsMd: z.string().trim().max(12000).optional(),
  dueAt: z.string().datetime().optional().nullable(),
  allowLate: z.boolean().optional(),
  maxAttempts: z.number().int().min(1).max(50).optional().nullable(),
  gradingMode: z.enum(["auto", "manual", "mixed"]).optional()
});

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  try {
    const context = await requireAuthenticatedRouteContext(supabase);
    requireVerifiedProfessor(context);
    const payload = createAssignmentSchema.parse(await request.json());

    const { data: canManage, error: roleError } = await supabase.rpc("section_professor_exists", {
      section_id_input: payload.sectionId,
      user_id_input: context.user.id
    });

    if (roleError || !canManage) {
      await safeWriteAuditLog(supabase, request, {
        action: "assignment.create",
        targetType: "assignment",
        outcome: "denied",
        metadata: { sectionId: payload.sectionId, message: roleError?.message || "Section access denied" }
      });
      return NextResponse.json({ error: "Only section professors can create assignments." }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("assignments")
      .insert({
        section_id: payload.sectionId,
        quiz_set_id: payload.quizSetId,
        title: payload.title,
        instructions_md: payload.instructionsMd ?? "",
        due_at: payload.dueAt ?? null,
        allow_late: Boolean(payload.allowLate),
        max_attempts: payload.maxAttempts ?? null,
        grading_mode: payload.gradingMode ?? "auto",
        created_by: context.user.id
      })
      .select(
        "id, section_id, quiz_set_id, title, instructions_md, due_at, allow_late, max_attempts, grading_mode, created_at"
      )
      .single();

    if (error || !data) {
      await safeWriteAuditLog(supabase, request, {
        action: "assignment.create",
        targetType: "assignment",
        outcome: "error",
        metadata: { sectionId: payload.sectionId, message: error?.message || "Insert failed" }
      });
      return NextResponse.json({ error: error?.message || "Unable to create assignment." }, { status: 400 });
    }

    const { data: professorQuestion } = await supabase
      .from("questions")
      .select("quiz_set_id")
      .eq("quiz_set_id", payload.quizSetId)
      .eq("from_professor", true)
      .limit(1)
      .maybeSingle();

    if (professorQuestion) {
      const linkResult = await supabase.from("section_quiz_sets").upsert(
        {
          section_id: payload.sectionId,
          quiz_set_id: payload.quizSetId,
          created_by: context.user.id
        },
        {
          onConflict: "section_id,quiz_set_id",
          ignoreDuplicates: false
        }
      );

      if (linkResult.error && !linkResult.error.message.toLowerCase().includes("section_quiz_sets")) {
        return NextResponse.json({ error: linkResult.error.message }, { status: 400 });
      }
    }

    await safeWriteAuditLog(supabase, request, {
      action: "assignment.create",
      targetType: "assignment",
      targetId: data.id,
      metadata: { sectionId: payload.sectionId, quizSetId: payload.quizSetId }
    });

    return NextResponse.json({ ok: true, assignment: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create assignment.";
    const status = /unauthorized/i.test(message) ? 401 : /professor access/i.test(message) ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
