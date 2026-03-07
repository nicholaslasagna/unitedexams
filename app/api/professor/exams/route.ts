import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAuthenticatedRouteContext, requireVerifiedProfessor } from "@/lib/auth/server-guards";
import { safeWriteAuditLog } from "@/lib/security/audit";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const createExamSchema = z.object({
  sectionId: z.string().uuid(),
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().max(4000).nullable().optional(),
  quizSetId: z.string().uuid().nullable().optional(),
  mode: z.enum(["timed", "practice"]),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  durationMinutes: z.number().int().min(1).max(360),
  attemptLimit: z.number().int().min(1).max(20),
  shuffleQuestions: z.boolean(),
  shuffleOptions: z.boolean(),
  showResultsAfter: z.enum(["immediate", "window_close", "manual_release"]),
  published: z.boolean()
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
    const payload = createExamSchema.parse(await request.json());

    const { data: canManage, error: roleError } = await supabase.rpc("section_professor_exists", {
      section_id_input: payload.sectionId,
      user_id_input: context.user.id
    });

    if (roleError || !canManage) {
      await safeWriteAuditLog(supabase, request, {
        action: "exam.create",
        targetType: "exam",
        outcome: "denied",
        metadata: { sectionId: payload.sectionId, message: roleError?.message || "Section access denied" }
      });
      return NextResponse.json({ error: "Only section professors can create exams." }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("exams")
      .insert({
        section_id: payload.sectionId,
        title: payload.title,
        description: payload.description ?? null,
        quiz_set_id: payload.quizSetId ?? null,
        mode: payload.mode,
        starts_at: payload.startsAt,
        ends_at: payload.endsAt,
        duration_minutes: payload.durationMinutes,
        attempt_limit: payload.attemptLimit,
        shuffle_questions: payload.shuffleQuestions,
        shuffle_options: payload.shuffleOptions,
        show_results_after: payload.showResultsAfter,
        published: payload.published,
        created_by: context.user.id
      })
      .select(
        "id, section_id, title, description, quiz_set_id, mode, starts_at, ends_at, duration_minutes, attempt_limit, shuffle_questions, shuffle_options, show_results_after, published, created_by, created_at, updated_at"
      )
      .single();

    if (error || !data) {
      await safeWriteAuditLog(supabase, request, {
        action: "exam.create",
        targetType: "exam",
        outcome: "error",
        metadata: { sectionId: payload.sectionId, message: error?.message || "Insert failed" }
      });
      return NextResponse.json({ error: error?.message || "Unable to create exam." }, { status: 400 });
    }

    if (payload.quizSetId) {
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
    }

    await safeWriteAuditLog(supabase, request, {
      action: "exam.create",
      targetType: "exam",
      targetId: data.id,
      metadata: { sectionId: payload.sectionId }
    });

    return NextResponse.json({ ok: true, exam: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create exam.";
    const status = /unauthorized/i.test(message) ? 401 : /professor access/i.test(message) ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
