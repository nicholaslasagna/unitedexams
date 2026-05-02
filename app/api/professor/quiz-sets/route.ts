import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAuthenticatedRouteContext, requireVerifiedProfessor } from "@/lib/auth/server-guards";
import { safeWriteAuditLog } from "@/lib/security/audit";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const questionSchema = z.object({
  type: z.enum(["single", "multi", "fill", "free"]),
  prompt: z.string().trim().min(1).max(12000),
  options: z.array(z.string().trim().max(1000)).optional(),
  correctIndexes: z.array(z.number().int().min(0)).optional(),
  acceptableAnswers: z.array(z.string().trim().max(1000)).optional(),
  explanation: z.string().trim().max(12000).optional(),
  tags: z.array(z.string().trim().max(120)).optional()
});

const createQuizSetSchema = z.object({
  sectionId: z.string().uuid(),
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().max(4000).optional(),
  difficulty: z.enum(["intro", "medium", "hard"]),
  estMinutes: z.number().int().min(1).max(360),
  mode: z.enum(["quiz", "exam", "homework"]),
  tags: z.array(z.string().trim().max(120)).max(24),
  questions: z.array(questionSchema).min(1).max(500)
});

export const runtime = "edge";

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  try {
    const context = await requireAuthenticatedRouteContext(supabase);
    requireVerifiedProfessor(context);
    const payload = createQuizSetSchema.parse(await request.json());

    const { data, error } = await supabase.rpc("create_professor_quiz_set", {
      section_id_input: payload.sectionId,
      title_input: payload.title,
      description_input: payload.description ?? "",
      difficulty_input: payload.difficulty,
      est_minutes_input: payload.estMinutes,
      mode_input: payload.mode,
      tags_input: payload.tags,
      questions_input: payload.questions.map((question) => ({
        type: question.type,
        prompt: question.prompt,
        options: question.options ?? [],
        correct_indexes: question.correctIndexes ?? [],
        acceptable_answers: question.acceptableAnswers ?? [],
        explanation: question.explanation ?? "",
        tags: question.tags ?? []
      }))
    });

    if (error) {
      await safeWriteAuditLog(supabase, request, {
        action: "quiz_set.create",
        targetType: "quiz_set",
        outcome: "error",
        metadata: { message: error.message, sectionId: payload.sectionId }
      });
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const quizSetId = String(data);
    await safeWriteAuditLog(supabase, request, {
      action: "quiz_set.create",
      targetType: "quiz_set",
      targetId: quizSetId,
      metadata: { sectionId: payload.sectionId, questionCount: payload.questions.length }
    });

    return NextResponse.json({ ok: true, quizSetId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create quiz set.";
    const status = /unauthorized/i.test(message) ? 401 : /professor access/i.test(message) ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
